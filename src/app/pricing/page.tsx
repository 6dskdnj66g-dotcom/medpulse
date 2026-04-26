"use client";

import { useLanguage } from "@/core/i18n/LanguageContext";
import { CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen py-24 pb-32 animate-in fade-in duration-700 relative" dir={dir}>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[var(--color-medical-indigo)]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-16 h-16 mx-auto bg-indigo-500/10 flex items-center justify-center rounded-2xl border border-indigo-500/20 mb-6">
            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
            {isAr ? "استثمر في مستقبلك الطبي" : "Invest in Your Clinical Future"}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium">
            {isAr 
              ? "اختر الباقة التي تناسب رحلتك الطبية. جميع الباقات مجانية بالكامل خلال فترة الإطلاق التجريبي (Beta)." 
              : "Choose the plan that fits your medical journey. All plans are currently free during our Beta launch."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-[var(--bg-2)] p-1.5 rounded-2xl border border-[var(--border-subtle)] inline-flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                billingCycle === "monthly" 
                  ? "bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]" 
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {isAr ? "شهري" : "Monthly"}
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === "yearly" 
                  ? "bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]" 
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {isAr ? "سنوي" : "Yearly"}
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">
                {isAr ? "وفر ٢٠٪" : "Save 20%"}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Basic */}
          <div className="medpulse-card glass level-1 rounded-[32px] p-8 border border-[var(--border-subtle)] hover:border-indigo-500/30 transition-all flex flex-col">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{isAr ? "الأساسي" : "Basic"}</h3>
            <p className="text-[var(--text-tertiary)] text-sm mb-6 min-h-[40px]">
              {isAr ? "للطلاب والمبتدئين في المجال الأكاديمي." : "For students starting their clinical journey."}
            </p>
            <div className="mb-6">
              <span className="text-4xl font-black text-[var(--text-primary)]">$0</span>
              <span className="text-[var(--text-tertiary)] text-sm">/{isAr ? "مجاناً دائماً" : "forever"}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                isAr ? "محرك بحث المكتبة الطبية" : "Medical Library Search",
                isAr ? "الوصول لـ ٥ حالات USMLE يومياً" : "Access to 5 USMLE cases/day",
                isAr ? "المدقق الدوائي الأساسي" : "Basic Drug Checker",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <span className="text-[14px] text-[var(--text-secondary)] font-medium">{feat}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="w-full py-4 rounded-2xl bg-[var(--bg-2)] hover:bg-slate-200 dark:hover:bg-slate-800 text-center font-bold text-[var(--text-primary)] transition-all">
              {isAr ? "بدء الاستخدام" : "Get Started"}
            </Link>
          </div>

          {/* Pro */}
          <div className="medpulse-card glass level-2 rounded-[32px] p-8 border-2 border-indigo-500 shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] transform md:-translate-y-4 flex flex-col relative z-20">
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                {isAr ? "الأكثر طلباً" : "Most Popular"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{isAr ? "المحترف (Pro)" : "Professional"}</h3>
            <p className="text-[var(--text-tertiary)] text-sm mb-6 min-h-[40px]">
              {isAr ? "للأطباء والممارسين المتقدمين (متوفر مجاناً مؤقتاً)." : "For residents and clinical practitioners (Free during Beta)."}
            </p>
            <div className="mb-6 flex items-end gap-2">
              <span className="text-4xl font-black text-[var(--text-primary)] line-through opacity-30">
                ${billingCycle === "monthly" ? "49" : "39"}
              </span>
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">$0</span>
              <span className="text-[var(--text-tertiary)] text-sm pb-1">/{isAr ? "شهر (نسخة تجريبية)" : "mo (Beta)"}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                isAr ? "محاكي OSCE الذكي (غير محدود)" : "Unlimited AI OSCE Simulator",
                isAr ? "بنك USMLE كامل مع شرح مفصل" : "Full USMLE Bank with Explanations",
                isAr ? "تحليل تخطيط القلب المفتوح للـ AI" : "Advanced ECG AI Analysis",
                isAr ? "استشارات الـ MDT المجلس الطبي" : "MDT Board Consultations",
                isAr ? "مترجم وملخص طبي احترافي" : "Professional Medical Summarizer"
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-[14px] text-[var(--text-primary)] font-bold">{feat}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-center font-bold text-white shadow-md transition-all">
              {isAr ? "تفعيل النسخة المجانية (Beta)" : "Claim Free Beta Access"}
            </Link>
          </div>

          {/* Enterprise */}
          <div className="medpulse-card glass level-1 rounded-[32px] p-8 border border-[var(--border-subtle)] hover:border-indigo-500/30 transition-all flex flex-col">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{isAr ? "المؤسسات" : "Enterprise"}</h3>
            <p className="text-[var(--text-tertiary)] text-sm mb-6 min-h-[40px]">
              {isAr ? "للمستشفيات والجامعات الطبية." : "For hospitals and universities."}
            </p>
            <div className="mb-6">
              <span className="text-3xl font-black text-[var(--text-primary)]">{isAr ? "مخصص" : "Custom"}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                isAr ? "كل ميزات الاحترافي" : "All Pro features",
                isAr ? "لوحة تحكم وتحليلات للأساتذة" : "Professor Analytics Dashboard",
                isAr ? "أمان البيانات المتقدم المتوافق مع HIPAA" : "Advanced HIPAA-compliant security",
                isAr ? "دعم تقني على مدار الساعة" : "24/7 Dedicated Support",
              ].map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[14px] text-[var(--text-secondary)] font-medium">{feat}</span>
                </li>
              ))}
            </ul>
            <Link href="mailto:contact@medpulse.ai" className="w-full py-4 rounded-2xl bg-[var(--bg-2)] hover:bg-slate-200 dark:hover:bg-slate-800 text-center font-bold text-[var(--text-primary)] transition-all border border-[var(--border-subtle)]">
              {isAr ? "تواصل مع المبيعات" : "Contact Sales"}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}