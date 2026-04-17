"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Award, Target, BookOpen, Brain, Activity, MessageSquare, Flame, Star, ChevronRight, RotateCcw } from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";
import Link from "next/link";

interface Session {
  date: string;
  module: string;
  score: number;
  total: number;
}

const MODULES = [
  { id: "usmle", label: "USMLE Mode", icon: Brain, color: "indigo", href: "/usmle" },
  { id: "simulator", label: "OSCE Simulator", icon: Activity, color: "rose", href: "/simulator" },
  { id: "professors", label: "AI Professors", icon: MessageSquare, color: "emerald", href: "/professors" },
  { id: "encyclopedia", label: "Encyclopedia", icon: BookOpen, color: "sky", href: "/encyclopedia" },
];

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Medical Student", xpRequired: 0, color: "slate" },
  { level: 2, title: "Clinical Clerk", xpRequired: 100, color: "indigo" },
  { level: 3, title: "House Officer", xpRequired: 300, color: "sky" },
  { level: 4, title: "Registrar", xpRequired: 600, color: "teal" },
  { level: 5, title: "Senior Registrar", xpRequired: 1000, color: "emerald" },
  { level: 6, title: "Consultant (MRCP)", xpRequired: 2000, color: "amber" },
  { level: 7, title: "Board Certified Specialist", xpRequired: 4000, color: "orange" },
  { level: 8, title: "Professor of Medicine", xpRequired: 8000, color: "rose" },
];

function getLevel(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const lvl of LEVEL_THRESHOLDS) {
    if (xp >= lvl.xpRequired) current = lvl;
  }
  const nextIdx = LEVEL_THRESHOLDS.indexOf(current) + 1;
  const next = LEVEL_THRESHOLDS[nextIdx] || null;
  return { current, next };
}

