"use client";

import { useLanguage } from "@/core/i18n/LanguageContext";
import { Activity, Brain, Globe, GraduationCap, MonitorCheck } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen py-24 pb-32 animate-in fade-in duration-700 relative" dir={dir}>
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 md:px-10 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-20 h-20 mx-auto bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-8 border border-white/10 dark:border-white/5">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight mb-6">
            {isAr ? "نصنع مستقبل الطب بالذكاء الاصطناعي" : "Engineering the Future of Clinical UI"}
          </h1>
          <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed">
            {isAr 
              ? "ميد-بلس (MedPulse) هي منصة متكاملة للتعليم الطبي المستمر والمحاكاة السريرية. بنيت بأيدي أطباء ومبرمجين لتجهيز الجيل القادم من الممارسين الصحيين." 
              : "MedPulse AI is a complete ecosystem for continuing medical education and clinical simulation. Built by doctors and engineers to prepare the next generation of healthcare professionals."}
          </p>
        </div>

        {/* Mission Glass Card */}
        <div className="medpulse-card glass level-2 rounded-[40px] p-10 border border-[var(--border-subtle)] mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full" />
          <h2 className="text-3xl font-black text-[var(--text-primary)] mb-4">{isAr ? "رؤيتنا" : "Our Vision"}</h2>
          <p className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed">
            {isAr 
              ? "نسعى لسد الفجوة بين التقنية العالية والمعرفة الطبية الدقيقة. نحن نؤمن بأن الذكاء الاصطناعي لا يمكنه استبدال الطبيب، ولكنه حتماً سيجعل الطبيب أسرع وأكثر أماناً في اتخاذ القرار وتدريب طلاب الطب بقوة لم يعهدها التاريخ." 
              : "We aim to bridge the gap between high-tech AI and exact medical logic. While AI can never replace a doctor, it can make doctors exponentially faster and safer, and train medical students with a rigor never before seen in human history."}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: <MonitorCheck />, titleAr: "تصميم للممارسين", titleEn: "Clinical UX/UI", descAr: "واجهات زجاجية (Apple-tier) تدعم تعدد المهام للأطباء.", descEn: "Apple-tier glassmorphism supporting high-density workflow." },
            { icon: <Brain />, titleAr: "محاكاة منطقية", titleEn: "Cognitive Simulation", descAr: "أول محاكي OSCE مع نظام تفكير المجمع الطبي (MDT).", descEn: "The first OSCE simulator utilizing Multi-Disciplinary Team consensus logic." },
            { icon: <Globe />, titleAr: "الوطن العربي للميتافيرس", titleEn: "Global Reach", descAr: "دعم فوري وفائق الدقة للغة العربية والمصطلحات الإنجليزية الطبية المخلوطة.", descEn: "Flawless bilingual support handling mixed Arab-English medical terminology." },
            { icon: <GraduationCap />, titleAr: "بنك معرفة متصل", titleEn: "Integrated Knowledge", descAr: "مكتبة ضخمة وUSMLE مترابطة ببيانات المريض لحظياً.", descEn: "A massive internal NCBI-linked library natively wired with step 1 logic." }
          ].map((f, i) => (
            <div key={i} className="medpulse-card glass level-1 p-6 rounded-3xl border border-[var(--border-subtle)] flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-500 flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{isAr ? f.titleAr : f.titleEn}</h3>
                <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{isAr ? f.descAr : f.descEn}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Builder */}
        <div className="text-center pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-lg font-medium text-[var(--text-tertiary)] mb-2">
            {isAr ? "تم التصميم والبناء بشغف بواسطة" : "Architected and engineered with passion by"}
          </p>
          <div className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent inline-block tracking-tight mb-2">
            Hasanain Salah
          </div>
          <p className="text-[var(--text-secondary)] font-semibold">
            {isAr ? "كبير مهندسي النظم ومنشئ المشروع" : "Distinguished Systems Architect & Creator"}
          </p>
        </div>

      </div>
    </div>
  );
}