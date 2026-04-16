"use client";

import Link from "next/link";
import { Activity, LayoutDashboard, BookOpen, Bot, Brain, HeartPulse, ShieldCheck, Calculator, Pill, Trophy, TrendingUp, Stethoscope, LogOut, UserCircle, Library, User, LayoutGrid, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { useSupabaseAuth } from "./SupabaseAuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { t, lang, dir } = useLanguage();
  const { user, profile, signOut } = useSupabaseAuth();

  const NAV_SECTIONS = [
    {
      title: t.sections.main,
      items: [
        { href: "/", icon: LayoutDashboard, label: t.common.dashboard, color: "indigo" },
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

  const COLOR_MAP: Record<string, { active: string; hover: string }> = {
    indigo:  { active: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",  hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-indigo-600 dark:hover:text-indigo-400" },
    teal:    { active: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",          hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-teal-600 dark:hover:text-teal-400" },
    emerald: { active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-emerald-600 dark:hover:text-emerald-400" },
    rose:    { active: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",          hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-rose-600 dark:hover:text-rose-400" },
    sky:     { active: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",              hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-sky-600 dark:hover:text-sky-400" },
    amber:   { active: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",      hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-amber-600 dark:hover:text-amber-400" },
    red:     { active: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",              hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-red-600 dark:hover:text-red-400" },
    violet:  { active: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",  hover: "hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-violet-600 dark:hover:text-violet-400" },
  };

  return (
    <div className={`hidden md:flex flex-col w-72 bg-white dark:bg-obsidian-950 border-inline-end border-slate-200 dark:border-white/5 h-full flex-shrink-0 transition-all duration-500 z-50`} dir={dir}>
      {/* Logo Section */}
      <div className="p-8 flex flex-col space-y-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 group hover:rotate-12 transition-transform duration-500">
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
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar bg-white dark:bg-transparent">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="flex items-center justify-between px-3 mb-3">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{section.title}</p>
              {section.title === t.sections.main && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
            </div>
            {section.items.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              const colors = COLOR_MAP[item.color] || COLOR_MAP.indigo;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-[12px] tracking-tight mb-1 relative group ${
                    isActive
                      ? `${colors.active} font-black obsidian-glow`
                      : `text-slate-500 dark:text-slate-400 ${colors.hover} font-bold`
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "" : "opacity-60"}`} />
                  <span className="flex-1 text-start">{item.label}</span>
                  {isActive && (
                    <div className={`absolute ${lang === 'ar' ? '-left-1' : '-right-1'} top-3 w-1.5 h-6 rounded-full bg-current opacity-40`} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Verification Badge */}
        <div className="mt-8 px-2">
          <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 premium-card shadow-none hover:shadow-none translate-y-0 hover:translate-y-0">
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

      {/* User Branding Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
        {user ? (
          <div className="p-2 rounded-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg obsidian-glow">
                {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-start">
                <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    {profile?.role || "student"}
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {profile?.xp || 0} {t.common.xp}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <LanguageToggle />
              <div className="flex-1" />
              <ThemeToggle />
              <button
                onClick={signOut}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/10"
                title={t.common.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-transparent dark:border-white/5">
                <UserCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400">{t.common.visitor}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-400">{t.common.guest}</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <div className="flex-1" />
              <Link href="/auth/login" className="text-center text-[10px] font-black py-2.5 px-4 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/10 whitespace-nowrap">
                {t.common.login}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
