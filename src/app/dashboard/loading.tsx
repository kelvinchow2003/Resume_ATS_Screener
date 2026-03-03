// =============================================================================
// src/app/dashboard/loading.tsx
// Loading skeleton shown while the dashboard server component fetches data.
// Next.js App Router automatically uses this file during Suspense boundaries.
// =============================================================================

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-200">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/3 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-12 animate-pulse">
        {/* User profile strip skeleton */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
          <div className="w-11 h-11 rounded-full bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-slate-700 rounded" />
            <div className="h-3 w-24 bg-slate-800 rounded" />
          </div>
          <div className="h-8 w-20 bg-slate-800 rounded-lg" />
        </div>

        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-slate-700 rounded" />
            <div className="h-4 w-48 bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-36 bg-slate-700 rounded-xl" />
        </div>

        {/* Label */}
        <div className="h-3 w-32 bg-slate-800 rounded mb-4" />

        {/* Evaluation row skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-800"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full max-w-xs bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-800 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-10 bg-slate-800 rounded-lg" />
                <div className="w-12 h-10 bg-slate-800 rounded-lg" />
                <div className="w-12 h-10 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
