"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, GraduationCap, ArrowRight, Search, BookMarked, PlayCircle, Sparkles } from "lucide-react";

const SAVED_SETS = [
  {
    id: 1,
    title: "Cardiology: Arrhythmias",
    count: "45 Flashcards",
    savedAt: "Saved 2 days ago",
  },
  {
    id: 2,
    title: "Pharmacology: Antibiotics",
    count: "120 MCQs",
    savedAt: "Saved last week",
  },
  {
    id: 3,
    title: "Neurology: Stroke Protocols",
    count: "67 Flashcards",
    savedAt: "Saved 3 days ago",
  },
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
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
          Welcome back, Future Doctor 👋
        </h1>
        <p className="text-slate-500 text-lg">
          Access your study tools and review your saved medical materials.
        </p>
      </div>

      {/* Encyclopedia Search */}
      <div className="bg-gradient-to-br from-sky-500 to-teal-400 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-lg shadow-sky-100">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <BookMarked className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Hallucination RAG Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Query the Medical Encyclopedia
          </h2>
          <p className="text-sky-100 text-sm mb-5">
            Search across thousands of strictly vetted articles, pathophysiology pathways, and pharmacology entries.
          </p>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 'Pathophysiology of Heart Failure'..."
                className="w-full pl-11 pr-4 py-3 bg-white rounded-xl text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50 font-medium shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm whitespace-nowrap active:scale-95"
            >
              Search
            </button>
          </form>
          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs bg-white/20 hover:bg-white/30 text-white font-medium px-3 py-1.5 rounded-full transition-colors border border-white/20"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Summarizer Tool */}
        <Link
          href="/summarizer"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group flex flex-col h-full cursor-pointer"
        >
          <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
            <FileText className="h-7 w-7 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">AI Summarizer</h3>
          <p className="text-slate-500 flex-1 mb-5 text-sm leading-relaxed">
            Paste heavy medical texts or clinical notes to get structured, easy-to-read summaries with key diagnoses.
          </p>
          <div className="flex items-center text-sky-600 font-semibold text-sm mt-auto">
            Open Summarizer{" "}
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Saved Materials */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 text-indigo-500 mr-2" />
            Saved Flashcards &amp; MCQs
          </h3>

          <div className="flex-1 space-y-2">
            {SAVED_SETS.map((set) => (
              <div
                key={set.id}
                className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center justify-between hover:bg-white hover:border-indigo-200 transition-colors cursor-pointer group"
              >
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">{set.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {set.count} • {set.savedAt}
                  </p>
                </div>
                <PlayCircle className="w-8 h-8 text-indigo-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-sm transition-colors border border-indigo-100">
            View All Saved Sets
          </button>
        </div>
      </div>
    </div>
  );
}
