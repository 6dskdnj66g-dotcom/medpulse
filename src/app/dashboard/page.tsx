"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Brain, Activity, BookOpen, Pill, Zap,
  HeartPulse, MessageSquare, FileText, Trophy, Flame, Star,
  ChevronRight, CheckCircle, XCircle, Target, Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAchievement } from "@/components/AchievementContext";
import { useLanguage } from "@/components/LanguageContext";

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Medical Student",         titleAr: "طالب طب",           xpRequired: 0,    color: "slate" },
  { level: 2, title: "Clinical Clerk",           titleAr: "طالب سريري",        xpRequired: 100,  color: "indigo" },
  { level: 3, title: "House Officer",            titleAr: "طبيب امتياز",       xpRequired: 300,  color: "sky" },
  { level: 4, title: "Registrar",                titleAr: "مقيم",              xpRequired: 600,  color: "teal" },
  { level: 5, title: "Senior Registrar",         titleAr: "مقيم أول",          xpRequired: 1000, color: "emerald" },
  { level: 6, title: "Consultant (MRCP)",        titleAr: "استشاري",           xpRequired: 2000, color: "amber" },
  { level: 7, title: "Board Certified Specialist",titleAr: "متخصص معتمد",     xpRequired: 4000, color: "orange" },
  { level: 8, title: "Professor of Medicine",    titleAr: "أستاذ طب",          xpRequired: 8000, color: "rose" },
];

function getLevel(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const lvl of LEVEL_THRESHOLDS) {
    if (xp >= lvl.xpRequired) current = lvl;
  }
  const nextIdx = LEVEL_THRESHOLDS.indexOf(current) + 1;
  return { current, next: LEVEL_THRESHOLDS[nextIdx] || null };
}

const MODULES = [
  { id: "mdt",         href: "/mdt",         icon: Brain,        color: "indigo",  titleEn: "MDT Debate",       titleAr: "مناظرة MDT" },
  { id: "simulator",   href: "/simulator",   icon: Activity,     color: "rose",    titleEn: "OSCE Simulator",   titleAr: "محاكي OSCE" },
  { id: "usmle",       href: "/usmle",       icon: Trophy,       color: "amber",   titleEn: "USMLE Mode",       titleAr: "وضع USMLE" },
  { id: "encyclopedia",href: "/encyclopedia",icon: BookOpen,     color: "sky",     titleEn: "Encyclopedia",     titleAr: "الموسوعة" },
  { id: "drug-checker",href: "/drug-checker",icon: Pill,         color: "teal",    titleEn: "Drug Checker",     titleAr: "تفاعل الأدوية" },
  { id: "ecg",         href: "/ecg",         icon: HeartPulse,   color: "red",     titleEn: "ECG Analysis",     titleAr: "تحليل ECG" },
  { id: "professors",  href: "/professors",  icon: Users,        color: "emerald", titleEn: "AI Professors",    titleAr: "الأساتذة الذكاء" },
  { id: "notes",       href: "/notes",       icon: FileText,     color: "purple",  titleEn: "Clinical Notes",   titleAr: "الملاحظات" },
  { id: "calculators", href: "/calculators", icon: Zap,          color: "cyan",    titleEn: "Calculators",      titleAr: "الحاسبات" },
  { id: "summarizer",  href: "/summarizer",  icon: MessageSquare,color: "violet",  titleEn: "Summarizer",       titleAr: "الملخص الذكي" },
];

interface Session {
  date: string;
  module: string;
  score: number;
  total: number;
}

