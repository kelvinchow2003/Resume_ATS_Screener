import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={twMerge(clsx("bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden", className))}>
      {children}
    </div>
  );
}