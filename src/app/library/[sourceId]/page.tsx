"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen, ChevronRight, Loader2, ArrowLeft,
  AlertTriangle,
  ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { getTextbookBySlug, type TextbookChapter } from "@/features/library/services/textbookRegistry";
import { useLanguage } from "@/core/i18n/LanguageContext";

interface ChapterContent {
  definition: string;
  pathophysiology: string;
  clinical_features: {
    symptoms: string[];
    signs: string[];
    special_presentations: string;
  };
  investigations: {
    bedside?: string[];
    blood_tests?: string[];
    imaging?: string[];
    special_tests?: string[];
    diagnostic_criteria?: string;
  };
  differential_diagnosis: { condition: string; distinguishing_features: string }[];
  management: {
    immediate?: string;
    non_pharmacological: string;
    pharmacological: {
      drug: string;
      dose: string;
      mechanism: string;
      indication: string;
      contraindications: string;
      side_effects: string;
      monitoring: string;
    }[];
    surgical?: string;
    guidelines_summary: string;
  };
  complications: { complication: string; frequency: string; management: string }[];
  prognosis: string;
  prevention: string;
  clinical_pearls: string[];
  usmle_high_yield: {
    step1_relevance: string;
    step2_relevance: string;
    classic_vignette: string;
    answer_approach: string;
  };
  references: { citation: string; url?: string; evidence_level: string }[];
}

const SECTION_ICONS: Record<string, string> = {
  definition: "📖",
  pathophysiology: "🔬",
  clinical_features: "🩺",
  investigations: "🧪",
  differential_diagnosis: "🔀",
  management: "💊",
  complications: "⚠️",
  prognosis: "📊",
  prevention: "🛡️",
  clinical_pearls: "💡",
  usmle_high_yield: "🎯",
  references: "📚",
};

function SectionCard({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--bg-2)", borderColor: "var(--border-subtle)" }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-start"
        style={{ borderBottom: open ? "1px solid var(--border-subtle)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
        )}
      </button>
      {open && (
        <div className="p-5" style={{ color: "var(--text-secondary)" }}>
          {children}
        </div>
      )}
    </section>
  );
}

