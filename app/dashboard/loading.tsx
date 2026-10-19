/**
 * Dashboard loading skeleton.
 *
 * Without this file, navigating from /login to /dashboard could briefly
 * fall back to the global 404 / blank state while Next.js streamed the
 * RSC payload. This skeleton is the prefetched fallback the App Router
 * shows the moment the navigation starts, so the user always sees a
 * branded loading state, never "Page not found".
 *
 * It is rendered inside `app/dashboard/layout.tsx`, so the sidebar and
 * header are already in place by the time this paints.
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-white">
      {/* Top area skeleton */}
      <div className="border-b border-slate-100 px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-md bg-slate-100 animate-pulse" />
            <div className="h-4 w-80 rounded-md bg-slate-100 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-36 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-9 w-40 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-12 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Resumes skeleton */}
      <div className="px-6 lg:px-8 py-8">
        <div className="h-6 w-32 rounded bg-slate-100 animate-pulse mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="h-[160px] bg-slate-50 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                <div className="h-1.5 w-full rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="h-7 w-16 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-7 w-7 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
