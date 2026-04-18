// src/app/library/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BookOpen, Search, Filter, ExternalLink, Bookmark, BookmarkCheck,
  Globe, Star, Database, ScrollText, BookMarked, ChevronDown,
  Newspaper, Award, X, Lock, Unlock, ChevronRight, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { ALL_MEDICAL_SOURCES, type MedicalSource } from "@/lib/medicalSources";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { useLanguage } from "@/components/LanguageContext";

// ── Type configs ─────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { labelAr: string; labelEn: string; icon: React.ElementType; color: string }> = {
  journal:       { labelAr: "مجلات دولية",          labelEn: "International Journals", icon: Newspaper,  color: "indigo" },
  journal_arab:  { labelAr: "مجلات عربية",           labelEn: "Arab Journals",          icon: Globe,      color: "emerald" },
  database:      { labelAr: "قواعد البيانات",         labelEn: "Databases",              icon: Database,   color: "sky" },
  database_arab: { labelAr: "قواعد بيانات عربية",    labelEn: "Arab Databases",         icon: Globe,      color: "teal" },
  guideline:     { labelAr: "إرشادات سريرية",        labelEn: "Clinical Guidelines",    icon: ScrollText, color: "amber" },
  textbook:      { labelAr: "كتب طبية",              labelEn: "Medical Textbooks",      icon: BookMarked, color: "violet" },
  organization:  { labelAr: "منظمات دولية",          labelEn: "Organizations",          icon: Award,      color: "rose" },
};

const REGION_CONFIG: Record<string, { labelAr: string; labelEn: string; flag: string }> = {
  global: { labelAr: "عالمي",       labelEn: "Global",       flag: "🌐" },
  mena:   { labelAr: "عربي / MENA", labelEn: "Arab / MENA",  flag: "🌍" },
  usa:    { labelAr: "أمريكا",      labelEn: "USA",          flag: "🇺🇸" },
  europe: { labelAr: "أوروبا",      labelEn: "Europe",       flag: "🇪🇺" },
  asia:   { labelAr: "آسيا",        labelEn: "Asia",         flag: "🌏" },
  arab:   { labelAr: "عربي",        labelEn: "Arab",         flag: "🟢" },
};

