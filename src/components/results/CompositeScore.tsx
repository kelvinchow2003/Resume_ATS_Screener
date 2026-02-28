// =============================================================================
// src/components/results/CompositeScore.tsx
// Displays the weighted composite score with an animated SVG arc gauge.
// Weights: Legacy 30% + Semantic 30% + AI Recruiter 40%
// =============================================================================

"use client";

import { useEffect, useState } from "react";

interface CompositeScoreProps {
  score: number;         // 0–100 weighted composite
  legacyScore: number;
  semanticScore: number;
  aiScore: number;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function getRating(score: number): {
  label: string;
  textColour: string;
  strokeColour: string;
  pillBg: string;
  pillBorder: string;
} {
  if (score >= 80)
    return {
      label: "Excellent Match",
      textColour: "text-emerald-400",
      strokeColour: "stroke-emerald-400",
      pillBg: "bg-emerald-950/50",
      pillBorder: "border-emerald-500/30",
    };
  if (score >= 65)
    return {
      label: "Strong Match",
      textColour: "text-sky-400",
      strokeColour: "stroke-sky-400",
      pillBg: "bg-sky-950/50",
      pillBorder: "border-sky-500/30",
    };
  if (score >= 50)
    return {
      label: "Moderate Match",
      textColour: "text-amber-400",
      strokeColour: "stroke-amber-400",
      pillBg: "bg-amber-950/50",
      pillBorder: "border-amber-500/30",
    };
  if (score >= 35)
    return {
      label: "Weak Match",
      textColour: "text-orange-400",
      strokeColour: "stroke-orange-400",
      pillBg: "bg-orange-950/50",
      pillBorder: "border-orange-500/30",
    };
  return {
    label: "Poor Match",
    textColour: "text-red-400",
    strokeColour: "stroke-red-400",
    pillBg: "bg-red-950/50",
    pillBorder: "border-red-500/30",
  };
}

// Build an SVG arc path between two angles on a circle
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

// -----------------------------------------------------------------------------
// Sub-component: individual engine bar
// -----------------------------------------------------------------------------
interface EngineBarProps {
  label: string;
  score: number;
  weight: string;
  dotClass: string;     // Tailwind bg class for the pip
  fillClass: string;    // Tailwind bg class for the bar fill
  scoreClass: string;   // Tailwind text class for the score number
  animDelay: number;    // ms before bar animates in
}

function EngineBar({
  label,
  score,
  weight,
  dotClass,
  fillClass,
  scoreClass,
  animDelay,
}: EngineBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 150 + animDelay);
    return () => clearTimeout(t);
  }, [score, animDelay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="text-xs font-medium text-slate-400">{label}</span>
          <span className="text-xs text-slate-600 font-mono">{weight}</span>
        </div>
        <span className={`text-xs font-bold font-mono ${scoreClass}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{
            width: `${width}%`,
            transition: "width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function CompositeScore({
  score,
  legacyScore,
  semanticScore,
  aiScore,
}: CompositeScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rating = getRating(score);

  // Animate the score counter on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const stepMs = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += score / steps;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current * 10) / 10);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [score]);

  // SVG gauge configuration
  const cx = 80;
  const cy = 80;
  const r = 62;
  const startAngle = -220;
  const endAngle = 40;
  const fillAngle = startAngle + (score / 100) * (endAngle - startAngle);

  return (
    <div className="bg-[#111420] border border-slate-800 rounded-2xl p-6 shadow-xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Composite Score
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Weighted across 3 ATS engines
          </p>
        </div>
        <div
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${rating.pillBg} ${rating.pillBorder} ${rating.textColour}`}
        >
          {rating.label}
        </div>
      </div>

      {/* Gauge + bars row */}
      <div className="flex items-center gap-8">

        {/* SVG Gauge */}
        <div className="flex-shrink-0">
          <svg width="160" height="130" viewBox="0 0 160 160">
            {/* Track arc */}
            <path
              d={describeArc(cx, cy, r, startAngle, endAngle)}
              fill="none"
              stroke="#1e2235"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Glow layer */}
            <path
              d={describeArc(cx, cy, r, startAngle, fillAngle)}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              className={`${rating.strokeColour} opacity-10`}
              style={{
                filter: "blur(4px)",
                transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            {/* Fill arc */}
            <path
              d={describeArc(cx, cy, r, startAngle, fillAngle)}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className={rating.strokeColour}
              style={{
                transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
            {/* Score number */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              style={{
                fontSize: "26px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {Math.round(animatedScore)}
            </text>
            {/* /100 label */}
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              fill="#5b6180"
              style={{ fontSize: "11px", fontFamily: "monospace" }}
            >
              / 100
            </text>
          </svg>
        </div>

        {/* Engine breakdown bars */}
        <div className="flex-1 space-y-4">
          <EngineBar
            label="Legacy ATS"
            score={legacyScore}
            weight="30%"
            dotClass="bg-amber-400"
            fillClass="bg-amber-400"
            scoreClass="text-amber-400"
            animDelay={0}
          />
          <EngineBar
            label="Semantic ATS"
            score={semanticScore}
            weight="30%"
            dotClass="bg-sky-400"
            fillClass="bg-sky-400"
            scoreClass="text-sky-400"
            animDelay={150}
          />
          <EngineBar
            label="AI Recruiter"
            score={aiScore}
            weight="40%"
            dotClass="bg-violet-400"
            fillClass="bg-violet-400"
            scoreClass="text-violet-400"
            animDelay={300}
          />
        </div>
      </div>

      {/* Score breakdown footer */}
      <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
        {[
          { val: legacyScore,   label: "Keyword",  colour: "text-amber-400"  },
          { val: semanticScore, label: "Semantic",  colour: "text-sky-400"    },
          { val: aiScore,       label: "AI Score",  colour: "text-violet-400" },
        ].map(({ val, label, colour }) => (
          <div key={label}>
            <div className={`text-xl font-bold font-mono ${colour}`}>
              {val.toFixed(0)}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
