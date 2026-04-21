"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/core/i18n/translations';

type LanguageContextType = {
  lang: Language;
  dir: 'ltr' | 'rtl';
  t: typeof translations.en;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('medpulse_lang') as Language;
      if (saved === 'en' || saved === 'ar') return saved;
    }
    return 'ar';
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('medpulse_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang, mounted]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
  };

  const t = translations[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggleLanguage, setLanguage }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

