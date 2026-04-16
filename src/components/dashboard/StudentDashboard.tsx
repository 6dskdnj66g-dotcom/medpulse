"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, GraduationCap, ArrowRight, Search, BookMarked, PlayCircle, Sparkles } from "lucide-react";

const SAVED_SETS = [
  { id: 1, title: "Cardiology: Arrhythmias", count: "45 Flashcards", savedAt: "Saved 2 days ago" },
  { id: 2, title: "Pharmacology: Antibiotics", count: "120 MCQs", savedAt: "Saved last week" },
  { id: 3, title: "Neurology: Stroke Protocols", count: "67 Flashcards", savedAt: "Saved 3 days ago" },
];

const QUICK_LINKS = [
  { label: "Cardiology", href: "/encyclopedia/cardiology" },
  { label: "Pharmacology", href: "/encyclopedia/pharmacology" },
  { label: "Neurology", href: "/encyclopedia/neurology" },
  { label: "Pathology", href: "/encyclopedia/pathology" },
];

export function StudentDashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/encyclopedia?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-indigo-100 dark:border-indigo-800">
            Clinical Portal v2.0
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Welcome back, <br />
          <span className="medical-gradient">Future Doctor.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl font-medium leading-relaxed">
          Your command center for verified medical intelligence and high-yield clinical mastery.
        </p>
      </div>

      {/* Encyclopedia Search */}
      <div className="bg-indigo-600 dark:bg-indigo-900/40 rounded-[2.5rem] p-8 md:p-12 mb-10 relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none border border-indigo-500/20">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10 scale-150">
          <BookMarked className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>MedPulse AI RAG ENGINE v2.5</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Query the Clinical <br /> 
            <span className="text-teal-300">Evidence Base</span>
          </h2>
          <p className="text-indigo-100/80 text-lg mb-8 max-w-xl leading-relaxed">
            Instant access to verified pathophysiology, pharmacology, and treatment protocols with zero hallucination.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clinical topics, drug doses, or guidelines..."
                className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-400/30 font-semibold text-lg shadow-2xl transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-10 rounded-2xl transition-all shadow-xl whitespace-nowrap active:scale-95 flex items-center justify-center gap-2 group"
            >
              Search
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="text-indigo-200/60 text-xs font-bold uppercase tracking-widest pt-1.5">Quick Filters:</span>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-white/30 backdrop-blur-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Summarizer Tool */}
        <Link
          href="/summarizer"
          className="clinical-card p-8 group flex flex-col h-full cursor-pointer overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-indigo-100 dark:border-indigo-800">
            <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">AI Summarizer</h3>
          <p className="text-slate-500 dark:text-slate-400 flex-1 mb-8 text-base leading-relaxed">
            Convert complex medical literature or clinical notes into structured, high-yield summaries with one click.
          </p>
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-auto group/btn">
            Launch Analysis Protocol
            <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-2 transition-transform" />
          </div>
        </Link>

        {/* Saved Materials */}
        <div className="clinical-card p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
            <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/40 rounded-xl flex items-center justify-center mr-4 border border-teal-100 dark:border-teal-800">
              <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            Recent Materials
          </h3>
          <div className="flex-1 space-y-3">
            {SAVED_SETS.map((set) => (
              <div
                key={set.id}
                className="group border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-indigo-500/20 group-hover:bg-indigo-500 rounded-full transition-all" />
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{set.title}</h4>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                      {set.count} • {set.savedAt}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                  <PlayCircle className="w-6 h-6 text-indigo-500 group-hover:text-white transition-all" />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-600 dark:text-slate-400 font-bold rounded-2xl text-sm transition-all border border-slate-200 dark:border-slate-800 hover:border-indigo-600 shadow-sm">
            Access Complete Library
          </button>
        </div>
      </div>
    </div>
  );
}
