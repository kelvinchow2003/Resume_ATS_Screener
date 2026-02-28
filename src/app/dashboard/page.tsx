// =============================================================================
// src/app/dashboard/page.tsx
// Authenticated dashboard — shows the user's evaluation history.
// This is a Server Component that fetches evaluations from Supabase.
// =============================================================================

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/types/evaluation";

// -----------------------------------------------------------------------------
// Helper: format a score into a colour class
// -----------------------------------------------------------------------------
function scoreColour(score: number | null): string {
  if (score === null) return "text-slate-500";
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-red-400";
}

function verdictPill(verdict: string | null): string {
  if (!verdict) return "bg-slate-800 text-slate-400 border-slate-700";
  if (verdict === "Strong Match")
    return "bg-emerald-950/40 text-emerald-400 border-emerald-500/30";
  if (verdict === "Moderate Match")
    return "bg-amber-950/40 text-amber-400 border-amber-500/30";
  if (verdict === "Weak Match")
    return "bg-orange-950/40 text-orange-400 border-orange-500/30";
  return "bg-red-950/40 text-red-400 border-red-500/30";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// -----------------------------------------------------------------------------
// Empty state
// -----------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-2">
        No evaluations yet
      </h3>
      <p className="text-sm text-slate-500 mb-8 max-w-xs">
        Upload your resume and paste a job description to get your first ATS
        benchmark score.
      </p>
      <Link
        href="/evaluate"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600
                   text-sm font-semibold text-white hover:from-blue-500 hover:to-violet-500
                   transition-all duration-200 shadow-lg shadow-blue-500/20"
      >
        Run your first evaluation →
      </Link>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Evaluation history row
// -----------------------------------------------------------------------------
function EvaluationRow({ row }: { row: EvaluationRow }) {
  const snippet =
    row.job_description.slice(0, 120) +
    (row.job_description.length > 120 ? "…" : "");

  return (
    <Link
      href={`/results/${row.id}`}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl
                 bg-slate-800/30 border border-slate-800 hover:border-slate-700
                 hover:bg-slate-800/50 transition-all duration-150"
    >
      {/* Composite score circle */}
      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl
                      bg-[#0f1222] border border-slate-800 group-hover:border-slate-700">
        <span className={`text-xl font-bold font-mono ${scoreColour(row.composite_score)}`}>
          {row.composite_score !== null ? Math.round(row.composite_score) : "—"}
        </span>
      </div>

      {/* JD snippet + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 leading-snug line-clamp-2">{snippet}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs text-slate-600">{formatDate(row.created_at)}</span>
          {row.ai_verdict && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${verdictPill(row.ai_verdict)}`}
            >
              {row.ai_verdict}
            </span>
          )}
        </div>
      </div>

      {/* Engine score pills */}
      <div className="flex gap-2 flex-shrink-0">
        {[
          { label: "KW",  score: row.legacy_score,   colour: "text-amber-400"  },
          { label: "SEM", score: row.semantic_score,  colour: "text-sky-400"    },
          { label: "AI",  score: row.ai_score,        colour: "text-violet-400" },
        ].map(({ label, score, colour }) => (
          <div
            key={label}
            className="flex flex-col items-center px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <span className={`text-xs font-bold font-mono ${colour}`}>
              {score !== null ? Math.round(score) : "—"}
            </span>
            <span className="text-xs text-slate-600 mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 hidden sm:block transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// -----------------------------------------------------------------------------
// Page (Server Component)
// -----------------------------------------------------------------------------
export default async function DashboardPage() {
  const supabase = await createClient();

  // Validate session — middleware handles the redirect but this is a safety net
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch this user's evaluations, newest first
  const { data: evaluations, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[dashboard] Supabase error:", error);
  }

  const rows = (evaluations ?? []) as EvaluationRow[];

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-200">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/3 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="font-mono text-base font-bold text-white">
                ATS<span className="text-blue-400">.</span>Benchmarker
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {user.email} · {rows.length} evaluation{rows.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Link
            href="/evaluate"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600
                       text-sm font-semibold text-white hover:from-blue-500 hover:to-violet-500
                       transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New evaluation
          </Link>
        </div>

        {/* Evaluation list or empty state */}
        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 font-mono uppercase tracking-wider mb-4">
              Recent evaluations
            </p>
            {rows.map((row) => (
              <EvaluationRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}