export default function TextbookPage() {
  const params = useParams();
  const router = useRouter();
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  const sourceId = typeof params.sourceId === "string" ? params.sourceId : "";
  const book = getTextbookBySlug(sourceId);

  const [selectedChapter, setSelectedChapter] = useState<TextbookChapter | null>(null);
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentCache, setContentCache] = useState<Record<string, ChapterContent>>({});

  // Auto-select first chapter
  useEffect(() => {
    if (book && book.chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(book.chapters[0]);
    }
  }, [book, selectedChapter]);

  const generateContent = async (chapter: TextbookChapter) => {
    if (!book) return;
    if (contentCache[chapter.id]) {
      setContent(contentCache[chapter.id]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setContent(null);
    try {
      const res = await fetch("/api/library/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: book.title,
          chapterTitle: chapter.title,
          specialty: chapter.specialty,
          edition: book.edition,
          usmleRelevance: chapter.usmleRelevance,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate content");
      const data = await res.json() as { content: ChapterContent; success: boolean };
      setContent(data.content);
      setContentCache(prev => ({ ...prev, [chapter.id]: data.content }));
    } catch {
      setError("Failed to generate chapter content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChapter = (chapter: TextbookChapter) => {
    setSelectedChapter(chapter);
    generateContent(chapter);
    setSidebarOpen(false);
  };

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8" dir={dir}>
        <BookOpen className="w-16 h-16 mb-4" style={{ color: "var(--text-tertiary)" }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {isAr ? "الكتاب غير متاح" : "Textbook Not Found"}
        </h2>
        <p className="mb-6 text-center" style={{ color: "var(--text-secondary)" }}>
          {isAr ? "هذا الكتاب غير متاح حالياً في المكتبة الرقمية." : "This textbook is not yet available in the digital library."}
        </p>
        <button
          onClick={() => router.push("/library")}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {isAr ? "العودة للمكتبة" : "Back to Library"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden" dir={dir} style={{ background: "var(--bg-0)" }}>

      {/* ── SIDEBAR — Chapter List ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 h-full w-[260px] z-50 overflow-y-auto transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0 ${
          dir === "rtl"
            ? sidebarOpen ? "right-0 translate-x-0" : "right-0 translate-x-full"
            : sidebarOpen ? "left-0 translate-x-0" : "left-0 -translate-x-full"
        }`}
        style={{
          background: "var(--bg-2)",
          borderRight: dir === "ltr" ? "1px solid var(--border-default)" : "none",
          borderLeft: dir === "rtl" ? "1px solid var(--border-default)" : "none",
        }}
      >
        {/* Book header */}
        <div className="p-4 sticky top-0 z-10" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => router.push("/library")}
            className="flex items-center gap-2 text-xs font-bold mb-3 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ArrowLeft className="w-3 h-3" />
            {isAr ? "المكتبة" : "Library"}
          </button>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold mb-2 bg-gradient-to-br ${book.color}`}>
            {book.title[0]}
          </div>
          <h2 className="text-xs font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
            {book.title}
          </h2>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{book.edition}</p>
        </div>

        {/* Chapter list */}
        <div className="p-2 space-y-0.5">
          {book.chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => handleSelectChapter(chapter)}
              className={`w-full text-start flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                selectedChapter?.id === chapter.id
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                  : "hover:bg-[var(--bg-3)]"
              }`}
              style={selectedChapter?.id !== chapter.id ? { color: "var(--text-secondary)" } : undefined}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                style={{
                  background: selectedChapter?.id === chapter.id ? "rgba(99,102,241,0.2)" : "var(--bg-3)",
                  color: selectedChapter?.id === chapter.id ? "rgb(99,102,241)" : "var(--text-tertiary)",
                }}
              >
                {chapter.number}
              </span>
              <span className="leading-tight">{chapter.title}</span>
              {contentCache[chapter.id] && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 ms-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0">

        {/* Mobile chapter selector */}
        <div className="md:hidden sticky top-0 z-30 px-4 py-3" style={{ background: "var(--bg-0)", borderBottom: "1px solid var(--border-subtle)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
          >
            <span>{selectedChapter ? `Ch ${selectedChapter.number}: ${selectedChapter.title}` : isAr ? "اختر فصلاً" : "Select Chapter"}</span>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>

        {/* Content area */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6">

          {/* Book hero (shown when no chapter selected) */}
          {!selectedChapter && (
            <div
              className={`rounded-3xl p-8 bg-gradient-to-br ${book.color} text-white`}
            >
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{book.title}</h1>
              <p className="text-white/80 text-sm mb-1">{book.edition}</p>
              <p className="text-white/70 text-xs mb-4">{book.authors}</p>
              <p className="text-white/90 text-sm leading-relaxed mb-6">{book.description}</p>
              <div className="flex items-center gap-4 text-sm font-semibold text-white/80">
                <span>📚 {book.chapters.length} {isAr ? "فصل" : "chapters"}</span>
                <span>🏆 {book.specialty}</span>
                <span>✅ {isAr ? "محتوى 2026" : "2026 Edition"}</span>
              </div>
            </div>
          )}

          {/* Chapter header */}
          {selectedChapter && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold mb-3" style={{ color: "var(--text-tertiary)" }}>
                <BookOpen className="w-3 h-3" />
                <span>{book.title}</span>
                <ChevronRight className="w-3 h-3" />
                <span>Chapter {selectedChapter.number}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                {selectedChapter.title}
              </h1>
              {isAr && (
                <p className="text-lg font-bold mb-3" style={{ color: "var(--text-secondary)" }}>
                  {selectedChapter.titleAr}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(99,102,241,0.1)", color: "var(--color-medical-indigo)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {selectedChapter.specialty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#D97706", border: "1px solid rgba(245,158,11,0.2)" }}>
                  🎯 {selectedChapter.usmleRelevance}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--bg-3)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                  {selectedChapter.difficulty}
                </span>
              </div>
            </div>
          )}

          {/* Generate button (first time) */}
          {selectedChapter && !content && !isLoading && !error && (
            <button
              onClick={() => generateContent(selectedChapter)}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold"
            >
              <BookOpen className="w-5 h-5" />
              {isAr ? "توليد المحتوى الطبي الكامل" : "Generate Complete Medical Content"}
            </button>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: "var(--color-medical-indigo)" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>
                {isAr ? "يتم توليد المحتوى الطبي الكامل..." : "Generating comprehensive medical content..."}
              </p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {isAr ? "قد يستغرق ذلك 15-30 ثانية" : "This may take 15-30 seconds"}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-5 rounded-2xl flex items-center gap-3" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}>
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-red-600">{error}</p>
                <button onClick={() => selectedChapter && generateContent(selectedChapter)} className="text-xs font-bold text-red-500 hover:underline mt-1">
                  {isAr ? "إعادة المحاولة" : "Try Again"}
                </button>
              </div>
            </div>
          )}

          {/* Content sections */}
          {content && (
            <div className="space-y-4">

              <SectionCard title={isAr ? "التعريف والوبائيات" : "Definition & Epidemiology"} icon={SECTION_ICONS.definition}>
                <p className="text-sm leading-relaxed">{content.definition}</p>
              </SectionCard>

              <SectionCard title={isAr ? "الفيزيولوجيا المرضية" : "Pathophysiology"} icon={SECTION_ICONS.pathophysiology}>
                <p className="text-sm leading-relaxed">{content.pathophysiology}</p>
              </SectionCard>

              <SectionCard title={isAr ? "الصورة السريرية" : "Clinical Features"} icon={SECTION_ICONS.clinical_features}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-xl" style={{ background: "var(--bg-3)" }}>
                    <h3 className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
                      {isAr ? "الأعراض (Symptoms)" : "Symptoms"}
                    </h3>
                    <ul className="space-y-1.5">
                      {content.clinical_features.symptoms.map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "var(--bg-3)" }}>
                    <h3 className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
                      {isAr ? "العلامات (Signs)" : "Signs"}
                    </h3>
                    <ul className="space-y-1.5">
                      {content.clinical_features.signs.map((s, i) => (
                        <li key={i} className="text-xs flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {content.clinical_features.special_presentations && (
                  <div className="p-4 rounded-xl text-xs leading-relaxed" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
                    <span className="font-bold" style={{ color: "var(--color-vital-cyan)" }}>
                      {isAr ? "🔸 العروض الخاصة: " : "🔸 Special Presentations: "}
                    </span>
                    {content.clinical_features.special_presentations}
                  </div>
                )}
              </SectionCard>

              <SectionCard title={isAr ? "الفحوصات والتشخيص" : "Investigations"} icon={SECTION_ICONS.investigations}>
                <div className="space-y-3">
                  {Object.entries(content.investigations).map(([key, value]) => {
                    if (!value) return null;
                    const labels: Record<string, string> = {
                      bedside: isAr ? "فحوصات جانب السرير" : "Bedside",
                      blood_tests: isAr ? "تحاليل الدم" : "Blood Tests",
                      imaging: isAr ? "التصوير" : "Imaging",
                      special_tests: isAr ? "فحوصات خاصة" : "Special Tests",
                      diagnostic_criteria: isAr ? "معايير التشخيص" : "Diagnostic Criteria",
                    };
                    return (
                      <div key={key} className="p-3 rounded-xl" style={{ background: "var(--bg-3)" }}>
                        <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
                          {labels[key] || key}
                        </h3>
                        {Array.isArray(value) ? (
                          <ul className="space-y-1">
                            {(value as string[]).map((v, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                                {v}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs leading-relaxed">{value as string}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title={isAr ? "التشخيص التفريقي" : "Differential Diagnosis"} icon={SECTION_ICONS.differential_diagnosis}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                        <th className="text-start py-2 px-3 font-extrabold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                          {isAr ? "الحالة" : "Condition"}
                        </th>
                        <th className="text-start py-2 px-3 font-extrabold uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                          {isAr ? "الميزات المميزة" : "Distinguishing Features"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.differential_diagnosis.map((d, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td className="py-2.5 px-3 font-bold" style={{ color: "var(--color-medical-indigo)", minWidth: 120 }}>{d.condition}</td>
                          <td className="py-2.5 px-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{d.distinguishing_features}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title={isAr ? "العلاج والإدارة" : "Management"} icon={SECTION_ICONS.management}>
                {content.management.immediate && (
                  <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
                    <h3 className="font-extrabold text-xs mb-2 text-red-600">⚡ {isAr ? "الإدارة العاجلة" : "Immediate Management"}</h3>
                    <p className="text-xs leading-relaxed">{content.management.immediate}</p>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
                    {isAr ? "العلاج غير الدوائي" : "Non-Pharmacological"}
                  </h3>
                  <p className="text-xs leading-relaxed">{content.management.non_pharmacological}</p>
                </div>
                {content.management.pharmacological.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
                      {isAr ? "العلاج الدوائي" : "Pharmacological Treatment"}
                    </h3>
                    <div className="space-y-3">
                      {content.management.pharmacological.map((drug, i) => (
                        <div key={i} className="p-4 rounded-xl" style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-sm" style={{ color: "var(--color-medical-indigo)" }}>{drug.drug}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "var(--color-medical-indigo)" }}>{drug.dose}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div><span className="font-bold" style={{ color: "var(--text-primary)" }}>MOA: </span><span style={{ color: "var(--text-secondary)" }}>{drug.mechanism}</span></div>
                            <div><span className="font-bold" style={{ color: "var(--text-primary)" }}>Indication: </span><span style={{ color: "var(--text-secondary)" }}>{drug.indication}</span></div>
                            <div className="col-span-2">
                              <span className="font-bold text-red-500">⚠️ CI: </span>
                              <span style={{ color: "var(--text-secondary)" }}>{drug.contraindications}</span>
                            </div>
                            <div><span className="font-bold" style={{ color: "var(--text-primary)" }}>ADRs: </span><span style={{ color: "var(--text-secondary)" }}>{drug.side_effects}</span></div>
                            <div><span className="font-bold" style={{ color: "var(--text-primary)" }}>Monitor: </span><span style={{ color: "var(--text-secondary)" }}>{drug.monitoring}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl" style={{ background: "rgba(91,108,255,0.06)", border: "1px solid rgba(91,108,255,0.15)" }}>
                  <h3 className="font-extrabold text-xs mb-2" style={{ color: "var(--color-medical-indigo)" }}>
                    🏛️ {isAr ? "توصيات الإرشادات السريرية" : "Clinical Guidelines Summary"}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content.management.guidelines_summary}</p>
                </div>
              </SectionCard>

              {content.complications.length > 0 && (
                <SectionCard title={isAr ? "المضاعفات" : "Complications"} icon={SECTION_ICONS.complications}>
                  <div className="space-y-2">
                    {content.complications.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--bg-3)" }}>
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>{c.complication}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#D97706" }}>{c.frequency}</span>
                          </div>
                          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{c.management}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              <SectionCard title={isAr ? "اللآلئ السريرية" : "Clinical Pearls"} icon={SECTION_ICONS.clinical_pearls}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {content.clinical_pearls.map((pearl, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(91,108,255,0.06)", border: "1px solid rgba(91,108,255,0.15)" }}>
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 font-black text-[10px] flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{pearl}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="High-Yield USMLE" icon={SECTION_ICONS.usmle_high_yield}>
                <div className="grid md:grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-2 text-amber-600">Step 1</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content.usmle_high_yield.step1_relevance}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(16,217,129,0.06)", border: "1px solid rgba(16,217,129,0.15)" }}>
                    <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-2 text-emerald-600">Step 2 CK</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{content.usmle_high_yield.step2_relevance}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-extrabold text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>📝 Classic Vignette</h3>
                  <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>{content.usmle_high_yield.classic_vignette}</p>
                </div>
              </SectionCard>

              {content.references.length > 0 && (
                <SectionCard title={isAr ? "المراجع" : "References"} icon={SECTION_ICONS.references} defaultOpen={false}>
                  <ol className="space-y-3">
                    {content.references.map((ref, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs">
                        <span className="font-bold text-[10px] w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }}>{i + 1}.</span>
                        <div>
                          <p style={{ color: "var(--text-secondary)" }}>{ref.citation}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(6,182,212,0.08)", color: "var(--color-vital-cyan)" }}>
                              {ref.evidence_level}
                            </span>
                            {ref.url && (
                              <a href={ref.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:underline">
                                <ExternalLink className="w-3 h-3" />
                                PubMed
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
