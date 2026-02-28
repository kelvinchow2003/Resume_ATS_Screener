// =============================================================================
// src/components/results/KeywordGrid.tsx
// Visual layout for matched vs. missing keywords from the Legacy ATS engine.
// Supports search filtering and All / Matched / Missing tab views.
// =============================================================================

"use client";

import { useState, useMemo, useEffect } from "react";

interface KeywordGridProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

type FilterMode = "all" | "matched" | "missing";

// -----------------------------------------------------------------------------
// Individual keyword chip
// -----------------------------------------------------------------------------
function Chip({ word, matched }: { word: string; matched: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        text-xs font-mono border cursor-default select-none
        transition-all duration-120
        ${
          matched
            ? "bg-emerald-950/40 border-emerald-500/25 text-emerald-300 hover:bg-emerald-950/60 hover:border-emerald-500/40"
            : "bg-red-950/30 border-red-500/20 text-red-300 hover:bg-red-950/50 hover:border-red-500/35"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          matched ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {word}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function KeywordGrid({
  matchedKeywords,
  missingKeywords,
}: KeywordGridProps) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const [barWidth, setBarWidth] = useState(0);

  const total = matchedKeywords.length + missingKeywords.length;
  const matchPct = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

  // Animate the progress bar on mount
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(matchPct), 200);
    return () => clearTimeout(t);
  }, [matchPct]);

  // Derive visible keyword lists from filter + search state
  const visibleMatched = useMemo(() => {
    if (filter === "missing") return [];
    const q = search.toLowerCase().trim();
    return q
      ? matchedKeywords.filter((k) => k.includes(q))
      : matchedKeywords;
  }, [matchedKeywords, filter, search]);

  const visibleMissing = useMemo(() => {
    if (filter === "matched") return [];
    const q = search.toLowerCase().trim();
    return q
      ? missingKeywords.filter((k) => k.includes(q))
      : missingKeywords;
  }, [missingKeywords, filter, search]);

  const totalVisible = visibleMatched.length + visibleMissing.length;

  // Pill colour for the match-% badge
  const pctPillClass =
    matchPct >= 70
      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
      : matchPct >= 45
      ? "bg-amber-950/40 border-amber-500/30 text-amber-400"
      : "bg-red-950/40 border-red-500/30 text-red-400";

  return (
    <div className="bg-[#111420] border border-slate-800 rounded-2xl p-5 shadow-lg">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"
              />
            </svg>
            Keyword Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {matchedKeywords.length} of {total} JD keywords found in your resume
          </p>
        </div>

        {/* Match % badge */}
        <div
          className={`text-xs font-bold font-mono px-3 py-1.5 rounded-lg border ${pctPillClass}`}
        >
          {matchPct}% match
        </div>
      </div>

      {/* Match progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
          style={{
            width: `${barWidth}%`,
            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      {/* Controls: search + filter tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords…"
            className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700
                       text-sm text-slate-300 placeholder-slate-600 font-mono outline-none
                       focus:border-slate-600 focus:ring-1 focus:ring-slate-600/50
                       transition-colors duration-150"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex bg-slate-900 rounded-xl p-1 gap-0.5">
          {(
            [
              { mode: "all",     label: "All",     count: total                   },
              { mode: "matched", label: "Matched", count: matchedKeywords.length  },
              { mode: "missing", label: "Missing", count: missingKeywords.length  },
            ] as { mode: FilterMode; label: string; count: number }[]
          ).map(({ mode, label, count }) => {
            const isActive = filter === mode;
            const activeClass =
              mode === "matched" && isActive
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                : mode === "missing" && isActive
                ? "bg-red-950/60 text-red-400 border border-red-500/20"
                : isActive
                ? "bg-slate-800 text-white"
                : "";

            return (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  flex items-center gap-1.5
                  ${isActive ? activeClass : "text-slate-500 hover:text-slate-300"}
                `}
              >
                {label}
                <span className="font-mono text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyword chip cloud */}
      <div className="min-h-[72px]">
        {totalVisible === 0 ? (
          <div className="flex items-center justify-center h-[72px] text-sm text-slate-600">
            {search ? "No keywords match your search." : "No keywords to display."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {/* Missing first so they appear at the top-left — most actionable */}
            {visibleMissing.map((kw) => (
              <Chip key={`missing-${kw}`} word={kw} matched={false} />
            ))}
            {visibleMatched.map((kw) => (
              <Chip key={`matched-${kw}`} word={kw} matched={true} />
            ))}
          </div>
        )}
      </div>

      {/* Legend + clear search */}
      <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Found in resume
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Missing from resume
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Clear search ✕
          </button>
        )}
      </div>
    </div>
  );
}
