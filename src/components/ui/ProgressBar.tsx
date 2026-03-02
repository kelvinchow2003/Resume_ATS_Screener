import React from "react";

interface ProgressBarProps {
  progress: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ progress, color = "bg-blue-500", className = "" }: ProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full bg-slate-800 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}