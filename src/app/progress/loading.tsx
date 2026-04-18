export default function ProgressLoading() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 w-full animate-pulse">
      {/* Header */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-56 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
      </div>

      {/* Level card */}
      <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
