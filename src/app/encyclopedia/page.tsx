"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, HeartPulse, Brain, Microscope, Stethoscope, Baby, Bone, Eye, Pill, Activity, Search, X, FlaskConical, Dna } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const SPECIALTIES = [
  {
    id: "physiology",
    icon: Activity,
    label: "Physiology",
    color: "emerald",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    articles: 1420,
    description: "Fundamental mechanisms of human life systems, homeostasis, and cellular function across organ systems.",
  },
  {
    id: "internal-medicine",
    icon: Stethoscope,
    label: "Internal Medicine",
    color: "sky",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
    articles: 2840,
    description: "Comprehensive database of adult diseases, diagnostic algorithms, and standard-of-care treatment protocols.",
  },
  {
    id: "cardiology",
    icon: HeartPulse,
    label: "Cardiology",
    color: "rose",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
    articles: 1920,
    description: "ECG interpretation, heart failure management, arrhythmias, and interventional cardiology based on ACC/AHA 2026 guidelines.",
  },
  {
    id: "neurology",
    icon: Brain,
    label: "Neurology",
    color: "indigo",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    articles: 1640,
    description: "Stroke protocols, movement disorders, epilepsy management, and CNS pathology from indexed neurological sources.",
  },
  {
    id: "pathology",
    icon: Microscope,
    label: "Pathology",
    color: "teal",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
    articles: 1380,
    description: "Histopathology, gross specimen interpretation, and molecular pathology findings indexed by tissue type.",
  },
  {
    id: "anatomy",
    icon: Dna,
    label: "Anatomy",
    color: "amber",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    articles: 950,
    description: "Gross anatomy, neuroanatomy, and embryology with high-fidelity clinical correlations.",
  },
  {
    id: "pharmacology",
    icon: Pill,
    label: "Pharmacology",
    color: "amber",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    articles: 3100,
    description: "Drug mechanisms, interactions, contraindications and clinical pharmacology data updated for 2026.",
  },
  {
    id: "pediatrics",
    icon: Baby,
    label: "Pediatrics",
    color: "pink",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    articles: 1120,
    description: "Developmental milestones, pediatric dosing protocols, and neonatal emergency management.",
  },
];

function EncyclopediaHome() {
  const [search, setSearch] = useState("");

  const filtered = SPECIALTIES.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12 page-transition">
      {/* Hero */}
      <div className="relative overflow-hidden glass-panel p-10 rounded-[2.5rem] shadow-2xl border-indigo-500/10">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
          <BookOpen className="w-96 h-96 text-indigo-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Activity className="w-4 h-4" />
            <span>2026 Clinical Intelligence Edition</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            The Universal <br/>
            <span className="medical-gradient-text">Medical Library</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl">
            A comprehensive, RAG-enabled clinical repository indexed from Cochrane reviews, 
            USMLE standards, and primary medical literature. Guaranteed zero-hallucination protocols.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">18,400+ Verified Volumes</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Updated March 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clinical modules (e.g. 'Physiology', 'Sepsis')"
          className="w-full pl-16 pr-16 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-lg font-bold shadow-xl shadow-indigo-500/5 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 dark:text-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Specialties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((specialty) => (
            <Link
              key={specialty.id}
              href={`/encyclopedia/${specialty.id}`}
              className="premium-card p-6 flex flex-col group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 ${specialty.iconBg} rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                  <specialty.icon className={`w-7 h-7 ${specialty.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Articles</p>
                  <p className={`text-sm font-black ${specialty.iconColor}`}>
                    {specialty.articles.toLocaleString()}
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{specialty.label}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                {specialty.description}
              </p>
              <div className={`flex items-center ${specialty.iconColor} font-black text-xs uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800/50`}>
                Enter Library
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-bold text-lg">No clinical modules match &quot;{search}&quot;</p>
            <button onClick={() => setSearch("")} className="text-indigo-500 font-bold hover:underline">
              Reset Library Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <EncyclopediaHome />
    </ErrorBoundary>
  );
}
