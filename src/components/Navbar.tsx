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
      ? "bg-teal-100 text-teal-700"
      : "bg-sky-100 text-sky-700";

  return (
    <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative z-50 flex-shrink-0">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-teal-400 rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-teal-400">
            MedPulse AI
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {user && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
              {user.role === Role.PROFESSOR ? "PROF" : "STUDENT"}
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3 py-3 border-t border-slate-100 space-y-1 bg-white shadow-xl absolute w-full">
          {mobileNavItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
