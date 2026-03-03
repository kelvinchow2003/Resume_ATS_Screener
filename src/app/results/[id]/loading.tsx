export default function ResultsLoading() {
  return (
    <div className="relative bg-[#0b0d14] text-slate-200">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/4 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 min-h-[calc(100vh-4rem)] animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-24 bg-slate-800 rounded" />
        </div>

        <div className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="h-3 w-24 bg-slate-700 rounded" />
          <div className="h-4 w-full bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-slate-700 rounded" />
        </div>

        <div className="h-48 rounded-2xl bg-slate-800/40 border border-slate-800 mb-5" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="h-44 rounded-2xl bg-slate-800/40 border border-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-800/40 border border-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-800/40 border border-slate-800" />
        </div>

        <div className="h-32 rounded-2xl bg-slate-800/40 border border-slate-800 mb-5" />
        <div className="h-48 rounded-2xl bg-slate-800/40 border border-slate-800" />
      </div>
    </div>
  );
}
