// src/app/simulator/[stationId]/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, Send, Loader2, CheckCircle, XCircle,
  AlertCircle, ChevronDown, ChevronUp, Trophy, Target,
  BookOpen, Star, TrendingUp, TrendingDown, User, Stethoscope,
  RotateCcw, Home, ChevronRight, Activity, Brain
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { OSCE_STATIONS, DIFFICULTY_LABELS, STATION_TYPE_LABELS, type OSCEStation } from "@/lib/osceStations";

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ScoreBreakdown {
  name: string;
  earned: number;
  max: number;
  comments: string;
}

interface ExaminerResult {
  total_score: number;
  max_score: number;
  percentage: number;
  pass_fail: "pass" | "borderline" | "fail";
  breakdown: ScoreBreakdown[];
  positives: string[];
  improvements: string[];
  ai_feedback: string;
}

type Phase = "brief" | "active" | "results";

// ── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ percentage, passFail }: { percentage: number; passFail: "pass" | "borderline" | "fail" }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percentage), 200);
    return () => clearTimeout(t);
  }, [percentage]);

  const colors = {
    pass: { stroke: "#10b981", text: "text-emerald-500", label: "PASS", bg: "bg-emerald-500/10 border-emerald-500/30" },
    borderline: { stroke: "#f59e0b", text: "text-amber-500", label: "BORDERLINE", bg: "bg-amber-500/10 border-amber-500/30" },
    fail: { stroke: "#ef4444", text: "text-rose-500", label: "FAIL", bg: "bg-rose-500/10 border-rose-500/30" },
  };
  const c = colors[passFail];
  const dash = (animated / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--bg-2)" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke={c.stroke} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${c.text}`}>{Math.round(animated)}%</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Score</span>
        </div>
      </div>
      <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    </div>
  );
}

// ── Timer ────────────────────────────────────────────────────────────────────

