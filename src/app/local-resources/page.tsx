"use client";

import { useLanguage } from "@/core/i18n/LanguageContext";
import { IraqiMedicalSidebar } from "@/components/resources/IraqiMedicalSidebar";
import { BookMarked } from "lucide-react";

export default function LocalResourcesPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col" dir={dir}>
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
              {isAr ? "المصادر المحلية" : "Local Resources"}
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight">
            {isAr ? "المراجع الطبية للطلبة العراقيين" : "Iraqi Medical Resources"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            {isAr
              ? "دليل مُنسّق للكليات الطبية العراقية، المراجع الأكاديمية الأساسية، والإرشادات السريرية الوطنية والعالمية."
              : "A curated directory of Iraqi medical colleges, core academic references used across MBChB curricula, and clinical guidelines from Iraqi and international bodies."}
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-2 md:px-4 py-4">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-1)] overflow-hidden shadow-sm h-[calc(100dvh-14rem)] min-h-[500px]">
          <IraqiMedicalSidebar isAr={isAr} />
        </div>
      </main>
    </div>
  );
}