const COLOR_MAP: Record<string, string> = {
  indigo:  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  teal:    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const ALL_SPECIALTIES = Array.from(
  new Set(ALL_MEDICAL_SOURCES.map(s => s.specialty).filter(Boolean))
).sort() as string[];

// ── Preview Modal ─────────────────────────────────────────────────────────────
function SourcePreviewModal({
  source, onClose, isAr
}: { source: MedicalSource; onClose: () => void; isAr: boolean }) {
  const typeConfig = TYPE_CONFIG[source.type] || TYPE_CONFIG.journal;
  const Icon = typeConfig.icon;
  const colorClass = COLOR_MAP[typeConfig.color] || COLOR_MAP.indigo;
  const regionInfo = REGION_CONFIG[source.region || "global"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg medpulse-card glass level-2 rounded-[28px] border border-[var(--border-subtle)] shadow-2xl p-6 animate-in slide-in-from-bottom-8 zoom-in-95 duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5 pr-10">
          <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] leading-snug">{source.name}</h2>
            {source.abbreviation && (
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 inline-block uppercase tracking-widest ${colorClass}`}>
                {source.abbreviation}
              </span>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-[var(--bg-2)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              {isAr ? "النوع" : "Type"}
            </p>
            <p className="text-[12px] font-extrabold text-[var(--text-primary)]">
              {isAr ? typeConfig.labelAr : typeConfig.labelEn}
            </p>
          </div>
          <div className="bg-[var(--bg-2)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              {isAr ? "المنطقة" : "Region"}
            </p>
            <p className="text-[12px] font-extrabold text-[var(--text-primary)]">
              {regionInfo.flag} {isAr ? regionInfo.labelAr : regionInfo.labelEn}
            </p>
          </div>
          {source.impactFactor && (
            <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1">
                {isAr ? "معامل التأثير" : "Impact Factor"}
              </p>
              <p className="text-[12px] font-black text-amber-600">{source.impactFactor}</p>
            </div>
          )}
          <div className={`rounded-xl p-3 border ${source.openAccess ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[var(--bg-2)] border-[var(--border-subtle)]"}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              {isAr ? "الوصول" : "Access"}
            </p>
            <p className={`text-[12px] font-extrabold flex items-center gap-1 ${source.openAccess ? "text-emerald-600" : "text-[var(--text-secondary)]"}`}>
              {source.openAccess
                ? <><Unlock className="w-3 h-3" />{isAr ? "مفتوح" : "Free"}</>
                : <><Lock className="w-3 h-3" />{isAr ? "اشتراك" : "Subscription"}</>}
            </p>
          </div>
        </div>

        {source.specialty && (
          <p className="text-[12px] text-[var(--text-secondary)] font-medium mb-5 bg-[var(--bg-2)] px-3 py-2 rounded-xl border border-[var(--border-subtle)]">
            <span className="font-black text-[var(--text-primary)]">{isAr ? "التخصص: " : "Specialty: "}</span>
            {source.specialty}
          </p>
        )}

        {/* CTA */}
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] shadow-[0_8px_24px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_28px_-8px_rgba(99,102,241,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest"
          >
            <ArrowUpRight className="w-4 h-4" />
            {isAr ? "فتح المصدر الأصلي" : "Open Source Website"}
          </a>
        ) : (
          <div className="w-full py-4 rounded-2xl text-center text-[13px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-2)] border border-[var(--border-subtle)]">
            {isAr ? "لا يتوفر رابط مباشر" : "No direct URL available"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Source Card ───────────────────────────────────────────────────────────────
function SourceCard({
  source, bookmarked, onToggleBookmark, onOpenPreview, lang
}: {
  source: MedicalSource;
  bookmarked: boolean;
  onToggleBookmark: (name: string) => void;
  onOpenPreview: (s: MedicalSource) => void;
  lang: "en" | "ar";
}) {
  const typeConfig = TYPE_CONFIG[source.type] || TYPE_CONFIG.journal;
  const Icon = typeConfig.icon;
  const typeLabel = lang === "ar" ? typeConfig.labelAr : typeConfig.labelEn;
  const colorClass = COLOR_MAP[typeConfig.color] || COLOR_MAP.indigo;
  const regionInfo = REGION_CONFIG[source.region || "global"];
  const regionLabel = lang === "ar" ? regionInfo.labelAr : regionInfo.labelEn;

  const isInternal = source.type === "textbook" && !!source.slug;
  const cardClass = "medpulse-card glass level-1 p-5 md:p-6 transition-all duration-500 group border border-[var(--border-subtle)] hover:shadow-xl hover:-translate-y-1 relative overflow-hidden cursor-pointer";
  const inner = (
    <>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none bg-[var(--color-medical-indigo)]" />

      <div className="flex items-start gap-4 relative z-10 h-full">
        {/* Icon */}
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner backdrop-blur-md ${colorClass}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-[15px] font-extrabold text-[var(--text-primary)] leading-snug tracking-tight line-clamp-2">{source.name}</h3>
              {source.abbreviation && (
                <span className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full border mt-1 inline-block uppercase tracking-widest ${colorClass}`}>
                  {source.abbreviation}
                </span>
              )}
            </div>
            {/* Actions — stop propagation so they don't trigger card click */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleBookmark(source.name); }}
                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-[12px] flex items-center justify-center transition-all ${
                  bookmarked
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    : "bg-[var(--bg-1)] text-[var(--text-tertiary)] hover:text-amber-500 border border-[var(--border-subtle)]"
                }`}
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              {isInternal ? (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-[12px] bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              ) : source.url ? (
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-[12px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Type + internal badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-lg border inline-block uppercase tracking-widest ${colorClass} bg-[var(--bg-0)]`}>
              {typeLabel}
            </span>
            {isInternal && (
              <span className="text-[9px] font-black px-2 py-1 rounded-lg border inline-block uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {lang === "ar" ? "محتوى داخلي" : "Full Content"}
              </span>
            )}
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] pt-3 opacity-90 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] md:text-[11px] font-extrabold px-2 py-1 rounded-[8px] bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-subtle)] flex items-center gap-1">
              {regionInfo.flag} {regionLabel}
            </span>
            {source.specialty && (
              <span className="text-[10px] md:text-[11px] font-extrabold px-2 py-1 rounded-[8px] bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-subtle)] truncate max-w-[120px]">
                {source.specialty}
              </span>
            )}
            {source.impactFactor && (
              <span className="text-[10px] md:text-[11px] font-black px-2 py-1 rounded-[8px] bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500/50" />
                IF {source.impactFactor}
              </span>
            )}
            {source.openAccess && (
              <span className="text-[10px] md:text-[11px] font-black px-2 py-1 rounded-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {lang === "ar" ? "مفتوح" : "Free"}
              </span>
            )}
            {source.language === "arabic" && (
              <span className="text-[10px] md:text-[11px] font-black px-2 py-1 rounded-[8px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                {lang === "ar" ? "عربي" : "Arabic"}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (isInternal) {
    return (
      <Link href={`/library/${source.slug}`} className={`${cardClass} block h-full`}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={() => onOpenPreview(source)} className={`${cardClass} text-left w-full h-full`}>
      {inner}
    </button>
  );
}

// ── Main Library Page ─────────────────────────────────────────────────────────
export default function SourceLibraryPage() {
  useSupabaseAuth();
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [openAccess, setOpenAccess] = useState(false);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [previewSource, setPreviewSource] = useState<MedicalSource | null>(null);

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("medpulse_source_bookmarks");
        if (stored) return new Set(JSON.parse(stored) as string[]);
      } catch { /* ignore */ }
    }
    return new Set<string>();
  });

  const toggleBookmark = useCallback((name: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      try { localStorage.setItem("medpulse_source_bookmarks", JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const filtered = useMemo(() => ALL_MEDICAL_SOURCES.filter(s => {
    if (showBookmarked && !bookmarks.has(s.name)) return false;
    if (selectedType !== "all" && s.type !== selectedType) return false;
    if (selectedRegion !== "all" && s.region !== selectedRegion) return false;
    if (selectedSpecialty !== "all" && s.specialty !== selectedSpecialty) return false;
    if (openAccess && !s.openAccess) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.abbreviation?.toLowerCase().includes(q) ?? false) ||
        (s.specialty?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  }), [search, selectedType, selectedRegion, selectedSpecialty, openAccess, showBookmarked, bookmarks]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_MEDICAL_SOURCES.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return counts;
  }, []);

  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleSources = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  // Reset pagination when filters change
  const resetFilters = () => {
    setSearch(""); setSelectedType("all"); setSelectedRegion("all");
    setSelectedSpecialty("all"); setOpenAccess(false); setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 relative" dir={dir}>
      <div className="absolute top-0 right-[10%] w-[40%] h-[40%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Preview Modal ── */}
      {previewSource && (
        <SourcePreviewModal
          source={previewSource}
          onClose={() => setPreviewSource(null)}
          isAr={isAr}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {isAr ? "مكتبة المصادر" : "Medical Source"}{" "}
                <span className="text-indigo-500">{isAr ? "الطبية" : "Library"}</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">
                {isAr
                  ? `${ALL_MEDICAL_SOURCES.length}+ مصدر طبي موثق — انقر على أي بطاقة للفتح`
                  : `${ALL_MEDICAL_SOURCES.length}+ verified sources — click any card to open`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2 lg:gap-3">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const label = isAr ? config.labelAr : config.labelEn;
            return (
              <div key={type} className="medpulse-card glass level-1 px-3 py-2 md:px-4 md:py-2.5 rounded-[12px] flex items-center gap-2 border-[var(--border-subtle)] shadow-sm">
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70" />
                <span className="text-[11px] md:text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">
                  {label}: <span className="text-[var(--color-medical-indigo)]">{typeCounts[type] || 0}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="sticky top-0 z-30 bg-transparent pt-2 pb-6 -mx-4 px-4 md:-mx-10 md:px-10">
        <div className="absolute inset-0 bg-[var(--bg-0)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-sm -z-10" />
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center relative z-10 w-full pt-2">
          <div className="relative flex-1 group">
            <Search className={`absolute ${dir === "rtl" ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-indigo-500 transition-colors`} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder={isAr ? "ابحث عن مجلة، قاعدة بيانات، كتاب..." : "Search journals, databases, textbooks..."}
              className={`w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] ${dir === "rtl" ? "pr-14 pl-5" : "pl-14 pr-5"} py-4 text-[14px] md:text-[15px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none transition-all shadow-inner`}
            />
          </div>
          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-4 rounded-[20px] border text-[13px] font-extrabold transition-all ${
                showFilters
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600"
                  : "bg-[var(--bg-0)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              <Filter className="w-4 h-4 opacity-70" />
              {isAr ? "فلاتر" : "Filters"}
              <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => { setShowBookmarked(p => !p); setVisibleCount(PAGE_SIZE); }}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-4 rounded-[20px] border text-[13px] font-extrabold transition-all ${
                showBookmarked
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                  : "bg-[var(--bg-0)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              <BookmarkCheck className="w-4 h-4 opacity-70" />
              {isAr ? `المفضلة (${bookmarks.size})` : `Saved (${bookmarks.size})`}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 mt-3 medpulse-card glass level-2 border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl relative z-20">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block">
                {isAr ? "نوع المصدر" : "Source Type"}
              </label>
              <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setVisibleCount(PAGE_SIZE); }}
                className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[16px] px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500/30 appearance-none cursor-pointer">
                <option value="all">{isAr ? "الكل" : "All Types"}</option>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{isAr ? v.labelAr : v.labelEn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block">
                {isAr ? "المنطقة" : "Region"}
              </label>
              <select value={selectedRegion} onChange={e => { setSelectedRegion(e.target.value); setVisibleCount(PAGE_SIZE); }}
                className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[16px] px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500/30 appearance-none cursor-pointer">
                <option value="all">{isAr ? "الكل" : "All Regions"}</option>
                {Object.entries(REGION_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.flag} {isAr ? v.labelAr : v.labelEn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 col-span-2 lg:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block">
                {isAr ? "التخصص" : "Specialty"}
              </label>
              <select value={selectedSpecialty} onChange={e => { setSelectedSpecialty(e.target.value); setVisibleCount(PAGE_SIZE); }}
                className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[16px] px-4 py-3 text-[13px] font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500/30 appearance-none cursor-pointer">
                <option value="all">{isAr ? "الكل" : "All Specialties"}</option>
                {ALL_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end col-span-2 lg:col-span-1">
              <button
                onClick={() => { setOpenAccess(p => !p); setVisibleCount(PAGE_SIZE); }}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[16px] border text-[13px] font-extrabold transition-all h-[49px] ${
                  openAccess
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                    : "bg-[var(--bg-0)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                }`}
              >
                <Globe className="w-4 h-4 opacity-70" />
                {isAr ? "Open Access فقط" : "Open Access Only"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Type quick-filter pills ── */}
      <div className="flex flex-row overflow-x-auto pb-4 pt-1 mb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:flex-wrap gap-2 lg:gap-3 hide-scrollbar relative z-10 w-full">
        {[
          { k: "all", labelAr: "الكل", labelEn: "All", icon: null },
          ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ k, labelAr: v.labelAr, labelEn: v.labelEn, icon: v.icon }))
        ].map(({ k, labelAr, labelEn, icon: TypeIcon }) => (
          <button
            key={k}
            onClick={() => { setSelectedType(k); setVisibleCount(PAGE_SIZE); }}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] text-[12px] md:text-[13px] font-extrabold transition-all duration-300 ${
              selectedType === k
                ? "bg-indigo-600 text-white shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] scale-105"
                : "bg-[var(--bg-0)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-medical-indigo)]/30"
            }`}
          >
            {TypeIcon && <TypeIcon className={`w-3.5 h-3.5 ${selectedType === k ? "opacity-100" : "opacity-50"}`} />}
            {isAr ? labelAr : labelEn}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center border border-[var(--color-medical-indigo)]/20">
            <span className="text-[12px] font-black text-[var(--color-medical-indigo)]">{filtered.length}</span>
          </div>
          <p className="text-[13px] font-bold text-[var(--text-secondary)]">
            {isAr ? "مصدر متطابق — انقر على البطاقة للفتح" : "sources matched — click any card to open"}
          </p>
        </div>
        {(search || selectedType !== "all" || selectedRegion !== "all" || selectedSpecialty !== "all" || openAccess) && (
          <button
            onClick={resetFilters}
            className="text-[11px] font-extrabold text-rose-500 hover:text-white hover:bg-rose-500 px-4 py-2 rounded-xl transition-colors border border-rose-500/20 uppercase tracking-widest"
          >
            {isAr ? "مسح الفلاتر" : "Reset Filters"}
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 medpulse-card glass level-1 border-[var(--border-subtle)] flex flex-col items-center justify-center space-y-5 rounded-[32px] relative z-10">
          <div className="w-20 h-20 bg-[var(--bg-2)] rounded-[24px] flex items-center justify-center shadow-inner transform -rotate-6">
            <Search className="w-10 h-10 opacity-30 text-[var(--color-medical-indigo)]" />
          </div>
          <div>
            <p className="font-extrabold text-xl text-[var(--text-primary)] mb-2">{isAr ? "لا توجد نتائج" : "No Sources Found"}</p>
            <p className="text-[13px] text-[var(--text-secondary)] font-medium">{isAr ? "جرب تغيير الفلاتر" : "Try adjusting your filters"}</p>
          </div>
          <button onClick={resetFilters} className="bg-[var(--color-medical-indigo)] text-white text-[13px] font-extrabold px-6 py-3 rounded-[16px] hover:scale-105 transition-transform uppercase tracking-widest">
            {isAr ? "إلغاء الفلاتر" : "Clear Filters"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 relative z-10 w-full">
            {visibleSources.map((source, i) => (
              <div
                key={`${source.name}-${i}`}
                style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                className="animate-in slide-in-from-bottom-4 fade-in fill-mode-both duration-500 h-full"
              >
                <SourceCard
                  source={source}
                  bookmarked={bookmarks.has(source.name)}
                  onToggleBookmark={toggleBookmark}
                  onOpenPreview={setPreviewSource}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex flex-col items-center gap-3 mt-8 relative z-10">
              <p className="text-[12px] text-[var(--text-tertiary)] font-medium">
                {isAr
                  ? `عرض ${visibleCount} من ${filtered.length} مصدر`
                  : `Showing ${visibleCount} of ${filtered.length} sources`}
              </p>
              <button
                onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, filtered.length))}
                className="px-8 py-3 rounded-2xl font-black text-sm border border-[var(--color-medical-indigo)]/30 text-[var(--color-medical-indigo)] hover:bg-[var(--color-medical-indigo)] hover:text-white transition-all uppercase tracking-widest shadow-sm hover:shadow-[0_8px_20px_-8px_rgba(99,102,241,0.4)]"
              >
                {isAr ? `تحميل المزيد (+${Math.min(PAGE_SIZE, filtered.length - visibleCount)})` : `Load More (+${Math.min(PAGE_SIZE, filtered.length - visibleCount)})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
