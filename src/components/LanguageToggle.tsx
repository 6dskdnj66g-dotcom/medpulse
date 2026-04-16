"use client";

import { useLanguage } from "./LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
          lang === 'ar'
            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
          lang === 'en'
            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
