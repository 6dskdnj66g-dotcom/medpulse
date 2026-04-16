"use client";

import { Activity, Menu, X, LayoutDashboard, BookOpen, Brain, Bot, FileText, LogOut } from "lucide-react";
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
    <div className="md:hidden bg-white/80 dark:bg-obsidian-950/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-[100] transition-all duration-500" dir={dir}>
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tighter">
            MedPulse
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2.5 rounded-2xl transition-all duration-300 ${
              isOpen 
                ? "bg-rose-500 text-white shadow-lg" 
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-obsidian-950/95 backdrop-blur-3xl border-b border-slate-200 dark:border-white/5 shadow-2xl p-6 space-y-3 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4 px-2">
            <LanguageToggle />
            {user && (
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-[0.2em]">
                {profile?.role || "STUDENT"}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {mobileNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-black text-sm transition-all active:scale-[0.98] ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-[1.25rem] bg-rose-500 text-white font-black text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {t.common.logout}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
