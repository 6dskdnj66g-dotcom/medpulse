// src/app/page.tsx — MedPulse AI Landing Page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain, HeartPulse, BookOpen, Pill, Activity, Trophy,
  Users, FileText, ChevronRight, CheckCircle, X, Calculator
} from "lucide-react";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { useLanguage } from "@/core/i18n/LanguageContext";

// ── Honest feature list (only real features) ─────────────────────────────────
const FEATURES = [
  { icon: Brain,      color: "indigo", href: "/mdt",         titleEn: "MDT AI Debate",       titleAr: "مناظرة MDT الذكية",        descEn: "3 AI specialists debate clinical cases to evidence-based consensus.", descAr: "3 متخصصين بالذكاء الاصطناعي يناظرون الحالات السريرية للوصول لتوافق مبني على الأدلة." },
  { icon: HeartPulse, color: "rose",   href: "/simulator",   titleEn: "OSCE Simulator",       titleAr: "محاكي OSCE",               descEn: "AI patient roleplay with real-time examiner feedback and scoring.", descAr: "محاكاة سريرية مع مريض AI وتغذية راجعة فورية من الممتحن." },
  { icon: Calculator, color: "sky",    href: "/calculators", titleEn: "Clinical Calculators", titleAr: "الحاسبات السريرية",        descEn: "8 evidence-based calculators: BMI, GFR, CURB-65, Wells, MELD, GCS.", descAr: "8 حاسبات سريرية: BMI وGFR وCURB-65 وWells وMELD وGCS." },
  { icon: BookOpen,   color: "teal",   href: "/encyclopedia", titleEn: "Medical Encyclopedia", titleAr: "الموسوعة الطبية",          descEn: "13 specialties with links to 308+ verified real medical sources.", descAr: "13 تخصص مع روابط لـ 308+ مصدر طبي موثق حقيقي." },
  { icon: Pill,       color: "violet", href: "/drug-checker", titleEn: "Drug Checker",         titleAr: "فاحص الأدوية",            descEn: "AI drug interaction analysis across up to 8 medications at once.", descAr: "تحليل تفاعلات الأدوية بالذكاء الاصطناعي لحتى 8 أدوية." },
  { icon: Activity,   color: "emerald",href: "/ecg",          titleEn: "ECG Analyzer",         titleAr: "محلل ECG",                descEn: "Systematic AI ECG interpretation with 6 preset clinical scenarios.", descAr: "تفسير ECG منهجي بالذكاء الاصطناعي مع 6 سيناريوهات سريرية." },
  { icon: Users,      color: "amber",  href: "/professors",   titleEn: "AI Professors",        titleAr: "أساتذة الذكاء الاصطناعي", descEn: "6 specialist AI professors with persona-specific system prompts.", descAr: "6 أساتذة متخصصون بالذكاء الاصطناعي مع نماذج شخصية مخصصة." },
  { icon: FileText,   color: "rose",   href: "/summarizer",   titleEn: "Report Summarizer",    titleAr: "ملخص التقارير",           descEn: "AI clinical report summarizer with structured 5-section output.", descAr: "ملخص AI للتقارير الطبية في 5 أقسام منظمة." },
];

// ── Honest comparison (only real, verified features) ─────────────────────────
const COMPARISON = [
  { feature: "Arabic RTL interface",          featureAr: "واجهة عربية كاملة",         medpulse: true,  amboss: false, uptodate: false },
  { feature: "Completely free",               featureAr: "مجاني تماماً",               medpulse: true,  amboss: false, uptodate: false },
  { feature: "OSCE AI simulator",             featureAr: "محاكي OSCE بالذكاء",        medpulse: true,  amboss: true,  uptodate: false },
  { feature: "MDT multi-agent debate",        featureAr: "مناظرة MDT متعدد الوكلاء",  medpulse: true,  amboss: false, uptodate: false },
  { feature: "Clinical calculators",          featureAr: "حاسبات سريرية",             medpulse: true,  amboss: true,  uptodate: true  },
  { feature: "Drug interaction checker",      featureAr: "فاحص تفاعل الأدوية",       medpulse: true,  amboss: true,  uptodate: true  },
  { feature: "Updated clinical guidelines",   featureAr: "إرشادات سريرية محدّثة",    medpulse: true,  amboss: true,  uptodate: true  },
  { feature: "308+ real linked sources",      featureAr: "308+ مصدر طبي حقيقي",      medpulse: true,  amboss: false, uptodate: false },
];

