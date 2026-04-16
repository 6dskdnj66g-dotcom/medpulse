"use client";

import { Activity, Menu, X, LayoutDashboard, BookOpen, Brain, Bot, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import { ThemeToggle } from "./ThemeToggle";

const mobileNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/encyclopedia", icon: BookOpen, label: "Encyclopedia" },
  { href: "/mdt", icon: Brain, label: "MDT Debate" },
  { href: "/professors", icon: Bot, label: "AI Professors" },
  { href: "/summarizer", icon: FileText, label: "Medical Summarizer" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const roleBadgeClass =
    user?.role === Role.PROFESSOR
      ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400";

  return (
    <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative z-50 flex-shrink-0">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-teal-500 to-emerald-500">
            MedPulse
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {user && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${roleBadgeClass}`}>
              {user.role === Role.PROFESSOR ? "PROF" : "STUDENT"}
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-950 shadow-2xl absolute w-full animate-in slide-in-from-top-4 duration-300">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 border border-transparent"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
