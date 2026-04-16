"use client";

import Link from "next/link";
import { Activity, LayoutDashboard, FileText, BookOpen, Bot, Brain, LogOut, HeartPulse, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { ThemeToggle } from "./ThemeToggle";
import { useAchievement } from "./AchievementContext";

const navItems = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
    activeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold",
  },
  {
    href: "/encyclopedia",
    icon: BookOpen,
    label: "Encyclopedia",
    activeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-teal-600 dark:hover:text-teal-400 font-bold",
  },
  {
    href: "/mdt",
    icon: Brain,
    label: "MDT Debate",
    activeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold",
  },
  {
    href: "/professors",
    icon: Bot,
    label: "AI Professors",
    activeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold",
  },
  {
    href: "/summarizer",
    icon: FileText,
    label: "Medical Summarizer",
    activeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold",
  },
  {
    href: "/simulator",
    icon: HeartPulse,
    label: "OSCE Simulator",
    activeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-rose-600 dark:hover:text-rose-400 font-bold",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { xp } = useAchievement();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleLabel =
    user?.role === Role.PROFESSOR
      ? "Clinical Professor"
      : user?.role === Role.ADMIN
      ? "System Admin"
      : "Medical Student";

  const roleBadgeClass =
    user?.role === Role.PROFESSOR
      ? "text-teal-600 bg-teal-500/10 border-teal-500/20"
      : user?.role === Role.ADMIN
      ? "text-rose-600 bg-rose-500/10 border-rose-500/20"
      : "text-indigo-600 bg-indigo-500/10 border-indigo-500/20";

  return (
    <div className="hidden md:flex flex-col w-72 bg-white dark:bg-obsidian-900 border-r border-slate-200 dark:border-slate-800 h-full flex-shrink-0 transition-all duration-500 z-50">
      {/* Logo Section */}
      <div className="p-8 flex flex-col space-y-2 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group hover:rotate-12 transition-transform duration-500">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tight">
              MedPulse
            </span>
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 mt-[-2px] uppercase">Intelligence 3.0</p>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-4 mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Clinical Modules
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl border border-transparent transition-all text-[13px] tracking-tight ${
                isActive
                  ? `${item.activeClass} font-black shadow-lg shadow-indigo-500/5 scale-[1.02]`
                  : `text-slate-500 dark:text-slate-400 ${item.hoverClass}`
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "opacity-60"}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-current opacity-40" />
              )}
            </Link>
          );
        })}

        {/* Verification Badge Tooltip style */}
        <div className="mt-10 px-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Verified Context</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">
              "Strict adherence to WHO & NEJM 2026 protocols verified by MedPulse Secure RAG."
            </p>
          </div>
        </div>
      </div>

      {/* User Branding Footer */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center space-x-4 p-2 rounded-2xl group transition-all">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-xl shadow-indigo-500/10 group-hover:scale-110 duration-500">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
              {user?.name || "Initializing..."}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border border-current uppercase tracking-wider ${roleBadgeClass}`}>
                {roleLabel.split(" ")[1]}
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center">
                {xp} XP
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
