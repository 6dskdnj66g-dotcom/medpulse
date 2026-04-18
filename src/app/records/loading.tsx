export default function RecordsLoading() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 w-full animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-7 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-11 w-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>

      {/* Search bar */}
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6" />

      {/* Record cards */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
