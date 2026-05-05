// src/app/page.tsx — MedPulse AI Landing Page (Refero Bento Grid Aesthetic)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain, HeartPulse, BookOpen, Pill, Activity, Trophy,
  Users, FileText, ChevronRight, CheckCircle, X, Calculator, Sparkles, ArrowUpRight
} from "lucide-react";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { useLanguage } from "@/core/i18n/LanguageContext";

// ── Features for Bento Grid ─────────────────────────────────
const FEATURES = [
  { id: "osce", colSpan: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10", href: "/simulator", titleEn: "OSCE Simulator", titleAr: "محاكي OSCE", descEn: "AI patient roleplay with real-time examiner feedback and scoring.", descAr: "محاكاة سريرية مع مريض AI وتغذية راجعة فورية من الممتحن.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(244,63,94,0.3)]" },
  { id: "mdt", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10", href: "/mdt", titleEn: "MDT AI Debate", titleAr: "مناظرة MDT", descEn: "3 AI specialists debate clinical cases.", descAr: "3 متخصصين AI يناظرون الحالات.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(99,102,241,0.3)]" },
  { id: "professors", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: Users, color: "text-amber-400", bg: "bg-amber-500/10", href: "/professors", titleEn: "AI Professors", titleAr: "أساتذة ذكاء اصطناعي", descEn: "6 specialist AI professors.", descAr: "6 أساتذة متخصصون بالذكاء الاصطناعي.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(251,191,36,0.3)]" },
  { id: "calculators", colSpan: "col-span-1 md:col-span-2 lg:col-span-2", icon: Calculator, color: "text-sky-400", bg: "bg-sky-500/10", href: "/calculators", titleEn: "Clinical Calculators", titleAr: "الحاسبات السريرية", descEn: "8 evidence-based calculators: BMI, GFR, CURB-65, Wells, MELD, GCS.", descAr: "8 حاسبات سريرية مبنية على الأدلة: BMI، GFR والمزيد.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(56,189,248,0.3)]" },
  { id: "encyclopedia", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: BookOpen, color: "text-teal-400", bg: "bg-teal-500/10", href: "/encyclopedia", titleEn: "Encyclopedia", titleAr: "الموسوعة الطبية", descEn: "308+ verified real medical sources.", descAr: "308+ مصدر طبي موثق حقيقي.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(45,212,191,0.3)]" },
  { id: "drug", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: Pill, color: "text-violet-400", bg: "bg-violet-500/10", href: "/drug-checker", titleEn: "Drug Checker", titleAr: "فاحص الأدوية", descEn: "Analyze interactions for up to 8 drugs.", descAr: "تحليل تفاعلات حتى 8 أدوية معاً.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(167,139,250,0.3)]" },
  { id: "ecg", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/ecg", titleEn: "ECG Analyzer", titleAr: "محلل ECG", descEn: "Systematic AI ECG interpretation.", descAr: "تفسير ECG منهجي بالذكاء الاصطناعي.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(52,211,153,0.3)]" },
  { id: "summarizer", colSpan: "col-span-1 md:col-span-1 lg:col-span-1", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10", href: "/summarizer", titleEn: "Report Summarizer", titleAr: "ملخص التقارير", descEn: "AI summarizer with 5-section output.", descAr: "تلخيص ذكي للتقارير الطبية.", glow: "group-hover:shadow-[0_0_80px_-20px_rgba(244,114,182,0.3)]" },
];

const COMPARISON = [
  { feature: "Arabic RTL interface", featureAr: "واجهة عربية كاملة", medpulse: true, amboss: false, uptodate: false },
  { feature: "Completely free", featureAr: "مجاني تماماً", medpulse: true, amboss: false, uptodate: false },
  { feature: "OSCE AI simulator", featureAr: "محاكي OSCE بالذكاء", medpulse: true, amboss: true, uptodate: false },
  { feature: "MDT multi-agent debate", featureAr: "مناظرة MDT متعدد الوكلاء", medpulse: true, amboss: false, uptodate: false },
  { feature: "Clinical calculators", featureAr: "حاسبات سريرية", medpulse: true, amboss: true, uptodate: true },
  { feature: "308+ real linked sources", featureAr: "308+ مصدر طبي حقيقي", medpulse: true, amboss: false, uptodate: false },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#09090b] z-50">
        <div className="w-12 h-12 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="w-full bg-[#09090b] min-h-screen text-slate-200 selection:bg-indigo-500/30 overflow-x-hidden font-sans" dir={isAr ? "rtl" : "ltr"}>
      
      {/* ── DOT MATRIX BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15]" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* ── HERO GLOW ── */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* ── HEADER / NAVIGATION ── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-white tracking-tight text-lg">MedPulse <span className="text-indigo-400">AI</span></span>
        </div>
        <Link href="/dashboard" className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {isAr ? "دخول للمنصة" : "Enter Platform"}
        </Link>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-48 pb-20 px-4 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-indigo-300 text-[11px] font-black uppercase tracking-widest mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {isAr ? "المنصة السريرية الأقوى" : "The Ultimate Clinical Platform"}
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white leading-[1.1] tracking-tighter mb-6 max-w-4xl mx-auto drop-shadow-2xl">
          {isAr ? (
            <>تعلم الطب بذكاء<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400">وليس بجهد</span></>
          ) : (
            <>Study Medicine<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400">Smarter, Not Harder</span></>
          )}
        </h1>

        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          {isAr
            ? "منصة طبية متكاملة بمعايير عالمية: حاسبات سريرية، محاكي تدريب OSCE، وأساتذة ذكاء اصطناعي. بتصميم مستوحى من كبرى المنصات."
            : "A world-class integrated medical platform: clinical calculators, OSCE simulators, and AI professors. Beautifully designed for excellence."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard"
            className="group relative inline-flex items-center gap-2 bg-white text-black font-extrabold text-base py-4 px-8 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <span className="relative z-10 flex items-center gap-2">
              {isAr ? "ابدأ مجاناً الآن" : "Start For Free"}
              <ArrowUpRight className={`w-5 h-5 ${isAr ? "-scale-x-100" : ""}`} />
            </span>
          </Link>
          <Link href="/calculators"
            className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold text-base py-4 px-8 rounded-full transition-all backdrop-blur-md">
            {isAr ? "تصفح الأدوات" : "Explore Tools"}
          </Link>
        </div>
      </section>

      {/* ── REFERO-STYLE BENTO GRID ── */}
      <section className="py-20 px-4 z-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
              {isAr ? "أدوات سريرية حقيقية" : "Real Clinical Intelligence"}
            </h2>
            <p className="text-slate-400 font-medium">
              {isAr ? "تصميم حديث، أداء فائق، وموثوقية طبية تامة." : "Modern design, extreme performance, medical reliability."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Link key={f.id} href={f.href} className={`group relative bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition-all duration-500 rounded-[32px] p-8 flex flex-col overflow-hidden backdrop-blur-xl ${f.colSpan} ${f.glow}`}>
                  
                  {/* Subtle Grid Background in Card */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" 
                       style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-auto ${f.bg} ${f.color} border border-white/5 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 mt-6">
                    <h3 className="font-extrabold text-white text-xl mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">
                      {isAr ? f.titleAr : f.titleEn}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {isAr ? f.descAr : f.descEn}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className={`absolute bottom-8 ${isAr ? 'left-8' : 'right-8'} w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75`}>
                    <ArrowUpRight className={`w-5 h-5 text-white ${isAr ? "-scale-x-100" : ""}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HONEST COMPARISON (Refero Dark Table Style) ── */}
      <section className="py-24 px-4 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter">
              {isAr ? "مقارنة شفافة تماماً" : "Transparent Comparison"}
            </h2>
            <p className="text-slate-400 font-medium">
              {isAr ? "نصنع الفارق حيث يهم." : "We make the difference where it counts."}
            </p>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-[32px] overflow-hidden shadow-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] border-b border-white/[0.08]">
                <tr>
                  <th className={`p-6 font-black text-slate-400 text-[11px] uppercase tracking-widest ${isAr ? 'text-right' : 'text-left'} w-1/2`}>
                    {isAr ? "الميزة" : "Feature"}
                  </th>
                  <th className="p-6 text-center font-black text-indigo-400 text-[11px] uppercase tracking-widest">MedPulse</th>
                  <th className="p-6 text-center font-black text-slate-500 text-[11px] uppercase tracking-widest">AMBOSS</th>
                  <th className="p-6 text-center font-black text-slate-500 text-[11px] uppercase tracking-widest">UpToDate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`p-6 font-bold text-slate-300 text-[13px] ${isAr ? 'text-right' : 'text-left'}`}>
                      {isAr ? row.featureAr : row.feature}
                    </td>
                    <td className="p-6 text-center">
                      {row.medpulse ? <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-6 text-center">
                      {row.amboss ? <CheckCircle className="w-5 h-5 text-slate-500 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                    </td>
                    <td className="p-6 text-center">
                      {row.uptodate ? <CheckCircle className="w-5 h-5 text-slate-500 mx-auto" /> : <X className="w-5 h-5 text-slate-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 text-center border-t border-white/[0.05] relative z-10">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Trophy className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-slate-400 font-medium text-sm mb-2">
          {isAr ? "صُنع للقطاع الطبي بكل شغف." : "Built for the medical sector with passion."}
        </p>
        <p className="text-slate-600 font-medium text-xs">
          MedPulse AI © 2026
        </p>
      </footer>

    </div>
  );
}
