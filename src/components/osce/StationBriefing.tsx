"use client";

import { useState } from "react";
import {
  Clock, AlertCircle, Target, User, Stethoscope, BookOpen, ChevronRight, Activity
} from "lucide-react";
import type { OSCEStation } from "@/lib/osce/types";

interface StationBriefingProps {
  station: OSCEStation;
  onStart: () => void;
  readingTimeRemaining: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "history-taking": "History Taking",
  "focused-examination": "Examination",
  "communication-skills": "Communication",
  "breaking-bad-news": "Breaking Bad News",
  "informed-consent": "Informed Consent",
  "ethical-dilemma": "Ethics",
  "emergency-management": "Emergency",
  "data-interpretation": "Data Interpretation",
  "procedure-explanation": "Procedure",
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  "fy1-level": { label: "FY1 Level", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  "fy2-level": { label: "FY2 Level", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  "registrar-level": { label: "Registrar", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

export function StationBriefing({ station, onStart, readingTimeRemaining }: StationBriefingProps) {
  const [showObjectives, setShowObjectives] = useState(false);
  const diff = DIFFICULTY_LABELS[station.difficulty] ?? { label: station.difficulty, color: "bg-slate-500/10 text-slate-600 border-slate-500/20" };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">

        {/* Reading time indicator */}
        {readingTimeRemaining > 0 && (
          <div className="flex items-center gap-2 justify-center bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">Reading time: {readingTimeRemaining}s remaining</span>
          </div>
        )}

        {/* Main briefing card */}
        <div
          className="rounded-3xl p-6 md:p-8 border shadow-xl"
          style={{ background: "var(--bg-2)", borderColor: "var(--border-subtle)" }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${diff.color}`}>
              {diff.label}
            </span>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border bg-[var(--bg-3)] border-[var(--border-subtle)] text-[var(--text-tertiary)]">
              {CATEGORY_LABELS[station.category] ?? station.category}
            </span>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border bg-[var(--bg-3)] border-[var(--border-subtle)] text-[var(--text-tertiary)]">
              {station.specialty}
            </span>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border bg-[var(--bg-3)] border-[var(--border-subtle)] text-[var(--text-tertiary)] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {station.durationMinutes} min
            </span>
          </div>

          {/* Title */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-medical-indigo)]/20">
              <Stethoscope className="w-5 h-5 text-[var(--color-medical-indigo)]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">{station.id}</p>
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">{station.title}</h1>
            </div>
          </div>

          {/* Candidate instructions */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Candidate Instructions
            </p>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">
              {station.candidateInstructions}
            </p>
          </div>

          {/* Patient info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Patient", value: station.patient.name, icon: User },
              { label: "Age", value: `${station.patient.age} yrs`, icon: null },
              { label: "Gender", value: station.patient.gender === "M" ? "Male" : station.patient.gender === "F" ? "Female" : "Other", icon: null },
              { label: "Occupation", value: station.patient.occupation, icon: null },
            ].map(d => (
              <div key={d.label} className="rounded-xl p-3 border" style={{ background: "var(--bg-3)", borderColor: "var(--border-subtle)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">{d.label}</p>
                <p className="text-xs font-extrabold text-[var(--text-primary)] leading-tight truncate">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Scoring summary */}
          <div className="border-t pt-4 mb-5" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Marking — {station.rubric.totalMaxScore} marks total (pass: {station.rubric.passingScore})
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Data Gathering", items: station.rubric.domains.dataGathering },
                { label: "Clinical Management", items: station.rubric.domains.clinicalManagement },
                { label: "Interpersonal Skills", items: station.rubric.domains.interpersonalSkills },
              ].map(domain => {
                const max = domain.items.reduce((s, i) => s + i.weight, 0);
                return (
                  <span key={domain.label} className="text-[11px] font-bold px-3 py-1.5 rounded-lg border" style={{ background: "var(--bg-3)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                    {domain.label} <span style={{ color: "var(--text-tertiary)" }}>({max})</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Learning objectives toggle */}
          <button
            onClick={() => setShowObjectives(p => !p)}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest mb-4 transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Learning Objectives
          </button>
          {showObjectives && (
            <ul className="mb-5 space-y-1.5 animate-in fade-in duration-200">
              {station.learningObjectives.map((lo, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] font-medium">
                  <ChevronRight className="w-3 h-3 text-[var(--color-medical-indigo)] flex-shrink-0 mt-0.5" />
                  {lo}
                </li>
              ))}
            </ul>
          )}

          {/* Start button */}
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] shadow-[0_10px_30px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_14px_35px_-8px_rgba(99,102,241,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <Activity className="w-5 h-5" />
            Begin Station
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
