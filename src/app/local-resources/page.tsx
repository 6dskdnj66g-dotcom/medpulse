"use client";
import { useLanguage } from "@/components/LanguageContext";
import { Construction } from "lucide-react";

export default function Page() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center" dir={dir}>
      <div className="w-20 h-20 bg-[var(--color-medical-indigo)]/10 rounded-3xl flex items-center justify-center mb-6 border border-[var(--color-medical-indigo)]/20">
        <Construction className="w-10 h-10 text-[var(--color-medical-indigo)]" />
      </div>
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-3">
        {isAr ? "" : ""}
      </h1>
      <p className="text-[var(--text-secondary)] font-medium max-w-md">
        {isAr ? "هذه الميزة قيد البناء. ترقّبوا إطلاقها قريباً." : "This feature is coming soon. Stay tuned for the launch."}
      </p>
    </div>
  );
}