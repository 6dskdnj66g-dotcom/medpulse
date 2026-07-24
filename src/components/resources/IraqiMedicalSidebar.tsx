"use client";

/**
 * Iraqi Medical Resources Sidebar
 *
 * Renders four tabs of curated medical education resources:
 *   1. Colleges       — real Iraqi medical schools
 *   2. References     — clinical textbooks widely used in Iraqi curricula
 *   3. Guidelines     — Iraqi MoH + international clinical guideline bodies
 *   4. Community      — user-submitted resources (empty state until curated)
 *
 * When passed a stationId, the sidebar shows a "For this station" panel at the
 * top of the References and Guidelines tabs, listing only entries relevant to
 * that OSCE station (per STATION_REFERENCE_MAP).
 *
 * Layout: pure content. The caller decides whether to render it as a desktop
 * side panel or a mobile bottom-sheet drawer — see IraqiResourcesLauncher for
 * a ready-to-use launcher + responsive host.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen, GraduationCap, ScrollText, Users, Search, ExternalLink,
  MapPin, BookMarked, Sparkles, Info, Smartphone, Layers, FileText,
  Loader2, HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { fetchMaterials, type IraqiMaterial } from "@/lib/kb/iraqi-kb-client";
import { EmbeddedMaterialViewer } from "./EmbeddedMaterialViewer";
import {
  IRAQI_MEDICAL_COLLEGES,
  REFERENCE_BOOKS,
  GUIDELINE_SOURCES,
  MEDICAL_APPS,
  APP_CATEGORY_LABELS,
  APP_ACCESS_LABELS,
  getStationReferenceLinks,
  getReferenceById,
  getGuidelineById,
  type IraqiMedicalCollege,
  type MedicalReferenceBook,
  type ClinicalGuidelineSource,
  type MedicalApp,
  type CurriculumSystem,
} from "@/lib/data/iraqiMedicalResources";

type TabKey = "colleges" | "references" | "materials" | "guidelines" | "apps" | "community";

const SYSTEM_LABELS: Record<CurriculumSystem, { en: string; ar: string; color: string }> = {
  traditional: { en: "Traditional",  ar: "تقليدي",       color: "bg-slate-500/10 text-slate-600 border-slate-500/25" },
  integrated:  { en: "Integrated",   ar: "تكاملي (PBL)", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" },
  hybrid:      { en: "Hybrid",       ar: "هجين",         color: "bg-amber-500/10 text-amber-600 border-amber-500/25" },
  unspecified: { en: "System n/a",   ar: "غير محدد",     color: "bg-[var(--bg-3)] text-[var(--text-tertiary)] border-[var(--border-subtle)]" },
};

interface IraqiMedicalSidebarProps {
  stationId?: string;
  initialTab?: TabKey;
  isAr?: boolean;
}

const REGION_LABELS: Record<IraqiMedicalCollege["region"], { en: string; ar: string; color: string }> = {
  baghdad:   { en: "Baghdad",    ar: "بغداد",       color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/25" },
  central:   { en: "Central",    ar: "الوسط",        color: "bg-violet-500/10 text-violet-600 border-violet-500/25" },
  north:     { en: "North",      ar: "الشمال",       color: "bg-teal-500/10 text-teal-600 border-teal-500/25" },
  south:     { en: "South",      ar: "الجنوب",       color: "bg-amber-500/10 text-amber-600 border-amber-500/25" },
  kurdistan: { en: "Kurdistan",  ar: "كردستان",      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25" },
};

const CATEGORY_LABELS: Record<MedicalReferenceBook["category"], string> = {
  "internal-medicine": "Internal Medicine",
  "surgery":           "Surgery",
  "clinical-skills":   "Clinical Skills",
  "pharmacology":      "Pharmacology",
  "pediatrics":        "Paediatrics",
  "obgyn":             "OB/GYN",
  "psychiatry":        "Psychiatry",
  "emergency":         "Emergency",
  "anatomy":           "Anatomy",
  "physiology":        "Physiology",
  "pathology":         "Pathology",
  "biochemistry":      "Biochemistry",
  "microbiology":      "Microbiology",
  "public-health":     "Public Health",
  "board-review":      "Board Review",
};

const REGION_ORDER: IraqiMedicalCollege["region"][] = ["baghdad", "central", "north", "south", "kurdistan"];

function TabButton({
  active, icon: Icon, label, count, onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
        active
          ? "text-[var(--color-medical-indigo)] border-[var(--color-medical-indigo)] bg-[var(--color-medical-indigo)]/5"
          : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-primary)]"
      }`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden={true} />
      <span className="truncate">{label}</span>
      {typeof count === "number" && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? "bg-[var(--color-medical-indigo)]/15" : "bg-[var(--bg-3)]"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function CollegeCard({ college, isAr }: { college: IraqiMedicalCollege; isAr: boolean }) {
  const region = REGION_LABELS[college.region];
  const system = college.system ? SYSTEM_LABELS[college.system] : undefined;
  const description = isAr ? (college.descriptionAr ?? college.description) : college.description;

  return (
    <a
      href={college.website ?? undefined}
      target={college.website ? "_blank" : undefined}
      rel={college.website ? "noopener noreferrer" : undefined}
      className={`block group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4 transition-all hover:border-[var(--color-medical-indigo)]/30 hover:shadow-md ${
        college.website ? "cursor-pointer" : "cursor-default"
      }`}
      aria-label={`${isAr ? college.nameAr : college.name}${college.website ? " — opens official website in a new tab" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">
            {isAr ? college.nameAr : college.name}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {isAr ? college.cityAr : college.city}
            {college.established ? ` · Est. ${college.established}` : ""}
          </p>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border flex-shrink-0 ${region.color}`}>
          {isAr ? region.ar : region.en}
        </span>
      </div>

      {system && (
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3 h-3 text-[var(--text-tertiary)]" aria-hidden="true" />
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${system.color}`}>
            {isAr ? system.ar : system.en}
          </span>
        </div>
      )}

      {description && (
        <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
          {description}
        </p>
      )}

      {college.website && (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-[var(--color-medical-indigo)]/80 group-hover:text-[var(--color-medical-indigo)] transition-colors">
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          <span className="truncate">{isAr ? "الموقع الرسمي" : "Official site"}</span>
        </div>
      )}
    </a>
  );
}

function AppCard({ app, isAr }: { app: MedicalApp; isAr: boolean }) {
  const accessColor: Record<MedicalApp["access"], string> = {
    free:          "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
    freemium:      "bg-teal-500/10 text-teal-600 border-teal-500/25",
    subscription:  "bg-amber-500/10 text-amber-600 border-amber-500/25",
    institutional: "bg-indigo-500/10 text-indigo-600 border-indigo-500/25",
  };
  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4 transition-all hover:border-[var(--color-medical-indigo)]/30 hover:shadow-md"
      aria-label={`${app.name} — opens official site in a new tab`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">{app.name}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1">{app.publisher}</p>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-[var(--bg-3)] text-[var(--text-secondary)] border-[var(--border-subtle)] flex-shrink-0">
          {APP_CATEGORY_LABELS[app.category]}
        </span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-2">
        {app.description}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${accessColor[app.access]}`}>
          {APP_ACCESS_LABELS[app.access]}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
          {app.platforms.join(" · ").toUpperCase()}
        </span>
        <span className="text-[10px] font-bold text-[var(--color-medical-indigo)] flex items-center gap-1 ml-auto">
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
          {isAr ? "افتح" : "Open"}
        </span>
      </div>
    </a>
  );
}

function ReferenceCard({
  book, highlighted, isAr,
}: {
  book: MedicalReferenceBook;
  highlighted?: boolean;
  isAr?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        highlighted
          ? "border-[var(--color-medical-indigo)]/40 bg-[var(--color-medical-indigo)]/5 shadow-sm"
          : "border-[var(--border-subtle)] bg-[var(--bg-2)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">{book.title}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1">
            {book.authors} · {book.publisher} · {book.editionNote}
          </p>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-[var(--bg-3)] text-[var(--text-secondary)] border-[var(--border-subtle)] flex-shrink-0">
          {CATEGORY_LABELS[book.category]}
        </span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-2">
        {book.description}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {book.usedForOsce && (
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
            <Sparkles className="w-2.5 h-2.5 inline -mt-0.5 mr-1" aria-hidden="true" />
            OSCE-relevant
          </span>
        )}
        {book.officialWebsite && (
          <a
            href={book.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-[var(--color-medical-indigo)] hover:opacity-80 flex items-center gap-1"
            aria-label={`Open publisher page for ${book.title} in a new tab`}
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" /> Publisher
          </a>
        )}
      </div>
      {isAr && (
        <p className="sr-only">{book.title}</p>
      )}
    </div>
  );
}

function GuidelineCard({ guideline, highlighted, isAr }: { guideline: ClinicalGuidelineSource; highlighted?: boolean; isAr?: boolean }) {
  return (
    <a
      href={guideline.url ?? undefined}
      target={guideline.url ? "_blank" : undefined}
      rel={guideline.url ? "noopener noreferrer" : undefined}
      className={`block rounded-2xl border p-4 transition-all ${
        highlighted
          ? "border-[var(--color-medical-indigo)]/40 bg-[var(--color-medical-indigo)]/5 shadow-sm"
          : "border-[var(--border-subtle)] bg-[var(--bg-2)] hover:border-[var(--color-medical-indigo)]/30"
      } ${guideline.url ? "cursor-pointer" : "cursor-default"}`}
      aria-label={`${guideline.name}${guideline.url ? " — opens in a new tab" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">
          {isAr && guideline.nameAr ? guideline.nameAr : guideline.name}
        </p>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border bg-[var(--bg-3)] text-[var(--text-secondary)] border-[var(--border-subtle)] flex-shrink-0">
          {guideline.region.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
        {guideline.focus}
      </p>
      {guideline.url && (
        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-[var(--color-medical-indigo)]/80">
          <ExternalLink className="w-3 h-3" aria-hidden="true" /> Open guideline
        </div>
      )}
    </a>
  );
}

function CommunityEmptyState({ isAr }: { isAr: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-2)] p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center mx-auto mb-4 border border-[var(--color-medical-indigo)]/20">
        <Users className="w-6 h-6 text-[var(--color-medical-indigo)]" aria-hidden="true" />
      </div>
      <p className="text-[13px] font-extrabold text-[var(--text-primary)] mb-2">
        {isAr ? "قنوات المجتمع قيد المراجعة" : "Community channels under review"}
      </p>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-sm mx-auto mb-4">
        {isAr
          ? "لم يتم بعد اعتماد قنوات تليغرام أو أرشيفات محلية على منصة MedPulse. نحن نفضل عدم إدراج مصادر غير مُوثّقة قد تعرّض الطلبة لمعلومات غير موثوقة."
          : "We haven't yet endorsed any Telegram channels or local drive archives on MedPulse. Recommending community resources for medical education requires human curation and copyright review — we won't fabricate a list."}
      </p>
      <a
        href="mailto:hasanain.medpulse@gmail.com?subject=MedPulse%20—%20Submit%20community%20resource"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] hover:bg-[var(--color-medical-indigo)]/15 transition-colors text-[10px] font-black uppercase tracking-widest"
      >
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        {isAr ? "اقترح مصدرًا" : "Suggest a resource"}
      </a>
    </div>
  );
}

export function IraqiMedicalSidebar({ stationId, initialTab = "colleges", isAr = false }: IraqiMedicalSidebarProps) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [refCategory, setRefCategory] = useState<MedicalReferenceBook["category"] | "all">("all");
  const [materials, setMaterials] = useState<IraqiMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<IraqiMaterial | null>(null);

  const loadMaterials = useCallback(async () => {
    setMaterialsLoading(true);
    setMaterialsError(null);
    const { data, error } = await fetchMaterials();
    setMaterials(data);
    setMaterialsError(error);
    setMaterialsLoading(false);
  }, []);

  // Legitimate lazy fetch — trigger a single load the first time the tab is opened.
  useEffect(() => {
    if (tab === "materials" && materials.length === 0 && !materialsLoading && !materialsError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadMaterials();
    }
  }, [tab, materials.length, materialsLoading, materialsError, loadMaterials]);

  const stationLinks = stationId ? getStationReferenceLinks(stationId) : undefined;

  const collegesByRegion = useMemo(() => {
    const q = collegeSearch.trim().toLowerCase();
    const filtered = IRAQI_MEDICAL_COLLEGES.filter((c) => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(collegeSearch) ||
        c.city.toLowerCase().includes(q) ||
        c.cityAr.includes(collegeSearch)
      );
    });
    return REGION_ORDER.map((region) => ({
      region,
      items: filtered.filter((c) => c.region === region),
    })).filter((g) => g.items.length > 0);
  }, [collegeSearch]);

  const stationReferences = useMemo(() => {
    if (!stationLinks) return [];
    return stationLinks.suggestedReferenceIds
      .map(getReferenceById)
      .filter((b): b is MedicalReferenceBook => Boolean(b));
  }, [stationLinks]);

  const stationGuidelines = useMemo(() => {
    if (!stationLinks) return [];
    return stationLinks.suggestedGuidelineIds
      .map(getGuidelineById)
      .filter((g): g is ClinicalGuidelineSource => Boolean(g));
  }, [stationLinks]);

  const filteredReferences = useMemo(() => {
    if (refCategory === "all") return REFERENCE_BOOKS;
    return REFERENCE_BOOKS.filter((b) => b.category === refCategory);
  }, [refCategory]);

  const categoryOptions: (MedicalReferenceBook["category"] | "all")[] = useMemo(() => {
    const cats = new Set<MedicalReferenceBook["category"]>();
    for (const book of REFERENCE_BOOKS) cats.add(book.category);
    return ["all", ...Array.from(cats)];
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-[var(--border-subtle)]" role="tablist" aria-label="Iraqi medical resources">
        <TabButton
          active={tab === "colleges"}
          icon={GraduationCap}
          label={isAr ? "الكليات" : "Colleges"}
          count={IRAQI_MEDICAL_COLLEGES.length}
          onClick={() => setTab("colleges")}
        />
        <TabButton
          active={tab === "references"}
          icon={BookOpen}
          label={isAr ? "المراجع" : "References"}
          count={REFERENCE_BOOKS.length}
          onClick={() => setTab("references")}
        />
        <TabButton
          active={tab === "materials"}
          icon={FileText}
          label={isAr ? "الملفات" : "Materials"}
          onClick={() => setTab("materials")}
        />
        <TabButton
          active={tab === "guidelines"}
          icon={ScrollText}
          label={isAr ? "الإرشادات" : "Guidelines"}
          count={GUIDELINE_SOURCES.length}
          onClick={() => setTab("guidelines")}
        />
        <TabButton
          active={tab === "apps"}
          icon={Smartphone}
          label={isAr ? "التطبيقات" : "Apps"}
          count={MEDICAL_APPS.length}
          onClick={() => setTab("apps")}
        />
        <TabButton
          active={tab === "community"}
          icon={Users}
          label={isAr ? "المجتمع" : "Community"}
          onClick={() => setTab("community")}
        />
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
        {tab === "colleges" && (
          <div role="tabpanel" aria-label="Iraqi medical colleges" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              <input
                type="search"
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                placeholder={isAr ? "ابحث عن كلية أو مدينة" : "Search college or city"}
                aria-label={isAr ? "بحث عن كلية أو مدينة" : "Search college or city"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-indigo)]/25"
              />
            </div>

            {collegesByRegion.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] font-medium text-center py-8">
                {isAr ? "لا توجد نتائج مطابقة" : "No matches"}
              </p>
            ) : (
              collegesByRegion.map((group) => (
                <div key={group.region} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] px-1">
                    {isAr ? REGION_LABELS[group.region].ar : REGION_LABELS[group.region].en} · {group.items.length}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.items.map((c) => (
                      <CollegeCard key={c.id} college={c} isAr={isAr} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "references" && (
          <div role="tabpanel" aria-label="Reference textbooks" className="space-y-4">
            {stationReferences.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] px-1 flex items-center gap-1.5">
                  <BookMarked className="w-3 h-3" aria-hidden="true" />
                  {isAr ? "لهذه المحطة" : "For this station"}
                  {stationLinks?.clinicalTopic && (
                    <span className="text-[var(--text-tertiary)] font-medium normal-case tracking-normal">
                      · {stationLinks.clinicalTopic}
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {stationReferences.map((book) => (
                    <ReferenceCard key={`station-${book.id}`} book={book} highlighted isAr={isAr} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setRefCategory(c)}
                  aria-pressed={refCategory === c}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    refCategory === c
                      ? "bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] border-[var(--color-medical-indigo)]/30"
                      : "bg-[var(--bg-2)] text-[var(--text-tertiary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {c === "all" ? (isAr ? "الكل" : "All") : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredReferences.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] font-medium text-center py-6">
                  {isAr ? "لا توجد كتب في هذا التصنيف" : "No books in this category"}
                </p>
              ) : (
                filteredReferences.map((book) => (
                  <ReferenceCard key={book.id} book={book} isAr={isAr} />
                ))
              )}
            </div>
          </div>
        )}

        {tab === "materials" && (
          <div role="tabpanel" aria-label="Iraqi materials library" className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-medical-indigo)]/20 bg-[var(--color-medical-indigo)]/5 p-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[var(--color-medical-indigo)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                {isAr
                  ? "ملفات محلية مرفوعة من قِبَل المشرفين — محاضرات، ملازم، وامتحانات سابقة. تُعرض داخل التطبيق دون الحاجة لمغادرته."
                  : "Locally-hosted materials curated by admins — lecture notes, handouts, and past papers. They open in-app without leaving MedPulse."}
              </p>
            </div>

            {/* Quick link to past-paper MCQ bank */}
            <Link
              href="/local-resources/mcqs"
              className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--color-medical-indigo)]/25 bg-[var(--color-medical-indigo)]/5 hover:bg-[var(--color-medical-indigo)]/10 p-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-medical-indigo)]/15 border border-[var(--color-medical-indigo)]/25 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[12px] font-extrabold text-[var(--text-primary)]">
                    {isAr ? "بنك أسئلة الامتحانات السابقة" : "Past-paper MCQ bank"}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-medium">
                    {isAr ? "أسئلة تفاعلية مع الإجابات النموذجية" : "Interactive questions with model answers"}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
            </Link>

            {materialsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-medical-indigo)]" aria-hidden="true" />
              </div>
            ) : materialsError ? (
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
                <p className="text-[12px] font-extrabold text-rose-600 dark:text-rose-400 mb-1">
                  {isAr ? "تعذّر تحميل الملفات" : "Couldn't load materials"}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">{materialsError}</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-2)] p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center mx-auto mb-3 border border-[var(--color-medical-indigo)]/20">
                  <FileText className="w-5 h-5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                </div>
                <p className="text-[12px] font-extrabold text-[var(--text-primary)] mb-1.5">
                  {isAr ? "لم تُرفع ملفات بعد" : "No materials uploaded yet"}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-sm mx-auto">
                  {isAr
                    ? "يمكن للمشرف إضافة الملفات من لوحة الإدارة عبر /admin/knowledge-base."
                    : "Admins can add materials from /admin/knowledge-base. They will appear here as soon as they're published."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((m) => {
                  const title = isAr && m.title_ar ? m.title_ar : m.title;
                  const desc = isAr && m.description_ar ? m.description_ar : m.description;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setViewingMaterial(m)}
                      className="w-full text-left rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-4 hover:border-[var(--color-medical-indigo)]/30 transition-all"
                      aria-label={`${isAr ? "افتح" : "Open"} ${title}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-extrabold text-[var(--text-primary)] leading-tight">{title}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1">
                            {m.type.toUpperCase()}
                            {m.category ? ` · ${m.category}` : ""}
                            {m.year ? ` · ${m.year}` : ""}
                            {m.college_id ? ` · ${m.college_id}` : ""}
                          </p>
                          {desc && (
                            <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mt-1.5 line-clamp-2">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <EmbeddedMaterialViewer
              material={viewingMaterial}
              isAr={isAr}
              onClose={() => setViewingMaterial(null)}
            />
          </div>
        )}

        {tab === "guidelines" && (
          <div role="tabpanel" aria-label="Clinical guideline sources" className="space-y-4">
            {stationGuidelines.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-medical-indigo)] px-1 flex items-center gap-1.5">
                  <BookMarked className="w-3 h-3" aria-hidden="true" />
                  {isAr ? "لهذه المحطة" : "For this station"}
                </p>
                <div className="space-y-2">
                  {stationGuidelines.map((g) => (
                    <GuidelineCard key={`station-${g.id}`} guideline={g} highlighted isAr={isAr} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {GUIDELINE_SOURCES.map((g) => (
                <GuidelineCard key={g.id} guideline={g} isAr={isAr} />
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-2)]/50 p-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[10px] text-[var(--text-tertiary)] font-medium leading-relaxed">
                {isAr
                  ? "الروابط الرسمية أعلاه هي المرجع الأول. راجع أحدث النسخ المنشورة قبل تطبيق أي بروتوكول سريري."
                  : "Always check the official body's own site for the current version — guidelines are updated frequently."}
              </p>
            </div>
          </div>
        )}

        {tab === "apps" && (
          <div role="tabpanel" aria-label="Medical applications and digital platforms" className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] px-1">
                {isAr ? "التطبيقات العالمية" : "Global platforms"}
              </p>
              <div className="space-y-2">
                {MEDICAL_APPS.map((app) => (
                  <AppCard key={app.id} app={app} isAr={isAr} />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] px-1">
                {isAr ? "التطبيقات العراقية الرسمية" : "Iraqi official platforms"}
              </p>
              <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-2)] p-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center mx-auto mb-3 border border-[var(--color-medical-indigo)]/20">
                  <Smartphone className="w-5 h-5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                </div>
                <p className="text-[12px] font-extrabold text-[var(--text-primary)] mb-1.5">
                  {isAr ? "التطبيقات المحلية قيد التوثيق" : "Iraqi apps pending verification"}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-sm mx-auto">
                  {isAr
                    ? "لم نُوثّق بعد تطبيقات رسمية من وزارة الصحة العراقية أو من الجمعيات الطبية العراقية. سنُضيفها فور توفّر روابط رسمية موثّقة."
                    : "We haven't yet verified an official mobile app from the Iraqi Ministry of Health or the Iraqi medical societies. Entries will be added only once a verified official URL is available."}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "community" && (
          <div role="tabpanel" aria-label="Community resources">
            <CommunityEmptyState isAr={isAr} />
          </div>
        )}
      </div>
    </div>
  );
}
