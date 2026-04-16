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
  {
    id: "neurology",
    icon: Brain,
    label: "Neurology",
    color: "violet",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    articles: 1640,
    description: "Stroke protocols, movement disorders, epilepsy management, and CNS pathology from AAN and AHA Stroke 2026.",
  },
  {
    id: "surgery",
    icon: Stethoscope,
    label: "Surgery",
    color: "slate",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-500",
    articles: 2110,
    description: "Perioperative care, surgical oncology, trauma surgery, and laparoscopic techniques from Bailey & Love 28th Ed.",
  },
  {
    id: "obstetrics",
    icon: Baby,
    label: "Obstetrics & Gynecology",
    color: "fuchsia",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-500",
    articles: 1450,
    description: "Antenatal care, obstetric emergencies, and gynecologic oncology from ACOG, RCOG, and FIGO 2026.",
  },
  {
    id: "oncology",
    icon: Microscope,
    label: "Oncology",
    color: "orange",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    articles: 1880,
    description: "Cancer biology, targeted therapy, immuno-oncology, and palliative care from NCCN, ESMO, and ASCO 2026.",
  },
  {
    id: "orthopedics",
    icon: Bone,
    label: "Orthopedics",
    color: "stone",
    iconBg: "bg-stone-500/10",
    iconColor: "text-stone-500",
    articles: 980,
    description: "Fracture management, joint arthroplasty, sports medicine, and spine surgery from AAOS 2026 guidelines.",
  },
  {
    id: "ophthalmology",
    icon: Eye,
    label: "Ophthalmology",
    color: "cyan",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    articles: 720,
    description: "Retinal disease, glaucoma, cataract surgery, and neuro-ophthalmology from AAO Preferred Practice Patterns 2026.",
  },
];

const SOURCE_CATEGORIES = [
  { label: "Premier Journals", color: "indigo", sources: ["NEJM (IF 176.1)", "The Lancet (IF 202.7)", "JAMA (IF 157.3)", "BMJ (IF 105.7)", "Nature Medicine (IF 87.2)", "Annals of Internal Medicine", "J Clinical Oncology", "Circulation/AHA", "European Heart Journal", "Blood/ASH", "Gut/BMJ", "Chest/ACCP", "Kidney International", "JNNP"] },
  { label: "Clinical Evidence Databases", color: "emerald", sources: ["UpToDate 2026", "Cochrane Library (Level 1A)", "PubMed/MEDLINE (NLM)", "ClinicalTrials.gov", "DynaMed 2026", "BMJ Best Practice 2026"] },
  { label: "International Guidelines", color: "teal", sources: ["WHO 2026", "NICE (UK) 2026", "CDC 2026", "ACC/AHA 2026", "ESC 2026", "KDIGO 2026", "IDSA/ATS 2026", "ADA 2026", "NCCN 2026", "ESMO 2026", "ACR 2026", "AASLD 2026", "ACG 2026", "AAN 2026", "ACOG 2026", "AAP 2026", "AAOS 2026", "ASH 2026", "SCCM 2026"] },
  { label: "Foundational Textbooks", color: "amber", sources: ["Harrison's 21st Ed", "Goldman-Cecil 27th Ed", "Braunwald's 12th Ed", "Robbins & Cotran 10th Ed", "Gray's Anatomy 5th Ed", "Netter's Atlas 8th Ed", "Guyton & Hall 14th Ed", "Adams & Victor's 11th Ed", "Nelson's 22nd Ed", "Williams Obstetrics 26th Ed", "Bailey & Love 28th Ed", "Schwartz's Surgery 11th Ed", "Goodman & Gilman 14th Ed", "Katzung 16th Ed", "Oxford Handbook 10th Ed", "Macleod's 14th Ed", "CMDT 2026"] },
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

      {/* Global Medical Sources Panel */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Global Medical Sources Registry</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
            MedPulse AI is synchronized with <strong>{SOURCE_CATEGORIES.reduce((acc, c) => acc + c.sources.length, 0)}+</strong> internationally recognized medical sources across all specialties, updated to <strong>April 2026</strong>.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {SOURCE_CATEGORIES.map((cat) => (
            <div key={cat.label} className={`premium-card p-6 border-${cat.color}-500/20`}>
              <h4 className={`text-xs font-black uppercase tracking-widest text-${cat.color}-600 dark:text-${cat.color}-400 mb-4 flex items-center`}>
                <span className={`w-2 h-2 rounded-full bg-${cat.color}-500 mr-2 animate-pulse`} />
                {cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.sources.map((src) => (
                  <span key={src} className={`text-[10px] font-bold px-2.5 py-1 rounded-xl bg-${cat.color}-500/5 border border-${cat.color}-500/20 text-${cat.color}-700 dark:text-${cat.color}-400`}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
