"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, GraduationCap, ArrowRight, Search, BookMarked, PlayCircle, Sparkles, Activity, ShieldCheck, Clock } from "lucide-react";

const SAVED_SETS = [
  { id: 1, title: "Cardiology: Arrhythmias", count: "45 Flashcards", savedAt: "Saved 2 days ago" },
  { id: 2, title: "Pharmacology: Antibiotics", count: "120 MCQs", savedAt: "Saved last week" },
  { id: 3, title: "Anatomy: Circle of Willis", count: "32 Diagrams", savedAt: "Saved 1 hour ago" },
];

const QUICK_LINKS = [
  { label: "Physiology", href: "/encyclopedia/physiology" },
  { label: "Cardiology", href: "/encyclopedia/cardiology" },
  { label: "Pathology", href: "/encyclopedia/pathology" },
  { label: "Internal Medicine", href: "/encyclopedia/internal-medicine" },
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
    <div className="w-full page-transition">
      {/* Welcome Banner */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="px-4 py-1.5 glass bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
            Clinical Interface v3.0 (2026)
          </div>
          <div className="flex items-center gap-2 px-3 py-1 glass bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Source Library Synced
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Network Active (2026)</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-none">
          Good morning, <br />
          <span className="medical-gradient-text">Doctor in Progress.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl font-bold leading-relaxed italic">
          &quot;The art of medicine consists in amusing the patient while nature cures the disease.&quot; — Voltaire (Updated for 2026 clinical rigor).
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Main Search Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Intelligence Search Card */}
          <div className="premium-card p-10 md:p-14 relative group overflow-hidden border-indigo-500/20 bg-gradient-to-br from-white to-indigo-50/30 dark:from-obsidian-900/40 dark:to-obsidian-950/40">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12 transition-transform group-hover:scale-110">
              <Activity className="w-80 h-80 text-indigo-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <Sparkles className="w-5 h-5" />
                <span>MedPulse Secure RAG Engine Active</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Analyze <br /> 
                <span className="text-teal-500">Clinical Data</span>
              </h2>
              
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full group/input">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search symptoms, dose updates, or case files..."
                    className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-xl shadow-2xl transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-premium py-6 px-12 text-lg shadow-2xl shadow-indigo-500/20"
                >
                  Query Engine
                  <ArrowRight className="w-6 h-6 ml-2" />
                </button>
              </form>

              <div className="flex flex-wrap gap-3 mt-10">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest pt-2.5 mr-2">Quick Navigation:</span>
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-black px-5 py-2.5 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-sm uppercase tracking-widest"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Summarizer Tool */}
            <Link href="/summarizer" className="premium-card p-8 group">
              <div className="w-16 h-16 glass bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-indigo-500/20">
                <FileText className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">AI Deep Analysis</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Synthesize patient charts, lab reports, and journals into actionable 2026 high-yield protocols.
              </p>
              <div className="flex items-center text-indigo-500 font-black text-xs uppercase tracking-widest mt-auto">
                Execute Summary
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* AI Simulator */}
            <Link href="/simulator" className="premium-card p-8 group border-rose-500/20">
              <div className="w-16 h-16 glass bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-rose-500/20">
                <Activity className="h-8 w-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">OSCE Ward 2026</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                Test your clinical reasoning against advanced patient personas with real-time biometric feedback.
              </p>
              <div className="flex items-center text-rose-500 font-black text-xs uppercase tracking-widest mt-auto">
                Begin Rounds
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Recent Archives */}
          <div className="premium-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
                <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                Case History
              </h3>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">3 New</span>
            </div>
            <div className="space-y-4">
              {SAVED_SETS.map((set) => (
                <div key={set.id} className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:scale-[1.02] transition-transform cursor-pointer">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm mb-1">{set.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                    <span>{set.count}</span>
                    <span className="text-indigo-500">{set.savedAt}</span>
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 glass bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl">
              Sync Data Archive
            </button>
          </div>

          {/* Verification Status */}
          <div className="glass p-8 rounded-[2rem] border-emerald-500/20 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-500 mb-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Clinical Compliance</span>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              All AI agents are currently running on the **MedPulse Secure Lattice**. 
              Data is cross-referenced with local hospital databases and national clinical registries.
            </p>
            <div className="pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-400">Connection</span>
              <span className="text-emerald-500 flex items-center"><span className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-ping" />Encrypted</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