const colorMap: Record<string, string> = {
  indigo:  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  teal:    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  orange:  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  red:     "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  slate:   "bg-slate-500/10 text-slate-600 dark:text-[var(--text-tertiary)]/70 border-slate-500/20",
  purple:  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  cyan:    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export default function DashboardPage() {
  const { isLoading } = useAuth();
  const { xp } = useAchievement();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [sessions] = useState<Session[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("medpulse_sessions");
    return stored ? (JSON.parse(stored) as Session[]) : [];
  });
  const [streak] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const lastDate = localStorage.getItem("medpulse_last_date");
    if (!lastDate) return 0;
    const diff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
    return (diff === 0 || diff === 1) ? Number(localStorage.getItem("medpulse_streak") || "0") : 0;
  });

  

  if (isLoading) return null;

  const { current: lvl, next: nextLvl } = getLevel(xp);
  const progress = nextLvl ? ((xp - lvl.xpRequired) / (nextLvl.xpRequired - lvl.xpRequired)) * 100 : 100;

  const totalAnswered = sessions.reduce((a, s) => a + s.total, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.score, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const lvlTitle = isAr ? lvl.titleAr : lvl.title;
  const nextLvlTitle = nextLvl ? (isAr ? nextLvl.titleAr : nextLvl.title) : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative space-y-8">
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
            {isAr ? "لوحة التحكم" : "Dashboard"}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">
            {isAr ? "مرحباً، طبيب المستقبل" : "Welcome back, Doctor"}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2">
            {isAr ? "تابع تقدمك وابدأ جلستك التدريبية" : "Track your progress and continue your learning session"}
          </p>
        </div>
        <Link href="/progress"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-1)] hover:bg-[var(--bg-2)] border border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)] hover:text-[var(--color-medical-indigo)] transition-all duration-300 text-sm font-bold shadow-sm active:scale-95 group">
          <TrendingUp className="w-4 h-4" />
          {isAr ? "التقدم الكامل" : "Full Progress"}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* XP Level Banner */}
      <div className={`medpulse-card relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 ${colorMap[lvl.color]}`}>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="relative z-10 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">
            {isAr ? "الرتبة الحالية" : "Current Rank"}
          </p>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">{lvlTitle}</h2>
          {nextLvl && (
            <p className="text-sm opacity-90 mt-2 font-medium">
              {isAr
                ? `${nextLvl.xpRequired - xp} نقطة للرتبة التالية: ${nextLvlTitle}`
                : `${nextLvl.xpRequired - xp} XP to ${nextLvlTitle}`}
            </p>
          )}
        </div>
        <div className="relative z-10 flex items-center gap-6 flex-shrink-0">
          <div className="text-center p-4 bg-[var(--bg-1)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-3xl font-black text-[var(--semantic-warning)] tabular-nums-data">{xp}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mt-1">XP</p>
          </div>
          <div className="text-center p-4 bg-[var(--bg-1)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-3xl font-black text-[var(--color-vital-cyan)] tabular-nums-data">{streak}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mt-1">{isAr ? "أيام" : "Streak"}</p>
          </div>
          <div className="text-center p-4 bg-[var(--bg-1)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-3xl font-black text-[var(--semantic-success)] tabular-nums-data">{accuracy}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mt-1">{isAr ? "دقة" : "Accuracy"}</p>
          </div>
        </div>
        
        {nextLvl && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[var(--bg-2)] opacity-30"></div>
        )}
        {nextLvl && (
          <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-vital-cyan)] transition-all duration-1000"
            style={{ width: `${progress}%` }}></div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAr ? "إجمالي XP" : "Total XP",      value: xp,            icon: Star,   color: "amber" },
          { label: isAr ? "الدقة" : "Accuracy",           value: `${accuracy}%`, icon: Target, color: "emerald" },
          { label: isAr ? "أيام التواصل" : "Day Streak",  value: streak,         icon: Flame,  color: "orange" },
          { label: isAr ? "جلسات" : "Sessions",           value: sessions.length,icon: Activity,color: "indigo" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`medpulse-card p-5 group ${colorMap[stat.color]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="w-4 h-4 opacity-90" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-[var(--text-primary)] tabular-nums-data tracking-tight">{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mt-2">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-5 ml-1">
          {isAr ? "الوحدات التدريبية" : "Training Modules"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <Link key={mod.id} href={mod.href}
                className={`medpulse-card p-6 flex flex-col items-center justify-center text-center gap-4 transition-all group hover:-translate-y-1 hover:shadow-xl ${colorMap[mod.color]}`}>
                <div className="relative w-12 h-12 rounded-2xl bg-white/60 dark:bg-black/30 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Icon className="w-6 h-6 opacity-90" />
                </div>
                <p className="text-sm font-extrabold leading-tight text-[var(--text-primary)]">{isAr ? mod.titleAr : mod.titleEn}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="medpulse-card p-6 md:p-8 flex flex-col h-full hover:scale-100">
          <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-6">
            {isAr ? "الجلسات الأخيرة" : "Recent Sessions"}
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-1)] flex items-center justify-center text-[var(--border-strong)] mb-4">
                <Trophy className="w-8 h-8 opacity-70" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-medium max-w-[200px] leading-relaxed">
                {isAr ? "أكمل وحدة تدريبية لتظهر هنا" : "Complete a training module to appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {sessions.slice(0, 6).map((s, i) => {
                const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                const passed = pct >= 70;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-subtle)] hover:bg-[var(--bg-2)] hover:border-[var(--color-medical-indigo)] hover:shadow-md transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${passed ? "bg-[var(--semantic-success)]/10" : "bg-[var(--semantic-error)]/10"}`}>
                      {passed
                        ? <CheckCircle className="w-5 h-5 text-[var(--semantic-success)]" />
                        : <XCircle className="w-5 h-5 text-[var(--semantic-error)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">{s.module}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] font-medium tracking-wide mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`flex flex-col items-end flex-shrink-0 ${passed ? "text-[var(--semantic-success)]" : "text-[var(--semantic-error)]"}`}>
                      <p className="text-lg font-black tracking-tight tabular-nums-data">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {sessions.length > 0 && (
            <Link href="/progress" className="mt-8 flex items-center justify-center gap-2 text-sm font-extrabold text-[var(--color-medical-indigo)] hover:text-[var(--color-clinical-violet)] hover:bg-[var(--color-medical-indigo)]/5 p-3 rounded-xl transition-colors">
              {isAr ? "عرض الكل" : "View all"} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Quick Tools */}
        <div className="medpulse-card p-6 md:p-8 hover:scale-100">
          <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] mb-6">
            {isAr ? "أدوات سريعة" : "Quick Tools"}
          </h2>
          <div className="space-y-4">
            {[
              { href: "/translator", icon: MessageSquare, color: "sky",   titleEn: "Medical Translator",    titleAr: "المترجم الطبي" },
              { href: "/library",    icon: BookOpen,      color: "teal",  titleEn: "Medical Library",       titleAr: "المكتبة الطبية" },
              { href: "/records",    icon: FileText,      color: "rose",  titleEn: "Patient Records",       titleAr: "سجلات المرضى" },
              { href: "/profile",    icon: Users,         color: "indigo",titleEn: "My Profile",            titleAr: "ملفي الشخصي" },
            ].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-subtle)] hover:bg-[var(--bg-2)] hover:shadow-lg transition-all group fade-in">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-300 ${colorMap[tool.color]}`}>
                    <Icon className="w-5 h-5 opacity-90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold text-[var(--text-primary)]">
                      {isAr ? tool.titleAr : tool.titleEn}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-1)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:bg-[var(--color-medical-indigo)]/10 group-hover:text-[var(--color-medical-indigo)] transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
