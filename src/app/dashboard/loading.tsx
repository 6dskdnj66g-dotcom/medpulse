export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-11 w-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>

      {/* Level banner skeleton */}
      <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>

      {/* Modules skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Bottom panels skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
