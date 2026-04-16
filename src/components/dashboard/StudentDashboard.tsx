"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, GraduationCap, ArrowRight, Search, BookMarked, PlayCircle, Sparkles, Activity, ShieldCheck, Clock } from "lucide-react";

const SAVED_SETS = [
  { id: 1, title: "Cardiology: Arrhythmias", count: "45 Flashcards", savedAt: "Saved 2 days ago" },
  { id: 2, title: "Pharmacology: Antibiotics", count: "120 MCQs", savedAt: "Saved last week" },
  { id: 3, title: "Anatomy: Circle of Willis", count: "32 Diagrams", savedAt: "Saved 1 hour ago" },
];

const QUICK_LINKS = [
  { label: "Physiology", href: "/encyclopedia/physiology" },
  { label: "Cardiology", href: "/encyclopedia/cardiology" },
  { label: "Pathology", href: "/encyclopedia/pathology" },
  { label: "Internal Medicine", href: "/encyclopedia/internal-medicine" },
];

export function StudentDashboard() {
  const router = useRouter();
  const { t, lang, dir } = useLanguage();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/encyclopedia?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 space-y-12 fade-in" dir={dir}>
      {/* ─── Elite Welcome Header ─── */}
      <header className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-2 glass-nav rounded-2xl border border-indigo-500/20 shadow-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              {t.common.verifiedContext} v3.0
            </span>
          </div>
          <div className="px-5 py-2 glass-nav rounded-2xl border border-slate-200/50 dark:border-white/5 shadow-xl flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {t.common.ragDisclaimer}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
            {lang === 'ar' ? "أهلاً بك،" : "Welcome back,"} <br />
            <span className="medical-gradient-3d drop-shadow-2xl">
              {lang === 'ar' ? "طبيب المستقبل." : "Future Doctor."}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-3xl leading-relaxed text-balance">
            {lang === 'ar' 
              ? "مركز القيادة المتكامل للذكاء الطبي والأبحاث السريرية الموثقة." 
              : "Integrated command center for medical intelligence and clinical research."}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ─── Main Intelligence Hub ─── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Command Search Bar 3D */}
          <div className="clinical-card-3d p-8 md:p-12 overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transform translate-x-10 -translate-y-10 group-hover:rotate-12 transition-transform duration-1000">
              <Activity className="w-96 h-96 text-indigo-500" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {lang === 'ar' ? "محرك البحث السريري" : "Clinical Intelligence Search"}
                </h2>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group/input">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === 'ar' ? "ابحث عن الأدوية، التشخيصات، أو البروتوكولات..." : "Search drugs, diagnoses, or protocols..."}
                    className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-950/50 border-2 border-slate-100 dark:border-white/5 rounded-3xl text-xl font-bold 
                             focus:border-indigo-500/50 focus:ring-[12px] focus:ring-indigo-500/5 transition-all outline-none shadow-2xl shadow-slate-200/50 dark:shadow-none"
                  />
                </div>
                <button type="submit" className="btn-elite py-6 px-10 rounded-3xl text-lg">
                  {lang === 'ar' ? "تحليل" : "Execute"}
                  <ArrowRight className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </button>
              </form>

              <div className="flex flex-wrap gap-3">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-black uppercase tracking-widest
                             hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/mdt" className="clinical-card-3d p-8 group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{t.nav.mdt}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                {lang === 'ar' ? "مناظرات طبية بين 3 وكلاء ذكاء اصطناعي لضمان دقة التشخيص." : "Clinical debates between 3 AI agents to ensure diagnostic accuracy."}
              </p>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest">
                {lang === 'ar' ? "دخول القنصلية" : "Enter Console"}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link href="/simulator" className="clinical-card-3d p-8 group border-rose-500/20">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-6 border border-rose-500/20 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{t.nav.simulator}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                {lang === 'ar' ? "اختبر مهاراتك في محاكاة الحالات السريرية OSCE مع تقييم فوري." : "Test your skills in OSCE clinical simulations with instant feedback."}
              </p>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs uppercase tracking-widest">
                {lang === 'ar' ? "بدء المحاكاة" : "Start Simulation"}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* ─── Secondary Stats Hub ─── */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Recent Activity 3D */}
          <div className="clinical-card-3d p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                {lang === 'ar' ? "الأرشيف الحديث" : "Recent Archives"}
              </h3>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                {SAVED_SETS.length} NEW
              </div>
            </div>

            <div className="space-y-4">
              {SAVED_SETS.map((set) => (
                <div key={set.id} className="group p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-xl transition-all cursor-pointer">
                  <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm mb-2">{set.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{set.count}</span>
                    <span className="text-[10px] font-black text-indigo-500">{set.savedAt}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-elite w-full mt-8 py-5 rounded-2xl text-xs">
              {lang === 'ar' ? "عرض المكتبة كاملة" : "View Full Library"}
            </button>
          </div>

          {/* Compliance & Status */}
          <div className="clinical-card-3d p-8 border-emerald-500/20 overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Compliance Protocol</span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'ar' 
                ? "جميع البيانات متوافقة مع معايير HIPAA و GDPR العالمية لعام 2026. الاتصال مشفر بنظام AES-256."
                : "All data is compliant with global HIPAA & GDPR 2026 standards. Connection encrypted via AES-256."}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Encrypted</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
