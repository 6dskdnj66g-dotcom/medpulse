// src/components/layout/Sidebar.tsx
// Single source of truth for desktop navigation
"use client";

import Link from "next/link";
import {
  Activity, LayoutDashboard, BookOpen, Bot, Brain, HeartPulse,
  Calculator, Pill, Trophy, TrendingUp, LogOut,
  Library, User, LayoutGrid, FileText, Scan, Microscope,
  TestTube, Languages, FolderOpen, GraduationCap, ShieldCheck, Edit, Stethoscope,
  Repeat, FlaskConical, Layers, Images, Video, Award
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/core/ui/ThemeToggle";
import { LanguageToggle } from "@/core/ui/LanguageToggle";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { DevRoleToggle } from "@/components/DevRoleToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const { user, profile, signOut } = useSupabaseAuth();

  const NAV_SECTIONS = [
    {
      titleKey: t.sections.main,
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: t.common.dashboard },
      ],
    },
    {
      titleKey: t.sections.clinicalModules,
      items: [
        { href: "/encyclopedia", icon: BookOpen,    label: t.nav.encyclopedia },
        { href: "/professors",   icon: Bot,         label: t.nav.professors },
        { href: "/mdt",          icon: Brain,       label: t.nav.mdt },
        { href: "/simulator",    icon: HeartPulse,  label: t.nav.simulator },
        { href: "/usmle",        icon: Trophy,      label: t.nav.usmle },
        { href: "/summarizer",   icon: FileText,    label: t.nav.summarizer },
      ],
    },
    {
      titleKey: t.sections.clinicalTools,
      items: [
        { href: "/calculators",  icon: Calculator,  label: t.nav.calculators },
        { href: "/ddx",          icon: Stethoscope, label: t.nav.ddx },
        { href: "/drug-checker", icon: Pill,        label: t.nav.drugChecker },
        { href: "/ecg",          icon: Activity,    label: t.nav.ecg },
        { href: "/radiology",    icon: Scan,        label: t.nav.radiology },
        { href: "/pathology",    icon: Microscope,  label: t.nav.pathology },
        { href: "/lab-results",  icon: TestTube,    label: t.nav.labResults },
        { href: "/translator",   icon: Languages,   label: t.nav.translator },
        { href: "/notes",        icon: Edit,        label: t.nav.notes },
      ],
    },
    {
      titleKey: t.sections.libraryProgress,
      items: [
        { href: "/records",          icon: FolderOpen,    label: t.nav.records },
        { href: "/library",          icon: Library,       label: t.nav.library },
        { href: "/local-resources",  icon: GraduationCap, label: t.nav.localResources },
        { href: "/progress",         icon: TrendingUp,    label: t.nav.progress },
      ],
    },
    {
      titleKey: t.sections.learningTools,
      items: [
        { href: "/srs",          icon: Repeat,       label: t.nav.srs },
        { href: "/reasoning",    icon: FlaskConical, label: t.nav.reasoning },
        { href: "/anatomy",      icon: Layers,       label: t.nav.anatomy },
        { href: "/image-bank",   icon: Images,       label: t.nav.imageBank },
        { href: "/procedures",   icon: Video,        label: t.nav.procedures },
        { href: "/saudi-exams",  icon: Award,        label: t.nav.saudiExams },
      ],
    },
    {
      titleKey: t.sections.account,
      items: [
        { href: "/profile", icon: User,        label: t.common.profile },
        { href: "/admin",   icon: LayoutGrid,  label: t.common.admin },
      ],
    },
  ];

  return (
    <div
      className="hidden md:flex flex-col w-[280px] h-[calc(100dvh-2rem)] sticky top-4 my-4 mx-4 rounded-3xl z-50 glass"
      dir={dir}
    >
      {/* Logo */}
      <div className="p-6 flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:rotate-[15deg] transition-all duration-500 cursor-pointer">
            <Activity className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tighter">
              MedPulse
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-[0.3em] text-indigo-500/80 uppercase">AI</span>
              <div className="h-[1px] w-6 bg-indigo-500/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Language & Theme */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleKey} className="mb-4">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">
              {section.titleKey}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === "/" || item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl text-sm font-bold transition-all duration-200 group active:scale-95 ${
                    isActive
                      ? "bg-[var(--bg-2)] border border-[var(--border-strong)] shadow-sm"
                      : `text-[var(--text-secondary)] hover:bg-[var(--bg-1)] ${
                          dir === "ltr" ? "hover:translate-x-0.5" : "hover:-translate-x-0.5"
                        }`
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm"
                        : "bg-[var(--bg-2)] border border-[var(--border-subtle)] group-hover:scale-110"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-white"
                          : "text-[var(--text-tertiary)] group-hover:text-[var(--color-medical-indigo)]"
                      }`}
                    />
                  </div>
                  <span
                    className={`flex-1 tracking-wide text-[13px] truncate ${
                      isActive ? "text-[var(--color-medical-indigo)]" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-medical-indigo)] flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Verified badge */}
        <div className="mt-4 px-2">
          <div className="medpulse-card p-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{t.common.verifiedContext}</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
              &quot;{t.common.ragDisclaimer}&quot;
            </p>
          </div>
        </div>
      </div>

      {/* User section */}
      {user && (
        <div className="p-3 mt-auto border-t border-[var(--border-subtle)]">
          <div className="medpulse-card p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[var(--text-primary)] truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide truncate">
                  {profile?.role || "Student"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t.common.logout}
            </button>
            <DevRoleToggle />
          </div>
        </div>
      )}
    </div>
  );
}

