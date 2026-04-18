"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain, HeartPulse, BookOpen, Pill, Activity, Trophy,
  Users, FileText, ChevronRight, Shield, Zap, Globe,
  CheckCircle, ArrowRight
} from "lucide-react";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { useLanguage } from "@/components/LanguageContext";

const FEATURES = [
  { icon: Brain,      color: "indigo", titleEn: "MDT AI Debate",       titleAr: "مناظرة MDT الذكية",        descEn: "3 AI agents debate clinical cases to reach evidence-based consensus.", descAr: "3 وكلاء ذكاء اصطناعي يناظرون الحالات السريرية للوصول إلى توافق مبني على الأدلة." },
  { icon: HeartPulse, color: "rose",   titleEn: "OSCE Simulator",       titleAr: "محاكي OSCE",               descEn: "Real-time clinical simulation with voice input and AI patient responses.", descAr: "محاكاة سريرية فورية مع إدخال صوتي واستجابات مريض ذكي." },
  { icon: Trophy,     color: "amber",  titleEn: "USMLE Mode",           titleAr: "وضع USMLE",                descEn: "50+ Step 2 CK questions with detailed explanations and 2026 guidelines.", descAr: "+50 سؤال بأسلوب Step 2 CK مع شروحات مفصلة وإرشادات 2026." },
  { icon: BookOpen,   color: "teal",   titleEn: "Medical Encyclopedia", titleAr: "الموسوعة الطبية",          descEn: "13 specialties with AI chat, flashcards, and RAG-sourced answers.", descAr: "13 تخصص مع دردشة ذكية وبطاقات تعليمية وإجابات مستندة إلى مصادر." },
  { icon: Pill,       color: "sky",    titleEn: "Drug Checker",         titleAr: "فاحص التفاعلات الدوائية", descEn: "Instant drug interaction analysis powered by Gemini AI.", descAr: "تحليل فوري لتفاعل الأدوية مدعوم بـ Gemini AI." },
  { icon: Activity,   color: "red",    titleEn: "ECG Analysis",         titleAr: "تحليل ECG",                descEn: "AI ECG interpretation with 6 preset clinical scenarios.", descAr: "تفسير ECG بالذكاء الاصطناعي مع 6 سيناريوهات سريرية جاهزة." },
  { icon: Users,      color: "emerald",titleEn: "AI Professors",        titleAr: "الأساتذة الذكاء",          descEn: "Chat with 4 specialist AI professors for targeted clinical teaching.", descAr: "تحدث مع 4 أساتذة متخصصين بالذكاء الاصطناعي للتعليم السريري." },
  { icon: FileText,   color: "violet", titleEn: "Clinical Notes",       titleAr: "الملاحظات السريرية",       descEn: "AI-assisted SOAP notes with PDF export and template library.", descAr: "ملاحظات SOAP بمساعدة الذكاء الاصطناعي مع تصدير PDF ومكتبة قوالب." },
];

const STATS = [
  { value: "13",   labelEn: "Specialties",      labelAr: "تخصص طبي" },
  { value: "50+",  labelEn: "USMLE Questions",  labelAr: "سؤال USMLE" },
  { value: "200+", labelEn: "Medical Sources",  labelAr: "مصدر طبي" },
  { value: "3",    labelEn: "AI Agents (MDT)",  labelAr: "وكيل ذكاء (MDT)" },
];

