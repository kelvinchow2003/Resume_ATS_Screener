// =============================================================================
// src/app/evaluate/page.tsx
// The main evaluation page. Handles:
//   1. PDF upload + text extraction via /api/parse-pdf
//   2. Parallel execution of all 3 ATS engines
//   3. Saving results to Supabase
//   4. Rendering the full results dashboard inline (no redirect needed)
// =============================================================================

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import UploadZone, { type UploadZoneSubmitPayload } from "@/components/upload/UploadZone";
import CompositeScore from "@/components/results/CompositeScore";
import ScoreCard from "@/components/results/ScoreCard";
import KeywordGrid from "@/components/results/KeywordGrid";
import AIFeedbackPanel from "@/components/results/AIFeedbackPanel";
import type {
  EvaluationResult,
  LegacyATSResult,
  SemanticATSResult,
  AIRecruiterResult,
  ParsePDFResponse,
  APIError,
} from "@/types/evaluation";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type PageState = "idle" | "parsing" | "running" | "done" | "error";

interface EngineStatus {
  legacy: "pending" | "running" | "done" | "error";
  semantic: "pending" | "running" | "done" | "error";
  ai: "pending" | "running" | "done" | "error";
}

// -----------------------------------------------------------------------------
// Helper: POST to an engine API route and return typed JSON
// -----------------------------------------------------------------------------
async function callEngine<T>(
  endpoint: string,
  resumeText: string,
  jobDescription: string
): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as APIError;
    throw new Error(err.error ?? `${endpoint} returned ${res.status}`);
  }

  return data as T;
}

// -----------------------------------------------------------------------------
// Helper: parse PDF via multipart form POST
// -----------------------------------------------------------------------------
async function parsePDF(file: File): Promise<ParsePDFResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/parse-pdf", { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    const err = data as APIError;
    throw new Error(err.error ?? `PDF parse failed with status ${res.status}`);
  }

  return data as ParsePDFResponse;
}

