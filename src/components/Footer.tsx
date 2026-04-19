// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { Activity, ShieldAlert, ExternalLink } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function Footer() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer
      className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-sm"
      dir={dir}
    >
      {/* Medical Disclaimer — always visible */}
      <div className="bg-amber-500/5 border-b border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] md:text-[12px] font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
            {isAr
              ? "⚕️ تنبيه طبي: هذه المنصة مخصصة للتعليم الطبي والمساعدة البحثية فقط. لا تُغني عن استشارة طبيب مرخص أو التشخيص أو العلاج. في حالات الطوارئ اتصل بالإسعاف فوراً (911/997/998/999). المعلومات مبنية على إرشادات 2026 لكن لا تحل محل التقييم السريري الشخصي."
              : "⚕️ Medical Disclaimer: This platform is for educational and research purposes only. It does not replace consultation with a licensed physician, diagnosis, or treatment. In emergencies, call emergency services immediately. Information is based on 2026 guidelines but does not substitute personal clinical assessment."}
          </p>
        </div>
      </div>

      {/* Footer body */}
      <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">MedPulse AI</span>
              <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-0.5">
                {isAr ? "الذكاء الاصطناعي الطبي العربي" : "Arabic Clinical Intelligence Platform"}
              </p>
            </div>
          </div>

          {/* AI attribution */}
          <div className="flex items-center gap-2 bg-[var(--bg-2)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              {isAr
                ? "مُشغَّل بالذكاء الاصطناعي · RAG · إرشادات موثّقة"
                : "Powered by Groq · RAG · Evidence-Based Guidelines"}
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              { labelAr: "سياسة الخصوصية", labelEn: "Privacy Policy",  href: "#" },
              { labelAr: "شروط الاستخدام",  labelEn: "Terms of Use",    href: "#" },
              { labelAr: "تواصل معنا",       labelEn: "Contact",         href: "#" },
            ].map(l => (
              <Link
                key={l.labelEn}
                href={l.href}
                className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--color-medical-indigo)] transition-colors"
              >
                {isAr ? l.labelAr : l.labelEn}
              </Link>
            ))}
            <a
              href="https://github.com/6dskdnj66g-dotcom/medpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[var(--text-tertiary)] hover:text-[var(--color-medical-indigo)] transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-[var(--text-tertiary)] font-medium">
            © 2026 MedPulse AI · {isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-medium text-center">
            {isAr
              ? "مبني على: WHO · NEJM · ACC/AHA · ESC · KDIGO · AAN · ACOG"
              : "Built on: WHO · NEJM · ACC/AHA · ESC · KDIGO · AAN · ACOG"}
          </p>
        </div>
      </div>
    </footer>
  );
}
