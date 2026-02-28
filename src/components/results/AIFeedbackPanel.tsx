// =============================================================================
// src/components/results/AIFeedbackPanel.tsx
// Displays the AI Recruiter (Gemini) structured evaluation:
//   — Verdict badge
//   — Score bar + holistic feedback paragraph
//   — Collapsible Pros (strengths) list
//   — Collapsible Cons (gaps) list
//   — Gemini attribution footer
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import type { AIRecruiterResult } from "@/types/evaluation";

interface AIFeedbackPanelProps {
  result: AIRecruiterResult;
}

// -----------------------------------------------------------------------------
// Verdict → visual metadata
// -----------------------------------------------------------------------------
type VerdictStyle = {
  textColour: string;
  bg: string;
  border: string;
  icon: string;
  scoreFill: string;
};

const VERDICT_STYLES: Record<AIRecruiterResult["Verdict"], VerdictStyle> = {
  "Strong Match":   { textColour: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-500/30", icon: "✦", scoreFill: "bg-emerald-400" },
  "Moderate Match": { textColour: "text-amber-400",   bg: "bg-amber-950/40",   border: "border-amber-500/30",   icon: "◈", scoreFill: "bg-amber-400"   },
  "Weak Match":     { textColour: "text-orange-400",  bg: "bg-orange-950/40",  border: "border-orange-500/30",  icon: "◇", scoreFill: "bg-orange-400"  },
  "Not a Fit":      { textColour: "text-red-400",     bg: "bg-red-950/40",     border: "border-red-500/30",     icon: "✕", scoreFill: "bg-red-400"     },
};

// -----------------------------------------------------------------------------
// Stagger-animated list item
// -----------------------------------------------------------------------------
function ListItem({
  text,
  type,
  index,
}: {
  text: string;
  type: "pro" | "con";
  index: number;
}) {
  const isPro = type === "pro";
  return (
    <li
      className="flex gap-3 items-start text-sm leading-relaxed"
      style={{
        animationDelay: `${index * 70}ms`,
        animation: "fadeSlideUp 0.35s ease-out both",
      }}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
          ${isPro
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400"
          }`}
      >
        {isPro ? "+" : "−"}
      </span>
      <span className="text-slate-300">{text}</span>
    </li>
  );
}

// -----------------------------------------------------------------------------
// Collapsible section header button
// -----------------------------------------------------------------------------
function SectionToggle({
  label,
  count,
  open,
  onToggle,
  type,
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  type: "pro" | "con";
}) {
  const isPro = type === "pro";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        w-full flex items-center justify-between p-3 rounded-xl border
        transition-all duration-150
        ${isPro
          ? "bg-emerald-950/20 border-emerald-500/15 hover:bg-emerald-950/30 hover:border-emerald-500/25"
          : "bg-red-950/20 border-red-500/12 hover:bg-red-950/30 hover:border-red-500/22"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${isPro ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
        >
          {isPro ? "+" : "−"}
        </span>
        <span
          className={`text-sm font-semibold ${isPro ? "text-emerald-300" : "text-red-300"}`}
        >
          {label}
        </span>
        <span className="text-xs text-slate-600 font-mono">({count})</span>
      </div>
      <svg
        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function AIFeedbackPanel({ result }: AIFeedbackPanelProps) {
  const [prosOpen, setProsOpen] = useState(true);
  const [consOpen, setConsOpen] = useState(true);
  const [scoreBarWidth, setScoreBarWidth] = useState(0);

  const style = VERDICT_STYLES[result.Verdict];

  // Animate the score bar on mount
  useEffect(() => {
    const t = setTimeout(() => setScoreBarWidth(result.Score), 300);
    return () => clearTimeout(t);
  }, [result.Score]);

  return (
    <>
      {/* Keyframe — inline so no Tailwind plugin needed */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      <div className="bg-[#111420] border border-slate-800 rounded-2xl p-5 shadow-lg">

        {/* ---- Header ---- */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-1.587c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">AI Recruiter Report</h3>
            <p className="text-xs text-slate-500 mt-0.5">Powered by Gemini 1.5 Flash</p>
          </div>

          {/* Verdict badge */}
          <div
            className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 flex-shrink-0
              ${style.bg} ${style.border} ${style.textColour}`}
          >
            <span>{style.icon}</span>
            {result.Verdict}
          </div>
        </div>

        {/* ---- Score + Feedback block ---- */}
        <div className={`rounded-xl p-4 border mb-5 ${style.bg} ${style.border}`}>
          {/* Score row */}
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-3xl font-bold font-mono ${style.textColour}`}>
              {result.Score}
            </span>
            <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${style.scoreFill}`}
                style={{
                  width: `${scoreBarWidth}%`,
                  transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>

          {/* Holistic feedback paragraph */}
          <p className="text-sm text-slate-300 leading-relaxed">{result.Feedback}</p>
        </div>

        {/* ---- Pros (Strengths) ---- */}
        <div className="mb-3">
          <SectionToggle
            label="Strengths"
            count={result.Pros.length}
            open={prosOpen}
            onToggle={() => setProsOpen((o) => !o)}
            type="pro"
          />

          {prosOpen && result.Pros.length > 0 && (
            <ul className="mt-3 space-y-2.5 pl-1">
              {result.Pros.map((pro, i) => (
                <ListItem key={i} text={pro} type="pro" index={i} />
              ))}
            </ul>
          )}
        </div>

        {/* ---- Cons (Gaps) ---- */}
        <div>
          <SectionToggle
            label="Gaps & Weaknesses"
            count={result.Cons.length}
            open={consOpen}
            onToggle={() => setConsOpen((o) => !o)}
            type="con"
          />

          {consOpen && result.Cons.length > 0 && (
            <ul className="mt-3 space-y-2.5 pl-1">
              {result.Cons.map((con, i) => (
                <ListItem key={i} text={con} type="con" index={i} />
              ))}
            </ul>
          )}
        </div>

        {/* ---- Footer attribution ---- */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          Analysis generated by Google Gemini 1.5 Flash. Treat as advisory — human review recommended.
        </div>
      </div>
    </>
  );
}
