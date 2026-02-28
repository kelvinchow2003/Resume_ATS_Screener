// =============================================================================
// src/components/results/ScoreCard.tsx
// Reusable card for a single ATS engine result.
// Uses a discriminated union prop to stay fully type-safe across all 3 engines.
// =============================================================================

"use client";

import { useEffect, useState } from "react";
import type { LegacyATSResult, SemanticATSResult, AIRecruiterResult } from "@/types/evaluation";

// -----------------------------------------------------------------------------
// Discriminated union — one prop, three shapes, zero `any`
// -----------------------------------------------------------------------------
export type ScoreCardEngine =
  | { type: "legacy";       data: LegacyATSResult }
  | { type: "semantic";     data: SemanticATSResult }
  | { type: "ai-recruiter"; data: AIRecruiterResult };

interface ScoreCardProps {
  engine: ScoreCardEngine;
  /** Stagger delay for mount animation (ms) */
  delay?: number;
}

// -----------------------------------------------------------------------------
// Per-engine static metadata
// -----------------------------------------------------------------------------
const ENGINE_META = {
  legacy: {
    name: "Legacy ATS",
    subtitle: "Keyword Frequency Matching",
    tag: "DETERMINISTIC",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/20",
    iconColour: "text-amber-400",
    tagBg: "bg-amber-500/10",
    tagBorder: "border-amber-500/20",
    tagColour: "text-amber-400",
    barColour: "bg-amber-400",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  semantic: {
    name: "Semantic ATS",
    subtitle: "Cohere Embedding Similarity",
    tag: "EMBEDDINGS",
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/20",
    iconColour: "text-sky-400",
    tagBg: "bg-sky-500/10",
    tagBorder: "border-sky-500/20",
    tagColour: "text-sky-400",
    barColour: "bg-sky-400",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
      </svg>
    ),
  },
  "ai-recruiter": {
    name: "AI Recruiter",
    subtitle: "Gemini 1.5 Flash Evaluation",
    tag: "LLM",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/20",
    iconColour: "text-violet-400",
    tagBg: "bg-violet-500/10",
    tagBorder: "border-violet-500/20",
    tagColour: "text-violet-400",
    barColour: "bg-violet-400",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-1.587c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
} as const;

// -----------------------------------------------------------------------------
// Mini SVG ring progress indicator
// -----------------------------------------------------------------------------
function ScoreRing({ score, strokeClass }: { score: number; strokeClass: string }) {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setFilled(score), 300);
    return () => clearTimeout(t);
  }, [score]);

  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (filled / 100) * circumference;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#1e2235" strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={strokeClass}
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Numeric score → colour classes
// -----------------------------------------------------------------------------
function scoreColours(score: number): { text: string; stroke: string } {
  if (score >= 70) return { text: "text-emerald-400", stroke: "stroke-emerald-400" };
  if (score >= 45) return { text: "text-amber-400",   stroke: "stroke-amber-400"   };
  return              { text: "text-red-400",          stroke: "stroke-red-400"     };
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function ScoreCard({ engine, delay = 0 }: ScoreCardProps) {
  const [visible, setVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const meta = ENGINE_META[engine.type];

  // Extract the numeric score from the discriminated union
  const score =
    engine.type === "ai-recruiter" ? engine.data.Score : engine.data.score;

  const { text: scoreText, stroke: scoreStroke } = scoreColours(score);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    const t2 = setTimeout(() => setBarWidth(score), delay + 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay, score]);

  return (
    <div
      className={`
        bg-[#111420] border border-slate-800 rounded-2xl p-5 shadow-lg
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center
              ${meta.iconBg} border ${meta.iconBorder} ${meta.iconColour}`}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{meta.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
          </div>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2 py-1 rounded-md border
            ${meta.tagBg} ${meta.tagColour} ${meta.tagBorder}`}
        >
          {meta.tag}
        </span>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-4 mb-5">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <ScoreRing score={score} strokeClass={scoreStroke} />
          {/* Centre label inside the ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold font-mono ${scoreText}`}>
              {score.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Score number + subtitle */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold font-mono tracking-tight ${scoreText}`}>
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500 font-mono">/ 100</span>
          </div>

          {/* Engine-specific subtitle */}
          {engine.type === "legacy" && (
            <p className="text-xs text-slate-500 mt-0.5">
              {engine.data.matchedKeywords.length} / {engine.data.totalJDKeywords} keywords matched
            </p>
          )}
          {engine.type === "semantic" && (
            <p className="text-xs text-slate-500 mt-0.5">
              {engine.data.interpretation}
            </p>
          )}
          {engine.type === "ai-recruiter" && (
            <p className={`text-xs font-semibold mt-0.5 ${meta.tagColour}`}>
              {engine.data.Verdict}
            </p>
          )}
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${meta.barColour}`}
          style={{
            width: `${barWidth}%`,
            transition: `width 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 200}ms`,
          }}
        />
      </div>

      {/* Engine-specific detail section */}

      {/* Legacy: matched vs missing count cells */}
      {engine.type === "legacy" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold font-mono text-emerald-400">
              {engine.data.matchedKeywords.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">matched</div>
          </div>
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-center">
            <div className="text-lg font-bold font-mono text-red-400">
              {engine.data.missingKeywords.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">missing</div>
          </div>
        </div>
      )}

      {/* Semantic: raw cosine similarity */}
      {engine.type === "semantic" && (
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Raw cosine similarity</span>
            <span className="text-xs font-mono text-sky-400">
              {engine.data.rawSimilarity.toFixed(4)}
            </span>
          </div>
        </div>
      )}

      {/* AI Recruiter: truncated feedback preview */}
      {engine.type === "ai-recruiter" && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {engine.data.Feedback}
        </p>
      )}
    </div>
  );
}
