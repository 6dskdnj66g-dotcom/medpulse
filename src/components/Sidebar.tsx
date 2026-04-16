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

  const COLOR_MAP: Record<string, { active: string; hover: string; dot: string }> = {
    indigo:  { active: "bg-indigo-600 shadow-[0_10px_20px_rgba(99,102,241,0.3)] text-white scale-[1.02]", hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400", dot: "bg-indigo-500" },
    teal:    { active: "bg-teal-600 shadow-[0_10px_20px_rgba(13,148,136,0.3)] text-white scale-[1.02]",   hover: "hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400",     dot: "bg-teal-500" },
    emerald: { active: "bg-emerald-600 shadow-[0_10px_20px_rgba(16,185,129,0.3)] text-white scale-[1.02]", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400", dot: "bg-emerald-500" },
    rose:    { active: "bg-rose-600 shadow-[0_10px_20px_rgba(244,63,94,0.3)] text-white scale-[1.02]",    hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400",     dot: "bg-rose-500" },
    sky:     { active: "bg-sky-600 shadow-[0_10px_20px_rgba(14,165,233,0.3)] text-white scale-[1.02]",    hover: "hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400",       dot: "bg-sky-500" },
    amber:   { active: "bg-amber-600 shadow-[0_10px_20px_rgba(245,158,11,0.3)] text-white scale-[1.02]", hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400", dot: "bg-amber-500" },
    red:     { active: "bg-red-600 shadow-[0_10px_20px_rgba(239,68,68,0.3)] text-white scale-[1.02]",     hover: "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",       dot: "bg-red-500" },
    violet:  { active: "bg-violet-600 shadow-[0_10px_20px_rgba(139,92,246,0.3)] text-white scale-[1.02]", hover: "hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400", dot: "bg-violet-500" },
  };

  return (
    <div className={`hidden md:flex flex-col w-80 bg-white/80 dark:bg-slate-950/50 backdrop-blur-3xl border-inline-end border-slate-200/50 dark:border-white/5 h-[calc(100dvh-2rem)] my-4 mx-4 rounded-[2.5rem] shadow-2xl floating-3d z-50`} dir={dir}>
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
                  className={`flex items-center gap-4 px-6 py-5 rounded-[1.75rem] text-sm font-black transition-all duration-500 group active:scale-95 ${
                    isActive 
                      ? colors.active 
                      : `text-slate-500 dark:text-slate-400 ${colors.hover} hover:translate-x-1`
                  }`}
                >
                  <div className={`relative p-2.5 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-white/20 rotate-6 shadow-lg' 
                      : 'bg-slate-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:scale-110 group-hover:-rotate-3 shadow-sm'
                  }`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-500'}`} />
                  </div>
                  <span className="flex-1 tracking-tighter uppercase">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
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

      {/* User section */}
      {user && (
        <div className="p-6 mt-auto">
          <div className="clinical-card-3d p-6 group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                {profile?.full_name?.[0] || user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {profile?.role || "Student"}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              {t.common.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
