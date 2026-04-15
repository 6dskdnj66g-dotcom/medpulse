"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, HeartPulse, Brain, Microscope, Stethoscope, Baby, Bone, Eye, Pill, Activity, Search, X } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

const SPECIALTIES = [
  {
    id: "internal-medicine",
    icon: Stethoscope,
    label: "Internal Medicine",
    color: "sky",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    borderHover: "hover:border-sky-300",
    articles: 2840,
    description:
      "Comprehensive database of adult diseases, diagnostic algorithms, and standard-of-care treatment protocols sourced from Harrison's.",
  },
  {
    id: "cardiology",
    icon: HeartPulse,
    label: "Cardiology",
    color: "rose",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    borderHover: "hover:border-rose-300",
    articles: 1920,
    description:
      "ECG interpretation, heart failure management, arrhythmias, and interventional cardiology based on ACC/AHA guidelines.",
  },
  {
    id: "neurology",
    icon: Brain,
    label: "Neurology",
    color: "indigo",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    borderHover: "hover:border-indigo-300",
    articles: 1640,
    description:
      "Stroke protocols, movement disorders, epilepsy management, and CNS pathology from peer-reviewed neurological sources.",
  },
  {
    id: "pathology",
    icon: Microscope,
    label: "Pathology",
    color: "teal",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    borderHover: "hover:border-teal-300",
    articles: 1380,
    description:
      "Histopathology, gross specimen interpretation, and molecular pathology findings indexed by tissue type and disease.",
  },
  {
    id: "pharmacology",
    icon: Pill,
    label: "Pharmacology",
    color: "amber",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    borderHover: "hover:border-amber-300",
    articles: 3100,
    description:
      "Drug mechanisms, interactions, contraindications and FDA/EMA approval data for over 3,000 pharmacological agents.",
  },
  {
    id: "pediatrics",
    icon: Baby,
    label: "Pediatrics",
    color: "pink",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    borderHover: "hover:border-pink-300",
    articles: 1120,
    description:
      "Developmental milestones, pediatric dosing protocols, neonatal emergencies and childhood disease management.",
  },
  {
    id: "orthopedics",
    icon: Bone,
    label: "Orthopedics",
    color: "orange",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    borderHover: "hover:border-orange-300",
    articles: 890,
    description:
      "Fracture management, joint replacement protocols, sports medicine injuries and musculoskeletal rehabilitation.",
  },
  {
    id: "ophthalmology",
    icon: Eye,
    label: "Ophthalmology",
    color: "cyan",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-500",
    borderHover: "hover:border-cyan-300",
    articles: 740,
    description:
      "Retinal pathology, glaucoma management, cataract surgery protocols and anterior segment examination techniques.",
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
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <BookOpen className="w-72 h-72 text-white -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Activity className="w-4 h-4" />
            <span>Clinical-Grade Knowledge Base</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Universal Medical Encyclopedia
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-6">
            Strictly curated clinical knowledge indexed from Cochrane reviews,
            USMLE standards, peer-reviewed journals, and FDA/EMA guidelines.
            Hallucination protocols enforce strict source restriction.
          </p>
          <div className="flex space-x-3">
            <div className="bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs px-3 py-1.5 rounded-full font-semibold">
              ✓ 13,630+ Articles
            </div>
            <div className="bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs px-3 py-1.5 rounded-full font-semibold">
              ✓ Zero Hallucination
            </div>
            <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-full font-semibold">
              ✓ Human Verified
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search specialties (e.g. 'Cardiology', 'drug interactions')"
          className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-slate-500 -mt-4">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> of {SPECIALTIES.length} specialties for &quot;{search}&quot;
        </p>
      )}

      {/* Specialties Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.length > 0 ? (
          filtered.map((specialty) => (
            <Link
              key={specialty.id}
              href={`/encyclopedia/${specialty.id}`}
              className={`group bg-white p-6 rounded-2xl border border-slate-200 ${specialty.borderHover} hover:shadow-md transition-all flex flex-col`}
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-12 h-12 ${specialty.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <specialty.icon className={`w-6 h-6 ${specialty.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">{specialty.label}</h3>
                  <p className={`text-xs font-semibold ${specialty.iconColor} mt-0.5`}>
                    {specialty.articles.toLocaleString()} verified articles
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">
                {specialty.description}
              </p>
              <div className={`flex items-center ${specialty.iconColor} font-semibold text-sm mt-4`}>
                Explore Module{" "}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-2 py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Search className="w-12 h-12 opacity-30" />
            <p className="font-medium">No specialties match &quot;{search}&quot;</p>
            <button onClick={() => setSearch("")} className="text-sky-600 font-semibold text-sm hover:underline">
              Clear search
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
