import React from "react";

interface BadgeProps {
  variant?: "neutral" | "success" | "warning" | "error" | "accent";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  const variants = {
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    accent: "bg-violet-500/10 text-violet-400 border-violet-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}