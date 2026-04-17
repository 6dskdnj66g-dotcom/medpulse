"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, Search, Filter, ExternalLink, Bookmark, BookmarkCheck,
  Globe, Star, Database, ScrollText, BookMarked, ChevronDown,
  Newspaper, Award
} from "lucide-react";
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

const ALL_SPECIALTIES = Array.from(new Set(ALL_MEDICAL_SOURCES.map(s => s.specialty).filter(Boolean))).sort();

// ── Source Card ──────────────────────────────────────────────────────────────
function SourceCard({ source, bookmarked, onToggleBookmark, lang }: {
  source: MedicalSource;
  bookmarked: boolean;
  onToggleBookmark: (name: string) => void;
  lang: "en" | "ar";
}) {
  const typeConfig = TYPE_CONFIG[source.type] || TYPE_CONFIG.journal;
  const Icon = typeConfig.icon;
  const typeLabel = lang === "ar" ? typeConfig.labelAr : typeConfig.labelEn;
  const colors: Record<string, string> = {
    indigo:  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    teal:    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };
  const colorClass = colors[typeConfig.color] || colors.indigo;
  const regionInfo = REGION_CONFIG[source.region || "global"];
  const regionLabel = lang === "ar" ? regionInfo.labelAr : regionInfo.labelEn;

  return (
    <div className="premium-card p-5 hover:scale-[1.01] transition-all group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{source.name}</h3>
              {source.abbreviation && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border mt-1 inline-block ${colorClass}`}>
                  {source.abbreviation}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Bookmark */}
              <button
                onClick={() => onToggleBookmark(source.name)}
                aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  bookmarked ? "bg-amber-500/10 text-amber-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500"
                }`}
              >
                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              {/* Open link — always rendered when URL exists */}
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${source.name}`}
                  className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Type badge */}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-block mb-2 ${colorClass}`}>
            {typeLabel}
          </span>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {regionInfo.flag} {regionLabel}
            </span>
            {source.specialty && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {source.specialty}
              </span>
            )}
            {source.impactFactor && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" />
                IF {source.impactFactor}
              </span>
            )}
            {source.openAccess && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                🔓 {lang === "ar" ? "مفتوح الوصول" : "Open Access"}
              </span>
            )}
            {source.language === "arabic" && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                {lang === "ar" ? "عربي" : "Arabic"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Library Page ────────────────────────────────────────────────────────
export default function SourceLibraryPage() {
  const { user } = useSupabaseAuth();
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [openAccess, setOpenAccess] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("medpulse_source_bookmarks");
      if (stored) return new Set(JSON.parse(stored) as string[]);
    }
    return new Set<string>();
  });
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  function toggleBookmark(name: string) {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      localStorage.setItem("medpulse_source_bookmarks", JSON.stringify([...next]));
      return next;
    });
  }

  // Filter sources
  const filtered = useMemo(() => {
    return ALL_MEDICAL_SOURCES.filter(s => {
      if (showBookmarked && !bookmarks.has(s.name)) return false;
      if (selectedType !== "all" && s.type !== selectedType) return false;
      if (selectedRegion !== "all" && s.region !== selectedRegion) return false;
      if (selectedSpecialty !== "all" && s.specialty !== selectedSpecialty) return false;
      if (openAccess && !s.openAccess) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.abbreviation?.toLowerCase().includes(q) ||
          s.specialty?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedType, selectedRegion, selectedSpecialty, openAccess, showBookmarked, bookmarks]);

  // Stats
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_MEDICAL_SOURCES.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 w-full page-transition" dir={dir}>

      {/* ── Header ── */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {isAr ? "مكتبة المصادر الطبية" : "Medical Source Library"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isAr
                ? `${ALL_MEDICAL_SOURCES.length}+ مصدر طبي عالمي وعربي موثق ومُصنّف`
                : `${ALL_MEDICAL_SOURCES.length}+ verified global & Arab medical sources`}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const label = isAr ? config.labelAr : config.labelEn;
            return (
              <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-500">
                <Icon className="w-3 h-3" />
                {label}: <span className="text-slate-900 dark:text-white">{typeCounts[type] || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl py-4 mb-6 -mx-2 px-2">
        <div className="flex gap-3 items-center mb-3">
          <div className="relative flex-1">
            <Search className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? "ابحث عن مجلة، قاعدة بيانات، كتاب..." : "Search journals, databases, textbooks..."}
              className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl ${dir === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-black transition-all ${
              showFilters ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            <Filter className="w-4 h-4" />
            {isAr ? "فلاتر" : "Filters"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-black transition-all ${
              showBookmarked ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            {isAr ? `المفضلة (${bookmarks.size})` : `Saved (${bookmarks.size})`}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Type */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                {isAr ? "نوع المصدر" : "Source Type"}
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ? "الكل" : "All"}</option>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{isAr ? v.labelAr : v.labelEn}</option>
                ))}
              </select>
            </div>
            {/* Region */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                {isAr ? "المنطقة" : "Region"}
              </label>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ? "الكل" : "All"}</option>
                {Object.entries(REGION_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.flag} {isAr ? v.labelAr : v.labelEn}</option>
                ))}
              </select>
            </div>
            {/* Specialty */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                {isAr ? "التخصص" : "Specialty"}
              </label>
              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ? "الكل" : "All"}</option>
                {ALL_SPECIALTIES.map(s => <option key={s} value={s!}>{s}</option>)}
              </select>
            </div>
            {/* Open Access */}
            <div className="flex items-end">
              <button
                onClick={() => setOpenAccess(!openAccess)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${
                  openAccess ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
              >
                🔓 {isAr ? "Open Access فقط" : "Open Access Only"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Type quick-filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { k: "all", labelAr: "الكل", labelEn: "All", icon: null },
          ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ k, labelAr: v.labelAr, labelEn: v.labelEn, icon: v.icon }))
        ].map(({ k, labelAr, labelEn, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setSelectedType(k)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              selectedType === k
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {isAr ? labelAr : labelEn}
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-slate-500">
          {isAr
            ? <>{isAr ? "عرض " : "Showing "}<span className="text-slate-900 dark:text-white font-black">{filtered.length}</span>{` من ${ALL_MEDICAL_SOURCES.length} مصدر`}</>
            : <>Showing <span className="text-slate-900 dark:text-white font-black">{filtered.length}</span>{` of ${ALL_MEDICAL_SOURCES.length} sources`}</>
          }
        </p>
        {(search || selectedType !== "all" || selectedRegion !== "all" || openAccess) && (
          <button
            onClick={() => { setSearch(""); setSelectedType("all"); setSelectedRegion("all"); setSelectedSpecialty("all"); setOpenAccess(false); }}
            className="text-xs font-black text-rose-500 hover:underline"
          >
            {isAr ? "مسح الفلاتر" : "Clear Filters"}
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">{isAr ? "لا توجد نتائج" : "No results found"}</p>
          <p className="text-sm">{isAr ? "جرب كلمات بحث مختلفة" : "Try different search terms"}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((source, i) => (
            <SourceCard
              key={`${source.name}-${i}`}
              source={source}
              bookmarked={bookmarks.has(source.name)}
              onToggleBookmark={toggleBookmark}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
