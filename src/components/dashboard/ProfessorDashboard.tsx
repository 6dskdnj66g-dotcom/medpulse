import { AlertCircle, CheckCircle, Edit3, PenTool, ShieldCheck, TrendingUp, Users, BookOpen } from "lucide-react";

const PENDING_REVIEWS = [
  {
    id: 1, type: "Pathology Flag", time: "2 hours ago",
    title: 'Algorithm detected anomaly in "Atypical Pneumonia" article generation',
    body: "AI Agent confidence was 68% regarding the latest CDC guidelines for initial macrolide resistance protocols.",
    urgent: true,
  },
  {
    id: 2, type: "User Query Flag", time: "5 hours ago",
    title: "Unverifiable mechanism proposed by student query",
    body: "Student query involved an experimental interaction between Compound X and Beta-Blockers. RAG rejected answering.",
    urgent: false,
  },
  {
    id: 3, type: "Content Update", time: "Yesterday",
    title: 'New ACC/AHA 2024 guideline conflicts with "Heart Failure" article section 4.2',
    body: "Automated crawler detected that the updated LVEF threshold (≤40%) may conflict with existing article content.",
    urgent: true,
  },
];

const STATS = [
  { icon: BookOpen, label: "Total Articles", value: "13,630", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/30" },
  { icon: Users, label: "Active Students", value: "2,841", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/30" },
  { icon: TrendingUp, label: "Queries Today", value: "487", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
];

export function ProfessorDashboard() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 flex items-center">
            <ShieldCheck className="w-9 h-9 text-teal-500 mr-3" />
            Verified HQ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Oversee encyclopedia additions, validate AI flags, and author content.
          </p>
        </div>
        <div className="flex items-center bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2.5 rounded-xl border border-teal-100 dark:border-teal-800 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
          Human-in-the-Loop Active
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Reviews Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
            <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
            Pending AI Validations
            <span className="ml-3 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs px-2 py-1 rounded-full font-bold">
              {PENDING_REVIEWS.filter((r) => r.urgent).length} Urgent
            </span>
          </h2>

          <div className="space-y-4">
            {PENDING_REVIEWS.map((item) => (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border ${
                  item.urgent ? "border-amber-200 dark:border-amber-800" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.urgent ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                      {item.type}
                    </span>
                    {item.urgent && (
                      <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Urgent
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-400">{item.time}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 leading-relaxed">
                  {item.body}
                </p>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors shadow-sm active:scale-95">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </button>
                  <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors active:scale-95">
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Output
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publishing */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
            <PenTool className="w-5 h-5 text-sky-500 mr-2" />
            Publishing
          </h2>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden group hover:shadow-xl transition-all h-56 flex flex-col justify-end cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition-all">
              <PenTool className="w-36 h-36 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-bold text-xl mb-2">Author New Article</h3>
              <p className="text-slate-400 text-sm mb-4 max-w-[200px] leading-relaxed">
                Submit peer-reviewed content to the Global Encyclopedia vector database.
              </p>
              <div className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg inline-flex text-sm transition-colors backdrop-blur-md">
                Open Editor
              </div>
            </div>
          </div>

          {/* Authorship Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Your Authorship</h3>
            <div className="space-y-2.5">
              {[
                { label: "Articles Authored", value: "24", bar: "70%" },
                { label: "Validations Done", value: "143", bar: "90%" },
                { label: "Pending Reviews", value: "3", bar: "20%" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                      style={{ width: item.bar }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
