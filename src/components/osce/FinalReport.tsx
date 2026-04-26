"use client";

import { useState, useEffect } from "react";
import {
  Trophy, TrendingUp, TrendingDown, Star, Target, BookOpen,
  CheckCircle, AlertCircle, ChevronDown, ChevronUp, Home, RotateCcw, Brain
} from "lucide-react";
import Link from "next/link";
import type { OSCESession, OSCEStation, SessionScores } from "@/lib/osce/types";

interface FinalReportProps {
  station: OSCEStation;
  session: OSCESession;
  onRetry: () => void;
}

function ScoreRing({ percentage, passing }: { percentage: number; passing: boolean }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percentage), 300);
    return () => clearTimeout(t);
  }, [percentage]);

  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;
  const color = passing ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--bg-3)" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{Math.round(animated)}%</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Score</span>
        </div>
      </div>
      <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
        passing ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
        : percentage >= 50 ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
        : "bg-rose-500/10 border-rose-500/30 text-rose-500"
      }`}>
        {passing ? "PASS" : percentage >= 50 ? "BORDERLINE" : "FAIL"}
      </span>
    </div>
  );
}

export function FinalReport({ station, session, onRetry }: FinalReportProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const scores = session.scores as SessionScores;
  const totalMax = station.rubric.totalMaxScore;
  const totalEarned = scores.total;
  const percentage = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;
  const passing = totalEarned >= station.rubric.passingScore;

  const triggered = Object.values(session.rubricProgress).filter(p => p.triggered);
  const missed = [
    ...station.rubric.domains.dataGathering,
    ...station.rubric.domains.clinicalManagement,
    ...station.rubric.domains.interpersonalSkills,
  ].filter(item => item.required && !session.rubricProgress[item.id]?.triggered);

  const positives = triggered
    .filter(p => p.quality === "excellent" || p.quality === "good")
    .map(p => {
      const allItems = [
        ...station.rubric.domains.dataGathering,
        ...station.rubric.domains.clinicalManagement,
        ...station.rubric.domains.interpersonalSkills,
      ];
      return allItems.find(i => i.id === p.itemId)?.criterion;
    })
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* Main result card */}
      <div
        className="rounded-3xl p-6 md:p-8 border shadow-xl"
        style={{ background: "var(--bg-2)", borderColor: "var(--border-subtle)" }}
      >
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-6 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          Station Results — {station.id}
        </p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <ScoreRing percentage={Math.round(percentage)} passing={passing} />

          <div className="flex-1 space-y-4 w-full">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{station.title}</h2>
              <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
                {station.specialty} · {station.difficulty.replace("-level", "")} · {station.category}
              </p>
            </div>

            <div className="text-2xl font-black text-[var(--color-medical-indigo)]">
              {totalEarned.toFixed(1)} / {totalMax}
            </div>

            {/* Domain bars */}
            <div className="space-y-3">
              {[
                { label: "Data Gathering", score: scores.dataGathering },
                { label: "Clinical Management", score: scores.clinicalManagement },
                { label: "Interpersonal Skills", score: scores.interpersonalSkills },
              ].map(({ label, score }) => {
                const pct = score.percentage;
                const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={label}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ color: "var(--text-primary)" }}>{score.earned.toFixed(1)}/{score.max}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths and missed required */}
      <div className="grid md:grid-cols-2 gap-4">
        {positives.length > 0 && (
          <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              What You Did Well
            </p>
            <ul className="space-y-2">
              {positives.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {missed.length > 0 && (
          <div className="rounded-2xl p-5 border border-rose-500/20 bg-rose-500/5">
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              Missed Required Items
            </p>
            <ul className="space-y-2">
              {missed.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  {item.criterion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Feedback */}
      {session.finalFeedback && (
        <div className="rounded-2xl p-5 border" style={{ background: "var(--bg-2)", borderColor: "var(--border-subtle)" }}>
          <button
            onClick={() => setShowFeedback(p => !p)}
            className="flex items-center justify-between w-full text-left"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Examiner AI Feedback
            </p>
            {showFeedback ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
          </button>
          {showFeedback && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] font-medium leading-relaxed whitespace-pre-wrap">
              {session.finalFeedback}
            </p>
          )}
        </div>
      )}

      {/* Learning objectives */}
      <div className="rounded-2xl p-5 border" style={{ background: "var(--bg-2)", borderColor: "var(--border-subtle)" }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Learning Objectives
        </p>
        <ul className="space-y-2">
          {station.learningObjectives.map((lo, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              {lo}
            </li>
          ))}
        </ul>
      </div>

      {/* References */}
      {station.references.length > 0 && (
        <div className="rounded-2xl p-5 border border-[var(--color-medical-indigo)]/20 bg-[var(--color-medical-indigo)]/5">
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-3 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Key References
          </p>
          <ul className="space-y-1">
            {station.references.map((ref, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] font-medium">
                {ref.source}{ref.section ? ` — ${ref.section}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all uppercase tracking-widest hover:bg-[var(--bg-2)]"
          style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
        >
          <RotateCcw className="w-4 h-4" />
          Retry Station
        </button>
        <Link
          href="/simulator"
          className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-[var(--color-medical-indigo)] text-white hover:bg-[var(--color-medical-indigo)]/90 transition-all uppercase tracking-widest shadow-[0_6px_20px_-6px_rgba(99,102,241,0.5)]"
        >
          <Home className="w-4 h-4" />
          All Stations
        </Link>
      </div>
    </div>
  );
}
