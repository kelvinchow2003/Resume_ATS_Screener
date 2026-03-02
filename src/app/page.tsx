// =============================================================================
// src/app/page.tsx - Overhauled Professional UI
// =============================================================================

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex flex-col items-center justify-center px-6 overflow-hidden selection:bg-blue-500/30">
      
      {/* Background Layer: Grid + Radial Glow */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Logo Section */}
        <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md mb-12">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100 pr-2">
            ATS<span className="text-blue-500">.</span>Benchmarker
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 text-center">
          Will your resume pass <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            the ATS filter?
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-12 max-w-2xl text-center font-medium">
          Upload your PDF resume and paste any job description. We run it through
          3 distinct ATS simulations in parallel and give you a full breakdown.
        </p>

        {/* Engine Pills - Re-styled for "Utility" look */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          {[
            { label: "Legacy Keyword ATS", color: "border-amber-500/30 text-amber-200 bg-amber-500/5" },
            { label: "Semantic Embedding ATS", color: "border-sky-500/30 text-sky-200 bg-sky-500/5" },
            { label: "AI Recruiter (Gemini)", color: "border-indigo-500/30 text-indigo-200 bg-indigo-500/5" },
          ].map(({ label, color }) => (
            <div 
              key={label} 
              className={`text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-md border backdrop-blur-sm transition-all hover:border-white/20 ${color}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Professional CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
          <Link
            href="/evaluate"
            className="group relative px-10 py-4 w-full sm:w-auto rounded-full bg-white text-black font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
          >
            <span className="relative z-10">Benchmark your resume →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <Link
            href="/login"
            className="px-10 py-4 w-full sm:w-auto rounded-full border border-slate-700 bg-slate-900/40 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all backdrop-blur-sm"
          >
            Sign in / Sign up
          </Link>
        </div>

        {/* Subtle Footer */}
        <div className="mt-24 pt-8 border-t border-slate-800/50 w-full flex flex-col items-center">
          <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-600 mb-2">
            Trusted by candidates globally
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Free to use · No credit card required · Powered by <span className="text-slate-300">Cohere + Gemini</span>
          </p>
        </div>
      </div>
    </div>
  );
}