// -----------------------------------------------------------------------------
// Loading step indicator
// -----------------------------------------------------------------------------
function StepIndicator({
  status,
  engines,
}: {
  status: PageState;
  engines: EngineStatus;
}) {
  const steps: {
    key: keyof EngineStatus | "parse";
    label: string;
    state: "pending" | "running" | "done" | "error";
  }[] = [
    {
      key: "parse",
      label: "Extracting PDF text",
      state:
        status === "idle"
          ? "pending"
          : status === "parsing"
          ? "running"
          : "done",
    },
    { key: "legacy",   label: "Legacy ATS — keyword scan",       state: engines.legacy   },
    { key: "semantic", label: "Semantic ATS — Cohere embeddings", state: engines.semantic },
    { key: "ai",       label: "AI Recruiter — Gemini analysis",   state: engines.ai       },
  ];

  const icon = (state: typeof steps[0]["state"]) => {
    if (state === "done")
      return (
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    if (state === "running")
      return (
        <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      );
    if (state === "error")
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    return <div className="w-4 h-4 rounded-full border border-slate-600" />;
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      {steps.map((step) => (
        <div key={step.key} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {icon(step.state)}
          </div>
          <span
            className={`text-sm transition-colors ${
              step.state === "running"
                ? "text-white font-medium"
                : step.state === "done"
                ? "text-slate-400"
                : step.state === "error"
                ? "text-red-400"
                : "text-slate-600"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Results layout
// -----------------------------------------------------------------------------
function ResultsView({ result }: { result: EvaluationResult }) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Composite score — full width */}
      <CompositeScore
        score={result.compositeScore}
        legacyScore={result.legacy.score}
        semanticScore={result.semantic.score}
        aiScore={result.aiRecruiter.Score}
      />

      {/* 3 engine cards in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard engine={{ type: "legacy",       data: result.legacy       }} delay={0}   />
        <ScoreCard engine={{ type: "semantic",     data: result.semantic     }} delay={120} />
        <ScoreCard engine={{ type: "ai-recruiter", data: result.aiRecruiter  }} delay={240} />
      </div>

      {/* Keyword grid — full width */}
      <KeywordGrid
        matchedKeywords={result.legacy.matchedKeywords}
        missingKeywords={result.legacy.missingKeywords}
      />

      {/* AI Feedback panel — full width */}
      <AIFeedbackPanel result={result.aiRecruiter} />

      {/* Run another evaluation */}
      <div className="text-center pt-4 pb-8">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl border border-slate-700 text-sm font-medium
                     text-slate-400 hover:border-slate-600 hover:text-slate-200
                     transition-all duration-150"
        >
          ← Run another evaluation
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main page component
// -----------------------------------------------------------------------------
export default function EvaluatePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [engineStatus, setEngineStatus] = useState<EngineStatus>({
    legacy: "pending",
    semantic: "pending",
    ai: "pending",
  });
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  function setEngine(key: keyof EngineStatus, state: EngineStatus[keyof EngineStatus]) {
    setEngineStatus((prev) => ({ ...prev, [key]: state }));
  }

  async function handleSubmit({ file, jobDescription }: UploadZoneSubmitPayload) {
    setPageState("parsing");
    setErrorMsg(null);
    setResult(null);
    setEngineStatus({ legacy: "pending", semantic: "pending", ai: "pending" });

    try {
      // --- Step 1: Parse PDF ---
      const { text: resumeText } = await parsePDF(file);

      // --- Step 2: Save resume record to Supabase (optional — only if authenticated) ---
      const { data: { user } } = await supabase.auth.getUser();
      let resumeId: string | undefined;

      if (user) {
        const { data: resumeRow } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            file_name: file.name,
            parsed_text: resumeText,
          })
          .select("id")
          .single();
        resumeId = resumeRow?.id;
      }

      // --- Step 3: Run all 3 engines in parallel ---
      setPageState("running");
      setEngine("legacy",   "running");
      setEngine("semantic", "running");
      setEngine("ai",       "running");

      const [legacy, semantic, aiRecruiter] = await Promise.all([
        callEngine<LegacyATSResult>(
          "/api/engines/legacy", resumeText, jobDescription
        ).then((r) => { setEngine("legacy", "done"); return r; })
         .catch((e) => { setEngine("legacy", "error"); throw e; }),

        callEngine<SemanticATSResult>(
          "/api/engines/semantic", resumeText, jobDescription
        ).then((r) => { setEngine("semantic", "done"); return r; })
         .catch((e) => { setEngine("semantic", "error"); throw e; }),

        callEngine<AIRecruiterResult>(
          "/api/engines/ai-recruiter", resumeText, jobDescription
        ).then((r) => { setEngine("ai", "done"); return r; })
         .catch((e) => { setEngine("ai", "error"); throw e; }),
      ]);

      // --- Step 4: Compute composite score (Legacy 30% + Semantic 30% + AI 40%) ---
      const compositeScore =
        Math.round((legacy.score * 0.3 + semantic.score * 0.3 + aiRecruiter.Score * 0.4) * 10) / 10;

      const evaluation: EvaluationResult = {
        resumeId,
        jobDescription,
        legacy,
        semantic,
        aiRecruiter,
        compositeScore,
      };

      // --- Step 5: Persist evaluation to Supabase (only if authenticated) ---
      if (user) {
        const { data: evalRow } = await supabase
          .from("evaluations")
          .insert({
            user_id:          user.id,
            resume_id:        resumeId,
            job_description:  jobDescription,
            legacy_score:     legacy.score,
            legacy_matched:   legacy.matchedKeywords,
            legacy_missing:   legacy.missingKeywords,
            legacy_details:   legacy,
            semantic_score:   semantic.score,
            semantic_details: semantic,
            ai_score:         aiRecruiter.Score,
            ai_verdict:       aiRecruiter.Verdict,
            ai_feedback:      aiRecruiter.Feedback,
            ai_pros:          aiRecruiter.Pros,
            ai_cons:          aiRecruiter.Cons,
            ai_details:       aiRecruiter,
          })
          .select("id")
          .single();

        evaluation.id = evalRow?.id;
      }

      setResult(evaluation);
      setPageState("done");
    } catch (err) {
      console.error("[evaluate]", err);
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setPageState("error");
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-200">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/4 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-violet-600/4 blur-[100px] rounded-full" />
      </div>

      <div className="relative px-4 py-12">

        {/* ---- IDLE: show the upload form ---- */}
        {pageState === "idle" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <span className="font-mono text-lg font-bold text-white tracking-tight">
                  ATS<span className="text-blue-400">.</span>Benchmarker
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Benchmark your resume
              </h1>
              <p className="text-sm text-slate-500">
                Upload your PDF and paste the job description — we run 3 ATS simulations in parallel.
              </p>
            </div>

            <UploadZone onSubmit={handleSubmit} isLoading={false} />
          </div>
        )}

        {/* ---- PARSING / RUNNING: loading state ---- */}
        {(pageState === "parsing" || pageState === "running") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">
                {pageState === "parsing" ? "Reading your resume…" : "Running 3 ATS engines…"}
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                This usually takes 10–20 seconds.
              </p>
            </div>
            <StepIndicator status={pageState} engines={engineStatus} />
          </div>
        )}

        {/* ---- ERROR state ---- */}
        {pageState === "error" && (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-red-300 bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3 font-mono">
                {errorMsg}
              </p>
            </div>

            <button
              onClick={() => setPageState("idle")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600
                         text-sm font-semibold text-white hover:from-blue-500 hover:to-violet-500
                         transition-all duration-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* ---- DONE: show results ---- */}
        {pageState === "done" && result && (
          <ResultsView result={result} />
        )}
      </div>
    </div>
  );
}