// ── Inline BMI Calculator ─────────────────────────────────────────────────────
function InlineBMI({ isAr }: { isAr: boolean }) {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const bmi = weight / Math.pow(height / 100, 2);
  const cat =
    bmi < 18.5 ? { label: isAr ? "نقص وزن" : "Underweight", color: "text-sky-500 bg-sky-500/10" }
    : bmi < 25  ? { label: isAr ? "وزن طبيعي" : "Normal",      color: "text-emerald-500 bg-emerald-500/10" }
    : bmi < 30  ? { label: isAr ? "زيادة وزن" : "Overweight",  color: "text-amber-500 bg-amber-500/10" }
    :             { label: isAr ? "سمنة" : "Obese",            color: "text-rose-500 bg-rose-500/10" };

  return (
    <div className="bg-[var(--bg-0)]/90 backdrop-blur-xl rounded-3xl border border-[var(--border-subtle)] p-6 shadow-2xl w-full max-w-sm mx-auto">
      <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] mb-4 flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        {isAr ? "جرّب الآن — حاسبة BMI" : "Try Now — BMI Calculator"}
      </p>
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block mb-1">{isAr ? "الوزن (kg)" : "Weight (kg)"}</label>
          <input type="range" min={30} max={200} value={weight} onChange={e => setWeight(+e.target.value)}
            className="w-full accent-indigo-600" />
          <span className="text-[13px] font-extrabold text-[var(--text-primary)]">{weight} kg</span>
        </div>
        <div>
          <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block mb-1">{isAr ? "الطول (cm)" : "Height (cm)"}</label>
          <input type="range" min={140} max={220} value={height} onChange={e => setHeight(+e.target.value)}
            className="w-full accent-indigo-600" />
          <span className="text-[13px] font-extrabold text-[var(--text-primary)]">{height} cm</span>
        </div>
      </div>
      <div className={`rounded-2xl p-4 flex items-center justify-between ${cat.color}`}>
        <span className="text-3xl font-black">{bmi.toFixed(1)}</span>
        <span className="text-sm font-extrabold">{cat.label}</span>
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] text-center mt-2 font-medium">
        {isAr ? "WHO Classification" : "WHO Classification"} · <Link href="/calculators" className="underline hover:text-[var(--color-medical-indigo)]">{isAr ? "8 حاسبات أخرى ←" : "8 more calculators →"}</Link>
      </p>
    </div>
  );
}

