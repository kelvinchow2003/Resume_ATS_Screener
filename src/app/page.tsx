// =============================================================================
// src/app/page.tsx
// Home / landing page at "/". Introduces the app and CTAs to /evaluate.
// Static — no auth required.
// =============================================================================

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-200 flex flex-col items-center justify-center px-6 py-20 text-center">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-mono text-xl font-bold text-white">
            ATS<span className="text-blue-400">.</span>Benchmarker
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
          Will your resume pass
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            the ATS filter?
          </span>
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto">
          Upload your PDF resume and paste any job description. We run it through
          3 distinct ATS simulations in parallel and give you a full breakdown.
        </p>

        {/* Engine pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { label: "Legacy Keyword ATS",      colour: "bg-amber-500/10 border-amber-500/20 text-amber-400"  },
            { label: "Semantic Embedding ATS",  colour: "bg-sky-500/10 border-sky-500/20 text-sky-400"        },
            { label: "AI Recruiter (Gemini)",   colour: "bg-violet-500/10 border-violet-500/20 text-violet-400"},
          ].map(({ label, colour }) => (
            <span key={label} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${colour}`}>
              {label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/evaluate"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white
                       font-semibold text-sm hover:from-blue-500 hover:to-violet-500
                       transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            Benchmark your resume →
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold
                       text-sm hover:border-slate-600 hover:text-white transition-all duration-150"
          >
            Sign in / Sign up
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-slate-600">
          Free to use · No credit card required · Powered by Cohere + Gemini
        </p>
      </div>
    </div>
  );
}