function Timer({ totalSeconds, onExpire }: { totalSeconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(ref.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;
  const urgent = pct < 25;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-base tabular-nums transition-all ${
      urgent
        ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"
        : pct < 50
        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
        : "bg-[var(--bg-2)] border-[var(--border-subtle)] text-[var(--text-primary)]"
    }`}>
      <Clock className="w-4 h-4 flex-shrink-0" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}

// ── Phase: Brief ──────────────────────────────────────────────────────────────

function BriefPhase({ station, onStart, isAr }: { station: OSCEStation; onStart: () => void; isAr: boolean }) {
  const typeColors: Record<string, string> = {
    history_taking: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    examination: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    communication: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    procedure: "bg-red-500/10 text-red-600 border-red-500/20",
    data_interpretation: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    mixed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };
  const diffColors: Record<string, string> = {
    year1: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    year2: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    year3: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    year4: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    finals: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    postgrad: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">

        {/* Station header */}
        <div className="medpulse-card glass level-2 p-8 border border-[var(--border-subtle)] shadow-xl">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${typeColors[station.stationType] ?? "bg-slate-500/10 text-slate-600 border-slate-500/20"}`}>
              {STATION_TYPE_LABELS[station.stationType]}
            </span>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${diffColors[station.difficulty] ?? "bg-slate-500/10 text-slate-600 border-slate-500/20"}`}>
              {DIFFICULTY_LABELS[station.difficulty] ?? station.difficulty}
            </span>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border bg-[var(--bg-2)] border-[var(--border-subtle)] text-[var(--text-tertiary)] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {station.durationMinutes} min
            </span>
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border bg-[var(--bg-2)] border-[var(--border-subtle)] text-[var(--text-tertiary)]">
              {station.specialty}
            </span>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-medical-indigo)]/20">
              <Stethoscope className="w-5 h-5 text-[var(--color-medical-indigo)]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">{station.id}</p>
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">{station.title}</h1>
              <p className="text-sm text-[var(--text-tertiary)] font-medium mt-0.5">{station.titleAr}</p>
            </div>
          </div>

          {/* Candidate brief */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {isAr ? "التوجيه للمرشح" : "Candidate Brief"}
            </p>
            <p className="text-sm md:text-[15px] font-semibold leading-relaxed text-[var(--text-primary)]">
              {station.patientBrief}
            </p>
          </div>

          {/* Patient info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: isAr ? "الاسم" : "Name", value: station.patientName },
              { label: isAr ? "العمر" : "Age", value: `${station.patientAge} ${isAr ? "سنة" : "yrs"}` },
              { label: isAr ? "الجنس" : "Sex", value: station.patientSex === "M" ? (isAr ? "ذكر" : "Male") : (isAr ? "أنثى" : "Female") },
              { label: isAr ? "الموقع" : "Setting", value: station.patientSetting },
            ].map(d => (
              <div key={d.label} className="bg-[var(--bg-2)] rounded-xl p-3 border border-[var(--border-subtle)]">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">{d.label}</p>
                <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Marking breakdown preview */}
          <div className="border-t border-[var(--border-subtle)] pt-5 mb-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              {isAr ? "توزيع الدرجات" : "Marking Domains"} — {station.markingScheme.totalMarks} {isAr ? "درجة" : "marks total"}
            </p>
            <div className="flex flex-wrap gap-2">
              {station.markingScheme.domains.map(d => (
                <span key={d.name} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {d.name} <span className="text-[var(--text-tertiary)]">({d.maxMarks})</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] shadow-[0_10px_30px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_14px_35px_-8px_rgba(99,102,241,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <Activity className="w-5 h-5" />
            {isAr ? "بدء المحاكاة" : "Begin Station"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Phase: Active Simulation ──────────────────────────────────────────────────

function ActivePhase({
  station, messages, input, setInput, sending, onSend, onFinish, isAr
}: {
  station: OSCEStation;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  onSend: () => void;
  onFinish: () => void;
  isAr: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScheme, setShowScheme] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && input.trim()) onSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center flex-shrink-0 border border-[var(--color-medical-indigo)]/20">
            <User className="w-4 h-4 text-[var(--color-medical-indigo)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-[var(--text-primary)] truncate">{station.patientName}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium">{station.patientAge}y · {station.patientSetting}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Timer totalSeconds={station.durationMinutes * 60} onExpire={onFinish} />
          <button
            onClick={onFinish}
            className="text-[11px] font-black px-4 py-2 rounded-xl bg-[var(--color-medical-indigo)] text-white hover:bg-[var(--color-medical-indigo)]/90 uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {isAr ? "إنهاء" : "Finish"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Opening context */}
            <div className="mx-auto max-w-lg text-center py-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">
                <AlertCircle className="w-3.5 h-3.5" />
                {isAr ? "بدأت المحاكاة" : "Station Active"}
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">{station.patientBrief}</p>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black ${
                  msg.role === "user"
                    ? "bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] border border-[var(--color-medical-indigo)]/20"
                    : "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                }`}>
                  {msg.role === "user" ? "Dr" : "Pt"}
                </div>
                <div className={`max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl text-[13px] md:text-sm font-medium leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--color-medical-indigo)]/10 text-[var(--text-primary)] border border-[var(--color-medical-indigo)]/20 rounded-tr-sm"
                    : "bg-[var(--bg-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-500/10 border border-teal-500/20">
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-2)] border border-[var(--border-subtle)]">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[var(--border-subtle)] p-3 bg-[var(--bg-0)]/80 backdrop-blur-md">
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
                placeholder={isAr ? "اكتب سؤالك للمريض... (Enter للإرسال)" : "Type your question to the patient... (Enter to send)"}
                className="flex-1 resize-none bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-[13px] md:text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-indigo)]/20 focus:border-[var(--color-medical-indigo)]/30 transition-all min-h-[48px] max-h-36 overflow-y-auto"
                style={{ lineHeight: "1.5" }}
              />
              <button
                onClick={onSend}
                disabled={sending || !input.trim()}
                className="w-12 h-12 rounded-2xl bg-[var(--color-medical-indigo)] text-white flex items-center justify-center flex-shrink-0 hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_4px_14px_-4px_rgba(99,102,241,0.5)]"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right panel — marking scheme (desktop) */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-1)] overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => setShowScheme(p => !p)}
              className="flex items-center justify-between w-full text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{isAr ? "نظام التقييم" : "Marking Scheme"}</span>
              {showScheme ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showScheme && (
            <div className="p-4 space-y-4">
              {station.markingScheme.domains.map(d => (
                <div key={d.name} className="space-y-2">
                  <p className="text-[11px] font-black text-[var(--text-primary)] flex items-center justify-between">
                    <span>{d.name}</span>
                    <span className="text-[var(--text-tertiary)]">{d.maxMarks}m</span>
                  </p>
                  <ul className="space-y-1">
                    {d.criteria.map((c, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-medical-indigo)]/40 mt-1.5" />
                        <span>{c.item} <span className="text-[var(--text-tertiary)]">({c.marks})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-[var(--border-subtle)] mt-auto">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              {isAr ? "نقاط التعلم" : "Learning Points"}
            </p>
            <ul className="space-y-2">
              {station.learningPoints.map((lp, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-[var(--text-secondary)] font-medium">
                  <Star className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  {lp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Phase: Results ────────────────────────────────────────────────────────────

function ResultsPhase({
  station, result, messages, onRetry, isAr
}: {
  station: OSCEStation;
  result: ExaminerResult;
  messages: Message[];
  onRetry: () => void;
  isAr: boolean;
}) {
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">

      {/* Result card */}
      <div className="medpulse-card glass level-2 p-8 border border-[var(--border-subtle)] shadow-xl">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-6 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          {isAr ? "نتيجة المحطة" : "Station Results"} — {station.id}
        </p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <ScoreRing percentage={result.percentage} passFail={result.pass_fail} />

          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{station.title}</h2>
              <span className="text-lg font-black text-[var(--color-medical-indigo)]">{result.total_score}/{result.max_score}</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] font-medium">{station.specialty} · {DIFFICULTY_LABELS[station.difficulty]}</p>

            {/* Domain bars */}
            <div className="space-y-3 pt-2">
              {result.breakdown.map((d, i) => {
                const pct = d.max > 0 ? (d.earned / d.max) * 100 : 0;
                const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-[var(--text-secondary)] truncate max-w-[70%]">{d.name}</span>
                      <span className="text-[var(--text-primary)]">{d.earned}/{d.max}</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {d.comments && (
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-medium">{d.comments}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Positives & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="medpulse-card p-6 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {isAr ? "نقاط القوة" : "What Went Well"}
          </p>
          <ul className="space-y-2">
            {result.positives.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="medpulse-card p-6 border border-amber-500/20 bg-amber-500/5">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            {isAr ? "نقاط التحسين" : "Areas to Improve"}
          </p>
          <ul className="space-y-2">
            {result.improvements.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="medpulse-card glass level-1 p-6 border border-[var(--border-subtle)]">
        <button
          onClick={() => setExpandedFeedback(p => !p)}
          className="flex items-center justify-between w-full text-left"
        >
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            {isAr ? "تقييم المحكّم التفصيلي" : "Examiner AI Narrative Feedback"}
          </p>
          {expandedFeedback ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
        </button>
        {expandedFeedback && (
          <p className="mt-4 text-sm text-[var(--text-secondary)] font-medium leading-relaxed whitespace-pre-wrap">{result.ai_feedback}</p>
        )}
      </div>

      {/* Learning Points */}
      <div className="medpulse-card p-6 border border-[var(--border-subtle)]">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-4 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {isAr ? "النقاط التعليمية الرئيسية" : "Key Learning Points"}
        </p>
        <ul className="space-y-2">
          {station.learningPoints.map((lp, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              {lp}
            </li>
          ))}
        </ul>
      </div>

      {/* Model answer */}
      <div className="medpulse-card p-6 border border-[var(--color-medical-indigo)]/20 bg-[var(--color-medical-indigo)]/5">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          {isAr ? "الإجابة النموذجية" : "Model Answer"}
        </p>
        <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">{station.markingScheme.modelAnswer}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all uppercase tracking-widest"
        >
          <RotateCcw className="w-4 h-4" />
          {isAr ? "إعادة المحطة" : "Retry Station"}
        </button>
        <Link
          href="/simulator"
          className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-[var(--color-medical-indigo)] text-white hover:bg-[var(--color-medical-indigo)]/90 transition-all uppercase tracking-widest shadow-[0_6px_20px_-6px_rgba(99,102,241,0.5)]"
        >
          <Home className="w-4 h-4" />
          {isAr ? "جميع المحطات" : "All Stations"}
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StationPage({ params }: { params: Promise<{ stationId: string }> }) {
  const { stationId } = use(params);
  const router = useRouter();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const station = OSCE_STATIONS.find(s => s.id === stationId);

  const [phase, setPhase] = useState<Phase>("brief");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<ExaminerResult | null>(null);
  const [error, setError] = useState("");

  const handleFinish = useCallback(async () => {
    if (messages.length < 2) {
      setPhase("results");
      return;
    }
    setPhase("results");
    setEvaluating(true);

    try {
      const res = await fetch("/api/osce/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, stationId, mode: "examiner_feedback" }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json() as ExaminerResult;
      setResult(data);
    } catch {
      setError(isAr ? "فشل التقييم. يرجى المحاولة مرة أخرى." : "Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  }, [messages, stationId, isAr]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const newMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setInput("");
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/osce/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMsgs, stationId, mode: "patient" }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { content: string };
      setMessages(prev => [...prev, { role: "assistant", content: data.content, timestamp: Date.now() }]);
    } catch {
      setError(isAr ? "خطأ في الاتصال. يرجى المحاولة." : "Connection error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, stationId, isAr]);

  const handleRetry = () => {
    setPhase("brief");
    setMessages([]);
    setInput("");
    setResult(null);
    setError("");
    setEvaluating(false);
  };

  if (!station) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            {isAr ? "المحطة غير موجودة" : "Station Not Found"}
          </h2>
          <Link href="/simulator" className="inline-flex items-center gap-2 text-[var(--color-medical-indigo)] font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" />
            {isAr ? "العودة للمحاكاة" : "Back to Simulator"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back nav — only on brief */}
      {phase === "brief" && (
        <div className="px-4 pt-4 md:px-8 md:pt-6">
          <Link href="/simulator" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[13px] font-bold transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {isAr ? "جميع المحطات" : "All Stations"}
          </Link>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {phase === "brief" && (
        <BriefPhase station={station} onStart={() => setPhase("active")} isAr={isAr} />
      )}

      {phase === "active" && (
        <ActivePhase
          station={station}
          messages={messages}
          input={input}
          setInput={setInput}
          sending={sending}
          onSend={handleSend}
          onFinish={handleFinish}
          isAr={isAr}
        />
      )}

      {phase === "results" && (
        evaluating ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6">
            <div className="w-20 h-20 rounded-[24px] bg-[var(--color-medical-indigo)]/10 flex items-center justify-center border border-[var(--color-medical-indigo)]/20 shadow-xl">
              <Loader2 className="w-10 h-10 text-[var(--color-medical-indigo)] animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-extrabold text-[var(--text-primary)]">
                {isAr ? "يُحلّل المحكّم أداءك..." : "Examiner AI is marking your performance..."}
              </p>
              <p className="text-sm text-[var(--text-tertiary)] font-medium">
                {isAr ? "تقييم شامل وفق مخطط التقييم" : "Comprehensive assessment against the marking scheme"}
              </p>
            </div>
          </div>
        ) : result ? (
          <ResultsPhase station={station} result={result} messages={messages} onRetry={handleRetry} isAr={isAr} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4 p-8">
            <XCircle className="w-16 h-16 text-rose-500" />
            <p className="text-lg font-extrabold text-[var(--text-primary)] text-center">
              {isAr ? "فشل التقييم — لا توجد محادثة كافية" : "No conversation to evaluate"}
            </p>
            <button onClick={handleRetry} className="text-[var(--color-medical-indigo)] font-bold flex items-center gap-2 hover:underline">
              <RotateCcw className="w-4 h-4" /> {isAr ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        )
      )}
    </>
  );
}
