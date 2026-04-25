"use client";

import { Scan } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import Link from "next/link";

const SYSTEMS = [
  { id: "cardiovascular", labelEn: "Cardiovascular", labelAr: "جهاز القلب والأوعية", emoji: "❤️", linked: "/encyclopedia/cardiology" },
  { id: "respiratory",    labelEn: "Respiratory",    labelAr: "الجهاز التنفسي",        emoji: "🫁", linked: "/encyclopedia/pulmonology" },
  { id: "nervous",        labelEn: "Nervous System", labelAr: "الجهاز العصبي",         emoji: "🧠", linked: "/encyclopedia/neurology" },
  { id: "gastrointestinal",labelEn: "Gastrointestinal", labelAr: "الجهاز الهضمي",     emoji: "🫄", linked: "/encyclopedia/gastroenterology" },
  { id: "musculoskeletal", labelEn: "Musculoskeletal", labelAr: "الجهاز الحركي",      emoji: "🦴", linked: "/encyclopedia/orthopedics" },
  { id: "endocrine",      labelEn: "Endocrine",      labelAr: "الغدد الصماء",          emoji: "⚗️", linked: "/encyclopedia/endocrinology" },
];

export default function AnatomyPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
            <Scan className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "أطلس التشريح" : "Anatomy Atlas"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              Interactive organ systems
            </p>
          </div>
        </div>
      </div>

      <div className="medpulse-card p-5 mb-8 border-l-4 border-amber-500">
        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
          {isAr
            ? "قريباً: نماذج تفاعلية ثلاثية الأبعاد مع ربط مباشر بالموسوعة الطبية. في الوقت الحالي، تصفح الأجهزة للوصول إلى المحتوى التعليمي."
            : "Coming soon: interactive 3D models using open-source Z-anatomy (CC-licensed). For now, browse organ systems to access educational content."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SYSTEMS.map((sys) => (
          <Link
            key={sys.id}
            href={sys.linked}
            className="medpulse-card p-6 flex flex-col items-center text-center gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <span className="text-4xl">{sys.emoji}</span>
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-sm">
                {isAr ? sys.labelAr : sys.labelEn}
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-1">
                {isAr ? "عرض الموسوعة ←" : "View Encyclopedia →"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-8 font-medium">
        {isAr
          ? "النماذج ثلاثية الأبعاد قادمة — ستستخدم Z-anatomy (ترخيص CC) مع مكون model-viewer"
          : "3D models coming — will use Z-anatomy (CC license) via model-viewer web component"}
      </p>
    </div>
  );
}
