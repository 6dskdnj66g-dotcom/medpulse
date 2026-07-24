"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { IraqiQuestionBank } from "@/components/resources/IraqiQuestionBank";

export default function IraqiMcqBankPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col" dir={dir}>
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <Link
            href="/local-resources"
            className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[12px] font-bold transition-colors mb-3 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            {isAr ? "قاعدة المعرفة" : "Knowledge Base"}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
              {isAr ? "بنك الأسئلة العراقي" : "Iraqi Past-Paper Bank"}
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight">
            {isAr ? "أسئلة الامتحانات السابقة" : "Past-paper MCQs"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            {isAr
              ? "أسئلة تفاعلية مع الإجابات النموذجية والشرح. أضف الأسئلة من لوحة الإدارة."
              : "Interactive questions with correct answers and explanations. Admins can add questions from the CMS."}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-6 pb-24">
        <IraqiQuestionBank isAr={isAr} />
      </main>
    </div>
  );
}
