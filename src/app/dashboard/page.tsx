"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  slate:   "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  purple:  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  cyan:    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  const { current: lvl, next: nextLvl } = getLevel(xp);
  const progress = nextLvl ? ((xp - lvl.xpRequired) / (nextLvl.xpRequired - lvl.xpRequired)) * 100 : 100;

  const totalAnswered = sessions.reduce((a, s) => a + s.total, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.score, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const lvlTitle = isAr ? lvl.titleAr : lvl.title;
  const nextLvlTitle = nextLvl ? (isAr ? nextLvl.titleAr : nextLvl.title) : null;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 w-full page-transition space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            {isAr ? "لوحة التحكم" : "Dashboard"}
          </p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {isAr ? "مرحباً، طبيب المستقبل" : "Welcome back, Doctor"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAr ? "تابع تقدمك وابدأ جلستك التدريبية" : "Track your progress and continue your learning session"}
          </p>
        </div>
        <Link href="/progress"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all text-sm font-black text-slate-600 dark:text-slate-300">
          <TrendingUp className="w-4 h-4" />
          {isAr ? "التقدم الكامل" : "Full Progress"}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* XP Level Banner */}
      <div className={`premium-card p-6 border ${colorMap[lvl.color]}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              {isAr ? "الرتبة الحالية" : "Current Rank"}
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{lvlTitle}</h2>
            {nextLvl && (
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? `${nextLvl.xpRequired - xp} نقطة للرتبة التالية: ${nextLvlTitle}`
                  : `${nextLvl.xpRequired - xp} XP to ${nextLvlTitle}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-amber-500">{xp}</p>
              <p className="text-[10px] font-black uppercase text-slate-400">XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-orange-500">{streak}</p>
              <p className="text-[10px] font-black uppercase text-slate-400">{isAr ? "أيام" : "Streak"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-500">{accuracy}%</p>
              <p className="text-[10px] font-black uppercase text-slate-400">{isAr ? "دقة" : "Accuracy"}</p>
            </div>
          </div>
        </div>
        {nextLvl && (
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
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
            <div key={stat.label} className={`premium-card p-5 border ${colorMap[stat.color]}`}>
              <Icon className="w-5 h-5 mb-3" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
          {isAr ? "الوحدات التدريبية" : "Training Modules"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <Link key={mod.id} href={mod.href}
                className={`premium-card p-5 flex flex-col items-center text-center gap-3 border hover:scale-105 transition-all group ${colorMap[mod.color]}`}>
                <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-black leading-tight">{isAr ? mod.titleAr : mod.titleEn}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
            {isAr ? "الجلسات الأخيرة" : "Recent Sessions"}
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-bold">
                {isAr ? "أكمل وحدة تدريبية لتظهر هنا" : "Complete a training module to appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 6).map((s, i) => {
                const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                const passed = pct >= 70;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                      {passed
                        ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{s.module}</p>
                      <p className="text-[10px] text-slate-400">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-xs font-black flex-shrink-0 ${passed ? "text-emerald-600" : "text-rose-600"}`}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          )}
          {sessions.length > 0 && (
            <Link href="/progress" className="mt-4 flex items-center justify-center gap-2 text-xs font-black text-indigo-500 hover:text-indigo-600 transition-colors">
              {isAr ? "عرض الكل" : "View all"} <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Quick Tools */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
            {isAr ? "أدوات سريعة" : "Quick Tools"}
          </h2>
          <div className="space-y-3">
            {[
              { href: "/translator", icon: MessageSquare, color: "sky",   titleEn: "Medical Translator",    titleAr: "المترجم الطبي" },
              { href: "/library",    icon: BookOpen,      color: "teal",  titleEn: "Medical Library",       titleAr: "المكتبة الطبية" },
              { href: "/records",    icon: FileText,      color: "rose",  titleEn: "Patient Records",       titleAr: "سجلات المرضى" },
              { href: "/profile",    icon: Users,         color: "indigo",titleEn: "My Profile",            titleAr: "ملفي الشخصي" },
            ].map(tool => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[tool.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-white flex-1">
                    {isAr ? tool.titleAr : tool.titleEn}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