const colorMap: Record<string, string> = {
  indigo:  "bg-indigo-500/10 text-indigo-500",
  rose:    "bg-rose-500/10 text-rose-500",
  amber:   "bg-amber-500/10 text-amber-500",
  teal:    "bg-teal-500/10 text-teal-500",
  sky:     "bg-sky-500/10 text-sky-500",
  red:     "bg-red-500/10 text-red-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  violet:  "bg-violet-500/10 text-violet-500",
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  // Only show spinner when Supabase is actively checking session
  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#020617] flex items-center justify-center z-[200]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HeartPulse className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Authenticated users are redirected above; show landing to guests
  if (user) return null;

  return (
    <div className="w-full" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden animate-in fade-in duration-1000">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-24 w-full">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Badge */}
            <div className="glass-nav px-5 py-2 rounded-2xl border border-indigo-500/20 flex items-center gap-3 shadow-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                {isAr ? "الذكاء الطبي · الجيل القادم" : "Medical AI · Next Generation · 2026"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-[var(--text-primary)] max-w-5xl">
              {isAr ? (
                <>
                  منصة الطب<br />
                  <span className="medical-gradient-3d drop-shadow-2xl">المستقبل</span>
                </>
              ) : (
                <>
                  Medicine&apos;s<br />
                  <span className="medical-gradient-3d drop-shadow-2xl">AI Command</span><br />
                  Center
                </>
              )}
            </h1>

            <p className="text-xl md:text-2xl text-[var(--text-tertiary)] dark:text-[var(--text-tertiary)]/70 font-medium max-w-3xl leading-relaxed text-balance">
              {isAr
                ? "منصة التعليم الطبي الذكية — محاكاة سريرية، مناظرات MDT، تحليل ECG، فحص الأدوية، وأكثر — كل ذلك مدعوم بـ Gemini AI."
                : "The AI-powered medical education platform — OSCE simulations, MDT debates, ECG analysis, drug checking, and more — all powered by Gemini AI."}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/auth/register" className="btn-elite py-5 px-10 rounded-3xl text-lg">
                {isAr ? "ابدأ مجاناً" : "Start Free"}
                <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
              </Link>
              <Link href="/auth/login"
                className="py-5 px-10 rounded-3xl text-lg font-black border-2 border-[var(--border-subtle)] hover:border-indigo-500 text-[var(--text-secondary)] dark:text-slate-300 transition-all">
                {isAr ? "تسجيل الدخول" : "Sign In"}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              {[
                { icon: Shield,  textEn: "HIPAA & GDPR 2026",        textAr: "متوافق HIPAA & GDPR" },
                { icon: Zap,     textEn: "Gemini 2.0 Flash",         textAr: "Gemini 2.0 Flash" },
                { icon: Globe,   textEn: "Arabic & English",         textAr: "عربي وإنجليزي" },
              ].map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.textEn} className="flex items-center gap-2 text-[var(--text-tertiary)]/70">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{isAr ? b.textAr : b.textEn}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-1)] py-10">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.value} className="text-center">
                <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{s.value}</p>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)]/70 mt-1">
                  {isAr ? s.labelAr : s.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">
            {isAr ? "الميزات" : "Features"}
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-primary)]">
            {isAr ? "كل ما تحتاجه في مكان واحد" : "Everything You Need"}
          </h2>
          <p className="text-[var(--text-tertiary)] mt-4 max-w-2xl mx-auto">
            {isAr
              ? "منصة شاملة تجمع أدوات التعليم الطبي الذكية في واجهة واحدة متكاملة."
              : "A complete platform combining AI-powered medical learning tools in one seamless interface."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.titleEn} className="medpulse-card glass level-1 p-6 group hover:scale-[1.02] transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${colorMap[f.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-[var(--text-primary)] mb-2">
                  {isAr ? f.titleAr : f.titleEn}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {isAr ? f.descAr : f.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[var(--bg-1)] py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-3">
            {isAr ? "كيف تعمل" : "How It Works"}
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--text-primary)] mb-16">
            {isAr ? "ثلاث خطوات للإتقان" : "Three Steps to Mastery"}
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", titleEn: "Create Account",   titleAr: "إنشاء حساب",     descEn: "Register free as a student or professor with your medical email.", descAr: "سجل مجاناً كطالب أو أستاذ بإيميلك الطبي." },
              { step: "02", titleEn: "Choose a Module",  titleAr: "اختر وحدة",       descEn: "Pick from 10+ AI-powered clinical modules tailored to your level.", descAr: "اختر من +10 وحدة سريرية ذكية مصممة لمستواك." },
              { step: "03", titleEn: "Track Progress",   titleAr: "تابع تقدمك",      descEn: "Earn XP, climb ranks, and review session history on your dashboard.", descAr: "اكسب نقاط XP، ارتقِ في الرتب، وراجع سجل جلساتك." },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20">
                  {s.step}
                </div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">{isAr ? s.titleAr : s.titleEn}</h3>
                <p className="text-sm text-[var(--text-tertiary)] text-balance leading-relaxed">{isAr ? s.descAr : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance Section ── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
        <div className="clinical-card-3d p-10 md:p-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[var(--text-primary)] mb-4">
            {isAr ? "أمان وخصوصية على أعلى مستوى" : "Enterprise-Grade Security"}
          </h2>
          <p className="text-[var(--text-tertiary)] max-w-2xl mx-auto mb-8 leading-relaxed">
            {isAr
              ? "جميع البيانات مشفرة بـ AES-256 ومتوافقة مع معايير HIPAA و GDPR الدولية لعام 2026. لا مشاركة بيانات مع أطراف ثالثة."
              : "All data encrypted with AES-256, fully compliant with HIPAA & GDPR 2026 international standards. Zero third-party data sharing."}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["HIPAA 2026", "GDPR Compliant", "AES-256", "Supabase RLS", "Gemini AI"].map(badge => (
              <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                <CheckCircle className="w-4 h-4" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-teal-500 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">
            {isAr ? "ابدأ رحلتك الطبية اليوم" : "Start Your Medical Journey Today"}
          </h2>
          <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
            {isAr
              ? "انضم إلى منصة MedPulse AI وارتقِ بمهاراتك السريرية إلى مستوى جديد."
              : "Join MedPulse AI and elevate your clinical skills to the next level."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register"
              className="bg-white text-indigo-600 font-black text-lg py-5 px-12 rounded-3xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-3">
              {isAr ? "إنشاء حساب مجاني" : "Create Free Account"}
              <ChevronRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
            </Link>
            <Link href="/auth/login"
              className="text-white border-2 border-white/30 font-black text-lg py-5 px-12 rounded-3xl hover:bg-white/10 transition-all">
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
