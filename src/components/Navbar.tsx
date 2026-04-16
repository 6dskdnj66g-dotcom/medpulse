"use client";

import { Activity, Menu, X, LayoutDashboard, BookOpen, Brain, Bot, FileText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { useSupabaseAuth } from "./SupabaseAuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const { user, profile } = useSupabaseAuth();

  const mobileNavItems = [
    { href: "/", icon: LayoutDashboard, label: t.common.dashboard },
    { href: "/encyclopedia", icon: BookOpen, label: t.nav.encyclopedia },
    { href: "/mdt", icon: Brain, label: t.nav.mdt },
    { href: "/professors", icon: Bot, label: t.nav.professors },
    { href: "/summarizer", icon: FileText, label: t.nav.summarizer },
  ];

  return (
    <div className={`md:hidden bg-white dark:bg-obsidian-950 border-b border-slate-200 dark:border-white/5 relative z-50 flex-shrink-0 transition-colors`} dir={dir}>
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-teal-500 to-emerald-500 tracking-tight">
            MedPulse
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20`}>
              {profile?.role || "STUDENT"}
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-5 py-6 border-t border-slate-100 dark:border-white/5 space-y-4 bg-white dark:bg-obsidian-950 shadow-2xl absolute w-full animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="space-y-1">
            {mobileNavItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 obsidian-glow"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 opacity-60"}`} />
                  <span className="flex-1 text-start">{item.label}</span>
                </Link>
              );
            })}
          </div>
          {user && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-sm border border-rose-500/10"
                onClick={() => {/* Sign out logic or redirect */}}
              >
                <LogOut className="w-4 h-4" />
                {t.common.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
