"use client";

import Link from "next/link";
import { Activity, LayoutDashboard, FileText, BookOpen, Bot, Brain, LogOut, HeartPulse } from "lucide-react";
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
    activeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-700 dark:hover:text-indigo-400",
  },
  {
    href: "/encyclopedia",
    icon: BookOpen,
    label: "Encyclopedia",
    activeClass: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-teal-700 dark:hover:text-teal-400",
  },
  {
    href: "/mdt",
    icon: Brain,
    label: "MDT Debate",
    activeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-700 dark:hover:text-indigo-400",
  },
  {
    href: "/professors",
    icon: Bot,
    label: "AI Professors",
    activeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-emerald-700 dark:hover:text-emerald-400",
  },
  {
    href: "/summarizer",
    icon: FileText,
    label: "Medical Summarizer",
    activeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-indigo-700 dark:hover:text-indigo-400",
  },
  {
    href: "/simulator",
    icon: HeartPulse,
    label: "OSCE Simulator",
    activeClass: "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
    hoverClass: "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-rose-700 dark:hover:text-rose-400",
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
      ? "Professor Account"
      : user?.role === Role.ADMIN
      ? "Admin Account"
      : "Student Account";

  const roleBadgeClass =
    user?.role === Role.PROFESSOR
      ? "text-teal-700 bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800"
      : user?.role === Role.ADMIN
      ? "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
      : "text-indigo-700 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";

  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 h-full flex-shrink-0 transition-colors">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-teal-500 to-emerald-500">
            MedPulse
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive
                  ? item.activeClass
                  : `text-slate-600 dark:text-slate-400 dark:hover:bg-slate-900 ${item.hoverClass}`
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || "Loading..."}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center">
                <span className="mr-1">🏆</span> {xp} XP
              </span>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