export default function ProgressPage() {
  const { xp } = useAchievement();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("medpulse_sessions");
    if (stored) setSessions(JSON.parse(stored));
    const lastDate = localStorage.getItem("medpulse_last_date");
    const today = new Date().toDateString();
    if (lastDate) {
      const diff = Math.floor((new Date().getTime() - new Date(lastDate).getTime()) / 86400000);
      if (diff === 0 || diff === 1) setStreak(Number(localStorage.getItem("medpulse_streak") || "1"));
    }
    if (lastDate !== today) {
      localStorage.setItem("medpulse_last_date", today);
      const s = Number(localStorage.getItem("medpulse_streak") || "0");
      localStorage.setItem("medpulse_streak", String(s + 1));
      setStreak(s + 1);
    }
  }, []);

  const { current: lvl, next: nextLvl } = getLevel(xp);
  const progress = nextLvl ? ((xp - lvl.xpRequired) / (nextLvl.xpRequired - lvl.xpRequired)) * 100 : 100;

  const totalAnswered = sessions.reduce((a, s) => a + s.total, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.score, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const colorMap: Record<string, string> = {
    indigo:  "bg-indigo-500/10  text-indigo-600  dark:text-indigo-400  border-indigo-500/20",
    sky:     "bg-sky-500/10     text-sky-600     dark:text-sky-400     border-sky-500/20",
    teal:    "bg-teal-500/10    text-teal-600    dark:text-teal-400    border-teal-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    amber:   "bg-amber-500/10   text-amber-600   dark:text-amber-400   border-amber-500/20",
    orange:  "bg-orange-500/10  text-orange-600  dark:text-orange-400  border-orange-500/20",
    rose:    "bg-rose-500/10    text-rose-600    dark:text-rose-400    border-rose-500/20",
    slate:   "bg-slate-500/10   text-slate-600   dark:text-slate-400   border-slate-500/20",
  };

  /* icon-only color (no bg/border) for module icons */
  const iconColorMap: Record<string, string> = {
    indigo:  "bg-indigo-500/10  text-indigo-600  dark:text-indigo-400",
    sky:     "bg-sky-500/10     text-sky-600     dark:text-sky-400",
    teal:    "bg-teal-500/10    text-teal-600    dark:text-teal-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber:   "bg-amber-500/10   text-amber-600   dark:text-amber-400",
    orange:  "bg-orange-500/10  text-orange-600  dark:text-orange-400",
    rose:    "bg-rose-500/10    text-rose-600    dark:text-rose-400",
    slate:   "bg-slate-500/10   text-slate-600   dark:text-slate-400",
  };

  /* text-only for level roadmap */
  const textColorMap: Record<string, string> = {
    indigo:  "text-indigo-700  dark:text-indigo-400",
    sky:     "text-sky-700     dark:text-sky-400",
    teal:    "text-teal-700    dark:text-teal-400",
    emerald: "text-emerald-700 dark:text-emerald-400",
    amber:   "text-amber-700   dark:text-amber-400",
    orange:  "text-orange-700  dark:text-orange-400",
    rose:    "text-rose-700    dark:text-rose-400",
    slate:   "text-slate-700   dark:text-slate-400",
  };

  const dotColorMap: Record<string, string> = {
    indigo:  "bg-indigo-500",
    sky:     "bg-sky-500",
    teal:    "bg-teal-500",
    emerald: "bg-emerald-500",
    amber:   "bg-amber-500",
    orange:  "bg-orange-500",
    rose:    "bg-rose-500",
    slate:   "bg-slate-500",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 w-full page-transition">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Progress Tracker</h1>
            <p className="text-slate-500 text-sm">Your clinical learning journey — April 2026</p>
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div className="premium-card p-8 mb-8 bg-gradient-to-br from-indigo-500/5 via-slate-900/0 to-teal-500/5">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Rank</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{lvl.title}</h2>
            <p className="text-slate-500 text-sm mt-1">Level {LEVEL_THRESHOLDS.indexOf(lvl) + 1} of {LEVEL_THRESHOLDS.length}</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border font-black text-2xl ${colorMap[lvl.color]}`}>
            {xp} XP
          </div>
        </div>

        {/* XP Progress Bar */}
        {nextLvl && (
          <div>
            <div className="flex justify-between text-xs font-black text-slate-400 mb-2">
              <span>{xp} XP</span>
              <span>{nextLvl.xpRequired} XP — {nextLvl.title}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-bold">{nextLvl.xpRequired - xp} XP to next rank</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total XP", value: xp, icon: Star, color: "amber" },
          { label: "Day Streak", value: streak, icon: Flame, color: "orange", suffix: "days" },
          { label: "Accuracy", value: `${accuracy}%`, icon: Target, color: "emerald" },
          { label: "Questions", value: totalAnswered, icon: Award, color: "indigo" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`premium-card p-6 border ${colorMap[stat.color]}`}>
              <Icon className="w-5 h-5 mb-3" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Module Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="premium-card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Continue Learning</h2>
          <div className="space-y-3">
            {MODULES.map(m => {
              const Icon = m.icon;
              return (
                <Link key={m.id} href={m.href}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColorMap[m.color] || iconColorMap.indigo}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 dark:text-white">{m.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Level Roadmap */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Rank Progression</h2>
          <div className="space-y-3">
            {LEVEL_THRESHOLDS.map((lvlItem, i) => {
              const isCompleted = xp >= lvlItem.xpRequired;
              const isCurrent = lvl === lvlItem;
              return (
                <div key={lvlItem.level} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isCurrent ? `${colorMap[lvlItem.color] || colorMap.slate} border` : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isCompleted ? `${dotColorMap[lvlItem.color] || dotColorMap.slate} text-white` : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    {isCompleted ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${isCurrent ? textColorMap[lvlItem.color] || textColorMap.slate : "text-slate-500 dark:text-slate-400"}`}>{lvlItem.title}</p>
                    <p className="text-xs text-slate-400">{lvlItem.xpRequired} XP</p>
                  </div>
                  {isCurrent && <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${colorMap[lvlItem.color] || colorMap.slate}`}>Current</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
