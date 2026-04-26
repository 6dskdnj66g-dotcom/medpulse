/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/simulator/[stationId]/page.tsx
// Dual-mode: old OSCE_STATIONS format + new Phase 7 JSON format
"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import {
  ArrowLeft, Clock, Send, Loader2, CheckCircle, XCircle,
  AlertCircle, ChevronDown, ChevronUp, Trophy, Target,
  BookOpen, Star, TrendingUp, TrendingDown, User, Stethoscope,
  RotateCcw, Home, ChevronRight, Activity, Brain, Mic, MicOff, Volume2, VolumeX
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { OSCE_STATIONS, DIFFICULTY_LABELS, STATION_TYPE_LABELS, type OSCEStation as OldOSCEStation } from "@/features/osce/services/osceStations";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { supabase } from "@/core/database/supabase";

// ── New format imports ────────────────────────────────────────────────────────
import type { OSCEStation, OSCESession, SessionScores } from "@/lib/osce/types";
import { SessionManager } from "@/lib/osce/session-manager";
import { InvestigationDetector } from "@/lib/osce/investigation-detector";
import { StationBriefing } from "@/components/osce/StationBriefing";
import { CountdownTimer } from "@/components/osce/CountdownTimer";
import { RubricSidebar } from "@/components/osce/RubricSidebar";
import { InvestigationCard } from "@/components/osce/InvestigationCard";
import { FinalReport } from "@/components/osce/FinalReport";

// ── Types (old format) ────────────────────────────────────────────────────────

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

// ── Score Ring (old format) ───────────────────────────────────────────────────

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

// ── Timer (old format) ────────────────────────────────────────────────────────

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

// ── BriefPhase (old format) ───────────────────────────────────────────────────

