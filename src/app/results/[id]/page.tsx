// =============================================================================
// src/app/results/[id]/page.tsx
// Detail view for a single saved evaluation.
// Server Component — fetches the evaluation row by ID from Supabase,
// reconstructs the typed engine results, and passes them to a client
// component for rendering (because the result components use hooks).
// =============================================================================

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type {
  EvaluationRow,
  LegacyATSResult,
  SemanticATSResult,
  AIRecruiterResult,
} from "@/types/evaluation";
import ResultsClient from "./ResultsClient";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
export default async function ResultsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check — middleware also guards /results, this is a safety net
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/results/" + id);
  }

  // Fetch the single evaluation row, scoped to the current user
  const { data: row, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    notFound();
  }

  const evaluation = row as EvaluationRow;

  // ---- Reconstruct typed engine results from stored JSON/columns ----
  const legacy: LegacyATSResult = (evaluation.legacy_details as LegacyATSResult) ?? {
    score: evaluation.legacy_score ?? 0,
    matchedKeywords: evaluation.legacy_matched ?? [],
    missingKeywords: evaluation.legacy_missing ?? [],
    totalJDKeywords:
      (evaluation.legacy_matched?.length ?? 0) +
      (evaluation.legacy_missing?.length ?? 0),
    matchRate: 0,
  };

  const semantic: SemanticATSResult = (evaluation.semantic_details as SemanticATSResult) ?? {
    score: evaluation.semantic_score ?? 0,
    rawSimilarity: 0,
    interpretation: "",
  };

  const aiRecruiter: AIRecruiterResult = (evaluation.ai_details as AIRecruiterResult) ?? {
    Score: evaluation.ai_score ?? 0,
    Verdict:
      (evaluation.ai_verdict as AIRecruiterResult["Verdict"]) ?? "Not a Fit",
    Feedback: evaluation.ai_feedback ?? "",
    Pros: evaluation.ai_pros ?? [],
    Cons: evaluation.ai_cons ?? [],
  };

  const compositeScore = evaluation.composite_score ?? 0;

  // Format date
  const dateStr = new Date(evaluation.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // JD preview
  const jdSnippet =
    evaluation.job_description.length > 300
      ? evaluation.job_description.slice(0, 300) + "…"
      : evaluation.job_description;

  // ---------------------------------------------------------------------------
  return (
    <div className="relative bg-[#0b0d14] text-slate-200">
      {/* Background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/4 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-10 min-h-[calc(100vh-4rem)]">
        {/* ---- Breadcrumb row ---- */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <span className="text-xs text-slate-600 hidden sm:block">{dateStr}</span>
        </div>

        {/* ---- Job description context ---- */}
        <div className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Job Description
            </p>
            <span className="text-xs text-slate-600 sm:hidden">{dateStr}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
            {jdSnippet}
          </p>
        </div>

        {/* ---- Full results (client component for animations) ---- */}
        <ResultsClient
          compositeScore={compositeScore}
          legacy={legacy}
          semantic={semantic}
          aiRecruiter={aiRecruiter}
        />

        {/* ---- Action buttons ---- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-10">
          <Link
            href="/evaluate"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600
                       text-sm font-semibold text-white hover:from-blue-500 hover:to-violet-500
                       transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            Run new evaluation
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-medium
                       text-slate-400 hover:border-slate-600 hover:text-slate-200
                       transition-all duration-150"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