const colorMap: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-500", rose:   "bg-rose-500/10 text-rose-500",
  amber:  "bg-amber-500/10 text-amber-500",   teal:   "bg-teal-500/10 text-teal-500",
  sky:    "bg-sky-500/10 text-sky-500",       emerald:"bg-emerald-500/10 text-emerald-500",
  violet: "bg-violet-500/10 text-violet-500",
};

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-0)] z-50">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="w-full overflow-x-hidden" dir={isAr ? "rtl" : "ltr"}>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* CSS gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px]" />
        </div>

        {/* Heartbeat SVG animation */}
        <div className="absolute top-8 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 60" className="w-full max-w-2xl" style={{ animation: "pulse 2s ease-in-out infinite" }}>
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
            <polyline points="0,30 60,30 80,10 100,50 120,5 140,55 160,30 400,30"
              fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              {isAr ? "دليلك السريري الشامل" : "The Ultimate Clinical Platform"}
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6 drop-shadow-2xl">
              {isAr ? (
                <>أهلاً بك في<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400">ميدبالس</span><br />الطبية</>
              ) : (
                <>Welcome to<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-400">MedPulse</span></>
              )}
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl font-medium">
              {isAr
                ? "منصة طبية متكاملة بمعايير عالمية: حاسبات سريرية، محاكي تدريب، أطباء متخصصين، ومكتبة 308+ مصدر طبي موثق. مجاني تماماً."
                : "A world-class integrated medical platform: clinical calculators, training simulators, specialist tools, and 308+ verified sources. Completely free."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base py-4 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-105">
                {isAr ? "ابدأ مجاناً" : "Start Free"}
                <ChevronRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
              </Link>
              <Link href="/calculators"
                className="inline-flex items-center gap-2 border border-slate-500 hover:border-indigo-400 text-slate-300 hover:text-white font-bold text-base py-4 px-8 rounded-2xl transition-all hover:bg-slate-800">
                {isAr ? "جرّب بدون تسجيل" : "Try Without Signup"}
              </Link>
            </div>

            {/* Honest stats */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { n: "13", label: isAr ? "تخصص طبي" : "Specialties" },
                { n: "308+", label: isAr ? "مصدر طبي" : "Verified Sources" },
                { n: "8", label: isAr ? "حاسبات سريرية" : "Calculators" },
                { n: "50+", label: isAr ? "سيناريو OSCE" : "OSCE Scenarios" },
              ].map(s => (
                <div key={s.n}>
                  <div className="text-2xl font-black text-white">{s.n}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-medium mt-6">
              {isAr ? "بناء:" : "Built by"}{" "}
              <span className="text-slate-400 font-semibold">Hassanin Salah</span>
            </p>
          </div>

          {/* Right: Inline BMI demo */}
          <div className="flex justify-center">
            <InlineBMI isAr={isAr} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="bg-[var(--bg-0)] py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">
              {isAr ? "أدوات طبية حقيقية تعمل الآن" : "Real Medical Tools That Work Now"}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg font-medium max-w-xl mx-auto">
              {isAr ? "كل ميزة مبنية ومختبرة — بدون وعود مستقبلية." : "Every feature is built and tested — no future promises."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              const color = colorMap[f.color] || colorMap.indigo;
              return (
                <Link key={f.href} href={f.href}
                  className="group medpulse-card glass level-1 p-6 border border-[var(--border-subtle)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-[var(--text-primary)] mb-2 text-[15px]">{isAr ? f.titleAr : f.titleEn}</h3>
                  <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed font-medium flex-1">{isAr ? f.descAr : f.descEn}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] font-extrabold text-[var(--color-medical-indigo)] uppercase tracking-widest">
                    {isAr ? "جرّب ←" : "Try →"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HONEST COMPARISON ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[var(--bg-1)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3">
              {isAr ? "مقارنة صادقة" : "Honest Comparison"}
            </h2>
            <p className="text-[var(--text-secondary)] font-medium">
              {isAr ? "نقارن فقط بالميزات الموجودة فعلاً — بدون مبالغة." : "We compare only what actually exists — no exaggeration."}
            </p>
          </div>

          <div className="medpulse-card glass level-1 overflow-hidden border border-[var(--border-subtle)] rounded-3xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-start p-4 font-black text-[var(--text-secondary)] text-[11px] uppercase tracking-widest w-1/2">
                    {isAr ? "الميزة" : "Feature"}
                  </th>
                  <th className="p-4 font-black text-indigo-500 text-[11px] uppercase tracking-widest">MedPulse</th>
                  <th className="p-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">AMBOSS</th>
                  <th className="p-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">UpToDate</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className={`border-b border-[var(--border-subtle)] last:border-0 ${i % 2 === 0 ? "bg-[var(--bg-0)]/30" : ""}`}>
                    <td className="p-4 font-medium text-[var(--text-primary)] text-[13px]">
                      {isAr ? row.featureAr : row.feature}
                    </td>
                    <td className="p-4 text-center">
                      {row.medpulse
                        ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                        : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.amboss
                        ? <CheckCircle className="w-5 h-5 text-slate-400 mx-auto" />
                        : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-4 text-center">
                      {row.uptodate
                        ? <CheckCircle className="w-5 h-5 text-slate-400 mx-auto" />
                        : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-4 font-medium">
            {isAr
              ? "* AMBOSS وUpToDate منصتان ممتازتان مدفوعتان — المقارنة للتوضيح فقط."
              : "* AMBOSS and UpToDate are excellent paid platforms — comparison is for context only."}
          </p>
        </div>
      </section>

      {/* ── ABOUT / SOCIAL PROOF ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[var(--bg-0)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <Trophy className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-4">
            {isAr ? "مبنية من طالب طب، لطلاب الطب" : "Built by a medical student, for medical students"}
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed font-medium text-base">
            {isAr
              ? "MedPulse AI مشروع مجتمعي يهدف لتوفير أدوات طبية عالية الجودة بالعربية، مجاناً، للطلاب في جميع أنحاء العالم العربي."
              : "MedPulse AI is a community project aimed at providing high-quality medical education tools in Arabic, for free, for students across the Arab world."}
          </p>
        </div>
      </section>

      {/* ── MEDICAL DISCLAIMER ─────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-amber-500/5 border-y border-amber-500/15">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
            <span className="text-xl">⚕️</span>
          </div>
          <div>
            <p className="font-extrabold text-amber-700 dark:text-amber-400 text-sm mb-1">
              {isAr ? "تنبيه طبي مهم" : "Important Medical Disclaimer"}
            </p>
            <p className="text-amber-700/80 dark:text-amber-400/80 text-[13px] font-medium leading-relaxed">
              {isAr
                ? "هذه المنصة مخصصة للتعليم الطبي والبحث العلمي فقط. لا تُغني عن استشارة طبيب مرخص أو التشخيص أو العلاج. في حالات الطوارئ اتصل فوراً: 997 (السعودية) · 999 (الإمارات) · 911 (أمريكا)."
                : "This platform is for medical education and research only. It does not replace consultation with a licensed physician. In emergencies, call: 997 (Saudi) · 999 (UAE) · 911 (USA)."}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA / FOOTER ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          {isAr ? "ابدأ رحلتك الطبية اليوم" : "Start your medical journey today"}
        </h2>
        <p className="text-slate-300 mb-8 font-medium">
          {isAr ? "مجاني بالكامل · بدون بطاقة ائتمانية · بدون إعلانات" : "100% free · No credit card · No ads"}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105">
            {isAr ? "ابدأ مجاناً" : "Get Started Free"}
            <ChevronRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
          </Link>
          <Link href="/calculators"
            className="inline-flex items-center gap-2 border border-slate-500 hover:border-white text-slate-300 hover:text-white font-bold py-4 px-10 rounded-2xl transition-all">
            {isAr ? "جرّب الحاسبات" : "Try Calculators"}
          </Link>
        </div>
        <p className="text-slate-500 text-[11px] mt-10 font-medium">
          © 2026 MedPulse AI · {isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}
        </p>
      </section>

    </div>
  );
}