function BriefPhase({ station, onStart, isAr }: { station: OldOSCEStation; onStart: () => void; isAr: boolean }) {
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
              <h1 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] leading-tight">{isAr && station.titleAr ? station.titleAr : station.title}</h1>
            </div>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 mb-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {isAr ? "التوجيه للمرشح" : "Candidate Brief"}
            </p>
            <p className="text-sm md:text-[15px] font-semibold leading-relaxed text-[var(--text-primary)]">
              {station.patientBrief}
            </p>
          </div>
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
          <div className="border-t border-[var(--border-subtle)] pt-5 mb-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              {isAr ? "توزيع الدرجات" : "Marking Domains"} — {station.markingScheme.totalMarks} {isAr ? "درجة" : "marks total"}
            </p>
            <div className="flex flex-wrap gap-2">
              {station.markingScheme.domains.map((d: any) => (
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

// ── ActivePhase (old format) ──────────────────────────────────────────────────

function ActivePhase({
  station, messages, input, setInput, sending, onSend, onFinish, isAr
}: {
  station: OldOSCEStation;
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = isAr ? "ar-SA" : "en-US";
        recognitionRef.current.onresult = (event: any) => {
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
          }
          if (final) setInput(input + (input.endsWith(" ") || input === "" ? "" : " ") + final.trim());
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [isAr, setInput, input]);

  const speakText = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = isAr ? "ar-SA" : "en-US";
      utt.rate = 0.95;
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => setIsSpeaking(false);
      utt.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
  }, [isAr]);

  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant") speakText(last.content);
    }
  }, [messages, voiceEnabled, speakText]);

  const toggleListen = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInput(""); recognitionRef.current?.start(); setIsListening(true); }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sending && input.trim()) onSend(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
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

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <div className="hidden md:flex w-1/3 min-w-[300px] border-r border-[var(--border-subtle)] bg-black/5 relative group items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-medical-indigo)]/10 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] drop-shadow-md">
                {isAr ? "غرفة الفحص 3D" : "Live 3D Exam Room"}
              </span>
            </span>
          </div>
          <iframe
            title="3D Patient Exam"
            allowFullScreen
            allow="autoplay; fullscreen; xr-spatial-tracking"
            src="https://sketchfab.com/models/3facd48dff0945f7b96f95ad31c4beb5/embed?autostart=1&preload=1&ui_controls=0&ui_infos=0&ui_watermark=0&transparent=1"
            className="absolute inset-0 w-full h-full object-contain pointer-events-auto"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.1))" }}
          ></iframe>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-0)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

            {station.interactiveExams && (
              <div className="mx-auto max-w-lg my-6">
                <div className="bg-[var(--color-medical-indigo)]/5 border border-[var(--color-medical-indigo)]/20 p-4 rounded-2xl">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {isAr ? "الفحص السريري التفاعلي" : "Interactive Physical Exams"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {station.interactiveExams.map((exam: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(isAr ? `[نظام الفحص]: قمت بـ "${exam.nameAr}". ما هي النتيجة؟` : `[EXAM]: I am performing "${exam.name}". What is the finding?`);
                          setTimeout(() => onSend(), 100);
                        }}
                        className="bg-[var(--bg-2)] hover:bg-[var(--color-medical-indigo)]/10 border border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/30 rounded-xl p-3 text-left transition-all group flex items-start gap-3"
                      >
                        <div className="bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">{exam.category}</p>
                          <p className="text-[12px] font-bold text-[var(--text-primary)]">{isAr && exam.nameAr ? exam.nameAr : exam.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
            {isSpeaking && (
              <div className="flex justify-center my-4">
                <div className="flex items-center gap-2 bg-teal-500/10 text-teal-600 px-4 py-2 rounded-full border border-teal-500/20 text-[10px] font-black tracking-widest uppercase">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  {isAr ? "المريض يتحدث..." : "Patient Speaking..."}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex-shrink-0 border-t border-[var(--border-subtle)] p-3 bg-[var(--bg-0)]/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-2 mb-2 max-w-4xl mx-auto">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors"
              >
                {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {voiceEnabled ? (isAr ? "صوت المريض مفعّل" : "Patient Audio On") : (isAr ? "صوت المريض متوقف" : "Patient Audio Off")}
              </button>
            </div>
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={toggleListen}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isListening
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-500 animate-pulse"
                    : "bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--color-medical-indigo)]"
                }`}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
                placeholder={isListening ? (isAr ? "تحدث الآن..." : "Listening...") : (isAr ? "اكتب سؤالك..." : "Type your question... (Enter to send)")}
                className="flex-1 resize-none bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-[13px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-indigo)]/20 transition-all min-h-[48px] max-h-36 overflow-y-auto"
              />
              <button
                onClick={onSend}
                disabled={sending || !input.trim()}
                className="w-12 h-12 rounded-2xl bg-[var(--color-medical-indigo)] text-white flex items-center justify-center flex-shrink-0 hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

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
              {station.markingScheme.domains.map((d: any) => (
                <div key={d.name} className="space-y-2">
                  <p className="text-[11px] font-black text-[var(--text-primary)] flex items-center justify-between">
                    <span>{d.name}</span>
                    <span className="text-[var(--text-tertiary)]">{d.maxMarks}m</span>
                  </p>
                  <ul className="space-y-1">
                    {d.criteria.map((c: any, j: number) => (
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
              {station.learningPoints.map((lp: any, i: number) => (
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

// ── ResultsPhase (old format) ─────────────────────────────────────────────────

function ResultsPhase({
  station, result, onRetry, isAr
}: {
  station: OldOSCEStation;
  result: ExaminerResult;
  onRetry: () => void;
  isAr: boolean;
}) {
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
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
                      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    {d.comments && <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-medium">{d.comments}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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

      <div className="medpulse-card glass level-1 p-6 border border-[var(--border-subtle)]">
        <button onClick={() => setExpandedFeedback(p => !p)} className="flex items-center justify-between w-full text-left">
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

      <div className="medpulse-card p-6 border border-[var(--border-subtle)]">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-4 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {isAr ? "النقاط التعليمية الرئيسية" : "Key Learning Points"}
        </p>
        <ul className="space-y-2">
          {station.learningPoints.map((lp: any, i: number) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] font-medium">
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              {lp}
            </li>
          ))}
        </ul>
      </div>

      <div className="medpulse-card p-6 border border-[var(--color-medical-indigo)]/20 bg-[var(--color-medical-indigo)]/5">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          {isAr ? "الإجابة النموذجية" : "Model Answer"}
        </p>
        <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed">{station.markingScheme.modelAnswer}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onRetry} className="flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all uppercase tracking-widest">
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

// ── NEW FORMAT: Three-column active phase ─────────────────────────────────────

interface NewMessage {
  id: string;
  role: "user" | "patient" | "investigation";
  content: string;
  timestamp: number;
  investigationId?: string;
}

function NewFormatActivePage({
  station,
  onComplete,
}: {
  station: OSCEStation;
  onComplete: () => void;
}) {
  const sessionMgr = useRef<SessionManager | null>(null);
  const invDetector = useRef<InvestigationDetector | null>(null);
  const [messages, setMessages] = useState<NewMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [releasedInvestigations, setReleasedInvestigations] = useState<string[]>([]);
  const [rubricProgress, setRubricProgress] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<SessionScores>({
    dataGathering: { earned: 0, max: station.rubric.domains.dataGathering.reduce((s, i) => s + i.weight, 0), percentage: 0 },
    clinicalManagement: { earned: 0, max: station.rubric.domains.clinicalManagement.reduce((s, i) => s + i.weight, 0), percentage: 0 },
    interpersonalSkills: { earned: 0, max: station.rubric.domains.interpersonalSkills.reduce((s, i) => s + i.weight, 0), percentage: 0 },
    total: 0,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionMgr.current = new SessionManager(station);
    invDetector.current = new InvestigationDetector(station);
    sessionMgr.current.startActive();
  }, [station]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function updateRubricForMessage(text: string) {
    const lower = text.toLowerCase();
    const newProgress = { ...rubricProgress };
    let changed = false;

    const allItems = [
      ...station.rubric.domains.dataGathering,
      ...station.rubric.domains.clinicalManagement,
      ...station.rubric.domains.interpersonalSkills,
    ];

    for (const item of allItems) {
      if (newProgress[item.id]?.triggered) continue;

      let triggered = false;
      if (item.detectionMethod === "keyword" && item.keywordMatchers) {
        const hasPrimary = item.keywordMatchers.primary.some(kw => lower.includes(kw.toLowerCase()));
        if (hasPrimary) triggered = true;
      } else if (item.detectionMethod === "diagnosis-stated" && item.keywordMatchers) {
        const diagVerbs = ["i think", "this is", "looks like", "diagnosis", "consistent with", "likely", "probably", "i believe"];
        if (diagVerbs.some(v => lower.includes(v))) {
          triggered = item.keywordMatchers.primary.some(kw => lower.includes(kw.toLowerCase()));
        }
      } else if (item.detectionMethod === "investigation-requested" && item.investigationId) {
        triggered = releasedInvestigations.includes(item.investigationId);
      }

      if (triggered) {
        newProgress[item.id] = { itemId: item.id, triggered: true, triggeredAt: Date.now(), quality: "adequate", pointsAwarded: item.weight * 0.7 };
        changed = true;
      }
    }

    if (changed) {
      setRubricProgress(newProgress);

      const calcDomain = (items: typeof allItems) => {
        const earned = items.reduce((s, i) => s + (newProgress[i.id]?.pointsAwarded ?? 0), 0);
        const max = items.reduce((s, i) => s + i.weight, 0);
        return { earned: Math.round(earned * 10) / 10, max, percentage: max > 0 ? Math.round((earned / max) * 1000) / 10 : 0 };
      };

      const newScores = {
        dataGathering: calcDomain(station.rubric.domains.dataGathering),
        clinicalManagement: calcDomain(station.rubric.domains.clinicalManagement),
        interpersonalSkills: calcDomain(station.rubric.domains.interpersonalSkills),
        total: 0,
      };
      newScores.total = Math.round((newScores.dataGathering.earned + newScores.clinicalManagement.earned + newScores.interpersonalSkills.earned) * 10) / 10;
      setScores(newScores);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSending(true);
    setError("");

    const userMsg: NewMessage = { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    updateRubricForMessage(text);

    // Check investigations
    const invs = invDetector.current?.detectMultiple(text) ?? [];
    const newReleased = [...releasedInvestigations];
    const invMessages: NewMessage[] = [];
    for (const inv of invs) {
      newReleased.push(inv.id);
      invMessages.push({
        id: crypto.randomUUID(),
        role: "investigation",
        content: JSON.stringify(inv),
        timestamp: Date.now(),
        investigationId: inv.id,
      });
    }
    if (newReleased.length > releasedInvestigations.length) {
      setReleasedInvestigations(newReleased);
    }

    try {
      const conversationHistory = updatedMessages.map(m => ({
        id: m.id,
        role: m.role === "investigation" ? "system" : m.role,
        content: m.role === "investigation" ? "[Investigation result shown to student]" : m.content,
        timestamp: m.timestamp,
      }));

      const res = await fetch("/api/osce/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId: station.id,
          studentMessage: text,
          conversationHistory,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { patientResponse: string };

      const patientMsg: NewMessage = { id: crypto.randomUUID(), role: "patient", content: data.patientResponse, timestamp: Date.now() };
      setMessages(prev => [...prev, ...invMessages, patientMsg]);
    } catch {
      setError("Connection error. Please try again.");
      setMessages(updatedMessages);
    } finally {
      setSending(false);
    }
  }

  function finish() {
    if (sessionMgr.current) {
      sessionMgr.current.updateScores(scores);
      sessionMgr.current.complete();
    }
    onComplete();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sending && input.trim()) sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
            <User className="w-4 h-4 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold text-[var(--text-primary)] truncate">{station.patient.name}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium">{station.patient.age}y · {station.patient.gender} · {station.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CountdownTimer totalSeconds={station.durationMinutes * 60} onExpire={finish} />
          <button
            onClick={finish}
            className="text-[11px] font-black px-4 py-2 rounded-xl bg-[var(--color-medical-indigo)] text-white hover:bg-[var(--color-medical-indigo)]/90 uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Finish
          </button>
        </div>
      </div>

      {/* Three-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-0)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Opening context */}
            <div className="mx-auto max-w-2xl text-center py-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Station Active
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                {station.candidateInstructions.slice(0, 200)}...
              </p>
            </div>

            {messages.map(msg => {
              if (msg.role === "investigation") {
                try {
                  const inv = JSON.parse(msg.content);
                  return (
                    <div key={msg.id} className="max-w-lg mx-auto">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)]">
                        <Target className="w-3.5 h-3.5" />
                        Investigation Result
                      </div>
                      <InvestigationCard investigation={inv} />
                    </div>
                  );
                } catch { return null; }
              }

              return (
                <div key={msg.id} className={`flex gap-2.5 max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black ${
                    msg.role === "user"
                      ? "bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] border border-[var(--color-medical-indigo)]/20"
                      : "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                  }`}>
                    {msg.role === "user" ? "Dr" : "Pt"}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--color-medical-indigo)]/10 text-[var(--text-primary)] border border-[var(--color-medical-indigo)]/20 rounded-tr-sm"
                      : "bg-[var(--bg-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-500/10 border border-teal-500/20">
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--bg-2)] border border-[var(--border-subtle)]">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-rose-500 font-medium text-center py-2">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[var(--border-subtle)] p-3 bg-[var(--bg-0)]/80 backdrop-blur-md">
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
                placeholder="Speak to the patient, request investigations... (Enter to send)"
                className="flex-1 resize-none bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-[13px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-indigo)]/20 transition-all min-h-[48px] max-h-32 overflow-y-auto"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="w-12 h-12 rounded-2xl bg-[var(--color-medical-indigo)] text-white flex items-center justify-center flex-shrink-0 hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Rubric sidebar */}
        <div className="hidden lg:flex flex-col w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-1)] overflow-hidden flex-shrink-0">
          <RubricSidebar
            rubric={station.rubric}
            progress={rubricProgress}
            scores={scores}
          />
        </div>
      </div>
    </div>
  );
}

// ── NEW FORMAT: Station Page wrapper ─────────────────────────────────────────

function NewFormatStationPage({ stationId }: { stationId: string }) {
  const [station, setStation] = useState<OSCEStation | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [phase, setPhase] = useState<"loading" | "briefing" | "active" | "completed">("loading");
  const [sessionData, setSessionData] = useState<OSCESession | null>(null);
  const [readingTimeRemaining, setReadingTimeRemaining] = useState(0);
  const sessionMgrRef = useRef<SessionManager | null>(null);

  useEffect(() => {
    fetch(`/api/osce/station/${stationId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<OSCEStation>;
      })
      .then(data => {
        setStation(data);
        sessionMgrRef.current = new SessionManager(data);
        setReadingTimeRemaining(Math.round(data.readingTimeMinutes * 60));
        setPhase("briefing");
      })
      .catch(() => setLoadError(true));
  }, [stationId]);

  useEffect(() => {
    if (phase !== "briefing" || readingTimeRemaining <= 0) return;
    const t = setInterval(() => {
      setReadingTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase, readingTimeRemaining]);

  const handleStart = () => {
    setPhase("active");
  };

  const handleComplete = () => {
    if (sessionMgrRef.current) {
      setSessionData(sessionMgrRef.current.getSession());
    }
    setPhase("completed");
  };

  const handleRetry = () => {
    if (station) {
      sessionMgrRef.current = new SessionManager(station);
      setReadingTimeRemaining(Math.round(station.readingTimeMinutes * 60));
      setPhase("briefing");
      setSessionData(null);
    }
  };

  if (loadError) return null;

  if (phase === "loading" || !station) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 text-[var(--color-medical-indigo)] animate-spin" />
      </div>
    );
  }

  if (phase === "briefing") {
    return (
      <StationBriefing
        station={station}
        onStart={handleStart}
        readingTimeRemaining={readingTimeRemaining}
      />
    );
  }

  if (phase === "active") {
    return <NewFormatActivePage station={station} onComplete={handleComplete} />;
  }

  if (phase === "completed" && sessionData) {
    return (
      <FinalReport
        station={station}
        session={sessionData}
        onRetry={handleRetry}
      />
    );
  }

  return null;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StationPage({ params }: { params: Promise<{ stationId: string }> }) {
  const { stationId } = use(params);
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const { user } = useSupabaseAuth();

  const saveResultLocal = useCallback(async (scoreTotal: number, maxScore: number, passFail: string, sid: string, resultData: any) => {
    try {
      const history = JSON.parse(localStorage.getItem("osce_history") || "[]");
      history.push({ stationId: sid, score: scoreTotal, maxScore, passFail, date: new Date().toISOString() });
      localStorage.setItem("osce_history", JSON.stringify(history));
    } catch { /* ignore */ }

    if (user) {
      try {
        await supabase.from("clinical_records").insert({
          user_id: user.id,
          type: "osce_attempt",
          title: `OSCE: ${sid} (${passFail.toUpperCase()})`,
          content: { score: scoreTotal, max_score: maxScore, pass_fail: passFail, details: resultData },
        });
      } catch { /* ignore */ }
    }
  }, [user]);

  // Check if this is an old-format station
  const oldStation = OSCE_STATIONS.find((s: any) => s.id === stationId);

  const [phase, setPhase] = useState<Phase>("brief");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<ExaminerResult | null>(null);
  const [error, setError] = useState("");

  const handleFinish = useCallback(async () => {
    if (messages.length < 2) { setPhase("results"); return; }
    setPhase("results");
    setEvaluating(true);
    try {
      const res = await fetch("/api/osce/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, stationId, mode: "examiner_feedback", lang: isAr ? "ar" : "en" }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const data = await res.json() as ExaminerResult;
      setResult(data);
      if (oldStation) saveResultLocal(data.total_score, data.max_score, data.pass_fail, oldStation.id, data);
    } catch {
      setError(isAr ? "فشل التقييم. يرجى المحاولة مرة أخرى." : "Evaluation failed. Please try again.");
    } finally {
      setEvaluating(false);
    }
  }, [messages, stationId, isAr, saveResultLocal, oldStation]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    const newMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/osce/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, stationId, mode: "patient", lang: isAr ? "ar" : "en" }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { content: string };
      setMessages(prev => [...prev, { role: "assistant", content: data.content, timestamp: Date.now() }]);
    } catch {
      setError(isAr ? "خطأ في الاتصال." : "Connection error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, stationId, isAr]);

  const handleRetry = () => { setPhase("brief"); setMessages([]); setInput(""); setResult(null); setError(""); setEvaluating(false); };

  // If no old station found → try new format
  if (!oldStation) {
    return (
      <>
        {phase === "brief" && (
          <div className="px-4 pt-4 md:px-8 md:pt-6">
            <Link href="/simulator" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[13px] font-bold transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              All Stations
            </Link>
          </div>
        )}
        <NewFormatStationPage stationId={stationId} />
      </>
    );
  }

  // Old format station rendering
  return (
    <>
      {phase === "brief" && (
        <div className="px-4 pt-4 md:px-8 md:pt-6">
          <Link href="/simulator" className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[13px] font-bold transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {isAr ? "جميع المحطات" : "All Stations"}
          </Link>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white text-[13px] font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError("")} className="ml-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {phase === "brief" && (
        <BriefPhase station={oldStation} onStart={() => setPhase("active")} isAr={isAr} />
      )}

      {phase === "active" && (
        <ActivePhase
          station={oldStation}
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
          <ResultsPhase station={oldStation} result={result} onRetry={handleRetry} isAr={isAr} />
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
