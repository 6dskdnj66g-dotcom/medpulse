"use client";

import {
  Activity, Menu, X, LayoutDashboard, BookOpen, Brain, Bot, FileText,
  LogOut, Home, Trophy, Pill, User, Calculator, HeartPulse,
  ShieldCheck, Library, TrendingUp, Stethoscope
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { useSupabaseAuth } from "./SupabaseAuthContext";

const BOTTOM_NAV_ITEMS = [
  { href: "/",            icon: Home,      labelAr: "الرئيسية",  labelEn: "Home" },
  { href: "/encyclopedia",icon: BookOpen,  labelAr: "الموسوعة", labelEn: "Library" },
  { href: "/usmle",       icon: Trophy,    labelAr: "USMLE",    labelEn: "USMLE" },
  { href: "/drug-checker",icon: Pill,      labelAr: "الأدوية",  labelEn: "Drugs" },
  { href: "/profile",     icon: User,      labelAr: "حسابي",    labelEn: "Profile" },
];

const DRAWER_SECTIONS = [
  {
    titleAr: "الرئيسية",
    titleEn: "Main",
    items: [
      { href: "/",         icon: Home,          labelAr: "الرئيسية",          labelEn: "Home" },
      { href: "/dashboard",icon: LayoutDashboard,labelAr: "لوحة التحكم",       labelEn: "Dashboard" },
      { href: "/progress", icon: TrendingUp,    labelAr: "تقدمي",             labelEn: "Progress" },
      { href: "/profile",  icon: User,          labelAr: "الملف الشخصي",      labelEn: "Profile" },
    ],
  },
  {
    titleAr: "التعليم السريري",
    titleEn: "Clinical Education",
    items: [
      { href: "/encyclopedia", icon: BookOpen,    labelAr: "الموسوعة الطبية",   labelEn: "Encyclopedia" },
      { href: "/professors",   icon: Bot,         labelAr: "الأساتذة",          labelEn: "Professors" },
      { href: "/mdt",          icon: Brain,       labelAr: "النقاش الطبي",      labelEn: "MDT Debate" },
      { href: "/simulator",    icon: HeartPulse,  labelAr: "المحاكاة السريرية", labelEn: "Simulator" },
      { href: "/usmle",        icon: Trophy,      labelAr: "USMLE",            labelEn: "USMLE" },
      { href: "/summarizer",   icon: FileText,    labelAr: "الملخّص الذكي",    labelEn: "Summarizer" },
    ],
  },
  {
    titleAr: "الأدوات السريرية",
    titleEn: "Clinical Tools",
    items: [
      { href: "/calculators",  icon: Calculator,  labelAr: "الحاسبات الطبية",  labelEn: "Calculators" },
      { href: "/drug-checker", icon: Pill,        labelAr: "التفاعلات الدوائية",labelEn: "Drug Checker" },
      { href: "/ecg",          icon: Activity,    labelAr: "تحليل ECG",        labelEn: "ECG Analysis" },
      { href: "/notes",        icon: Stethoscope, labelAr: "الملاحظات السريرية",labelEn: "Clinical Notes" },
      { href: "/records",      icon: FileText,    labelAr: "سجلات المرضى",     labelEn: "Records" },
      { href: "/library",      icon: Library,     labelAr: "المكتبة",           labelEn: "Library" },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { lang, dir } = useLanguage();
  const { user, profile, signOut } = useSupabaseAuth();
  const isAr = lang === "ar";

  // Close drawer on route change — intentional external side-effect sync
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Sync body scroll lock with drawer state — external DOM mutation
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" || href === "/dashboard"
      ? pathname === href
      : pathname?.startsWith(href);

  return (
    <>
      {/* ── MOBILE TOP NAV BAR ─────────────────────────────── */}
      <div
        className="md:hidden sticky top-0 z-[80] flex items-center justify-between px-4 h-[60px]"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderBottom: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
        }}
        dir={dir}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tighter">
            MedPulse
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border-default)" }}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ─────────────────────────── */}
      {/* Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`mobile-drawer md:hidden ${dir === "rtl" ? "mobile-drawer-rtl" : "mobile-drawer-ltr"} ${isOpen ? "open" : "closed"}`}
        dir={dir}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.3)]">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-teal-400 to-emerald-400 uppercase tracking-tighter block">
                MedPulse
              </span>
              <span className="text-[9px] font-black tracking-[0.25em] text-indigo-500/70 uppercase">AI ELITE</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition-all"
            style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}
          >
            <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Language & Theme toggles */}
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <LanguageToggle />
          {user && (
            <span
              className="ml-auto text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em]"
              style={{
                background: "rgba(91,108,255,0.10)",
                color: "var(--color-medical-indigo)",
                border: "1px solid rgba(91,108,255,0.20)",
              }}
            >
              {profile?.role || "STUDENT"}
            </span>
          )}
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {DRAWER_SECTIONS.map((section) => (
            <div key={section.titleEn}>
              <p
                className="text-[9px] font-black uppercase tracking-widest px-3 mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                {isAr ? section.titleAr : section.titleEn}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                        active ? "btn-primary" : ""
                      }`}
                      style={
                        !active
                          ? { color: "var(--text-secondary)" }
                          : undefined
                      }
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate">{isAr ? item.labelAr : item.labelEn}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Verified badge */}
          <div
            className="mx-1 p-4 rounded-2xl mt-4"
            style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">AI-Verified Sources</span>
            </div>
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: "var(--text-tertiary)" }}>
              Powered by Gemini 2.0 Flash + RAG with 2026 clinical guidelines.
            </p>
          </div>
        </div>

        {/* User section */}
        {user ? (
          <div
            className="p-4 mt-auto"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div
              className="flex items-center gap-3 mb-3 p-3 rounded-2xl"
              style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide truncate" style={{ color: "var(--text-tertiary)" }}>
                  {profile?.role || "Student"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              {isAr ? "تسجيل الخروج" : "Sign Out"}
            </button>
          </div>
        ) : (
          <div className="p-4 mt-auto" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <Link
              href="/auth/login"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
      <nav className="bottom-nav md:hidden" dir={dir}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <Icon
                className="w-5 h-5"
                style={{ strokeWidth: active ? 2.5 : 1.8 }}
              />
              <span>{isAr ? item.labelAr : item.labelEn}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
