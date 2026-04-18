"use client";

import Link from "next/link";
import { Activity, LayoutDashboard, BookOpen, Bot, Brain, HeartPulse, ShieldCheck, Calculator, Pill, Trophy, TrendingUp, Stethoscope, LogOut, Library, User, LayoutGrid, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { DevRoleToggle } from "./DevRoleToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const { user, profile, signOut } = useSupabaseAuth();

  const NAV_SECTIONS = [
    {
      title: t.sections.main,
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: t.common.dashboard, color: "indigo" },
      ]
    },
    {
      title: t.sections.clinicalModules,
      items: [
        { href: "/encyclopedia", icon: BookOpen, label: t.nav.encyclopedia, color: "teal" },
        { href: "/professors", icon: Bot, label: t.nav.professors, color: "emerald" },
        { href: "/mdt", icon: Brain, label: t.nav.mdt, color: "indigo" },
        { href: "/simulator", icon: HeartPulse, label: t.nav.simulator, color: "rose" },
        { href: "/summarizer", icon: FileText, label: t.nav.summarizer, color: "indigo" },
      ]
    },
    {
      title: t.sections.clinicalTools,
      items: [
        { href: "/calculators", icon: Calculator, label: t.nav.calculators, color: "sky" },
        { href: "/drug-checker", icon: Pill, label: t.nav.drugChecker, color: "rose" },
        { href: "/ecg", icon: Activity, label: t.nav.ecg, color: "red" },
        { href: "/notes", icon: Stethoscope, label: t.nav.notes, color: "teal" },
        { href: "/translator", icon: Bot, label: t.nav.translator, color: "indigo" },
      ]
    },
    {
      title: t.sections.libraryProgress,
      items: [
        { href: "/records", icon: HeartPulse, label: t.nav.records, color: "emerald" },
        { href: "/library", icon: Library, label: t.nav.library, color: "violet" },
        { href: "/usmle", icon: Trophy, label: t.nav.usmle, color: "indigo" },
        { href: "/progress", icon: TrendingUp, label: t.nav.progress, color: "amber" },
      ]
    },
    {
      title: t.sections.account,
      items: [
        { href: "/profile", icon: User, label: t.common.profile, color: "teal" },
        { href: "/admin", icon: LayoutGrid, label: t.common.admin, color: "rose" },
      ]
    },
  ];

  return (
    <div className={`hidden md:flex flex-col w-[280px] h-[calc(100dvh-2rem)] sticky top-4 my-4 mx-4 rounded-3xl z-50 glass`} dir={dir}>
      {/* Logo Section */}
      <div className="p-8 flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.4)] group hover:rotate-[15deg] transition-all duration-500 cursor-pointer">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tighter">
              MedPulse
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500/80 uppercase">AI ELITE</span>
              <div className="h-[1px] w-8 bg-indigo-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Language & Theme Quick Toggles */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Navigation section */}
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{section.title}</p>
              {section.title === t.sections.main && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
            </div>
            {section.items.map((item) => {
              const isActive = (item.href === "/" || item.href === "/dashboard")
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-xl text-sm font-bold transition-all duration-300 group active:scale-95 ${
                    isActive 
                      ? 'bg-[var(--bg-2)] border border-[var(--border-strong)] shadow-sm'
                      : `text-[var(--text-secondary)] hover:bg-[var(--bg-1)] ${dir === 'ltr' ? 'hover:translate-x-1' : 'hover:-translate-x-1'}`
                  }`}
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md rotate-3' 
                      : 'bg-[var(--bg-2)] border border-[var(--border-subtle)] group-hover:scale-110 group-hover:-rotate-3 shadow-sm'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--text-tertiary)] group-hover:text-[var(--color-medical-indigo)]'}`} />
                  </div>
                  <span className={`flex-1 tracking-wide ${isActive ? 'text-[var(--color-medical-indigo)]' : ''}`}>{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Verification Badge */}
        <div className="mt-8 px-4">
          <div className="medpulse-card p-4 translate-y-0 hover:translate-y-0">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">{t.common.verifiedContext}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
              &quot;{t.common.ragDisclaimer}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* User section */}
      {user && (
        <div className="p-4 mt-auto">
          <div className="medpulse-card p-4 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-md">
                {profile?.full_name?.[0] || user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide truncate">
                  {profile?.role || "Student"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold text-xs hover:bg-[var(--color-heartbeat-red)] hover:text-white transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
              {t.common.logout}
            </button>
            <DevRoleToggle />
          </div>
        </div>
      )}
    </div>
  );
}
