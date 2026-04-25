"use client";

import { useState } from "react";
import { Image as ImageIcon, Search, ExternalLink } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

const CATEGORIES = ["All", "Radiology", "Pathology", "Dermatology", "Cardiology", "Ophthalmology"];

interface MedicalImage {
  id: string;
  titleEn: string;
  titleAr: string;
  caption: string;
  category: string;
  license: string;
  sourceUrl: string;
  previewBg: string;
}

// Placeholders pointing to real open-access sources
const IMAGES: MedicalImage[] = [
  {
    id: "chest_xr_pneumonia",
    titleEn: "Community-Acquired Pneumonia — CXR",
    titleAr: "التهاب الرئة المكتسب من المجتمع — صورة الصدر",
    caption: "Right lower lobe consolidation with air bronchograms. [Source: Radiopaedia, CC BY-NC-SA]",
    category: "Radiology",
    license: "CC BY-NC-SA",
    sourceUrl: "https://radiopaedia.org",
    previewBg: "from-slate-700 to-slate-900",
  },
  {
    id: "ecg_stemi",
    titleEn: "Inferior STEMI — 12-lead ECG",
    titleAr: "احتشاء سفلي STEMI — رسم القلب",
    caption: "ST elevation in II, III, aVF with reciprocal changes in I and aVL. [Source: Wikimedia Commons, CC0]",
    category: "Cardiology",
    license: "CC0",
    sourceUrl: "https://commons.wikimedia.org",
    previewBg: "from-indigo-800 to-indigo-950",
  },
  {
    id: "melanoma",
    titleEn: "Malignant Melanoma — ABCDE Criteria",
    titleAr: "الميلانوما الخبيثة — معايير ABCDE",
    caption: "Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution. [Source: NIH, Public Domain]",
    category: "Dermatology",
    license: "Public Domain",
    sourceUrl: "https://www.cancer.gov",
    previewBg: "from-rose-800 to-slate-900",
  },
  {
    id: "diabetic_retinopathy",
    titleEn: "Proliferative Diabetic Retinopathy",
    titleAr: "اعتلال الشبكية السكري التكاثري",
    caption: "New vessel formation (NVD/NVE), flame haemorrhages, cotton wool spots. [Source: NIH Image Gallery, CC]",
    category: "Ophthalmology",
    license: "CC",
    sourceUrl: "https://www.nei.nih.gov",
    previewBg: "from-red-900 to-slate-900",
  },
];

export default function ImageBankPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = IMAGES.filter((img) => {
    const matchCat = category === "All" || img.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || img.titleEn.toLowerCase().includes(q) || img.titleAr.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <ImageIcon className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "بنك الصور الطبية" : "Medical Image Bank"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              CC-licensed · Wikimedia · NIH · Radiopaedia
            </p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث..." : "Search images..."}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === c
                  ? "bg-indigo-600 text-white"
                  : "bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filtered.map((img) => (
          <div key={img.id} className="medpulse-card overflow-hidden">
            {/* Preview placeholder */}
            <div className={`h-40 bg-gradient-to-br ${img.previewBg} flex items-center justify-center`}>
              <ImageIcon className="w-12 h-12 text-white/20" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-extrabold text-[var(--text-primary)] text-sm leading-tight">
                  {isAr ? img.titleAr : img.titleEn}
                </h3>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  {img.license}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-3">
                {img.caption}
              </p>
              <a
                href={img.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--color-medical-indigo)] hover:underline"
              >
                {isAr ? "المصدر" : "Source"} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--text-tertiary)]">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{isAr ? "لا نتائج" : "No results found"}</p>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-8 font-medium">
        {isAr
          ? "جميع الصور من مصادر مفتوحة الترخيص (CC, Public Domain). انقر على المصدر للوصول للصورة الأصلية."
          : "All images are from open-license sources (CC, Public Domain). Click source to access the original."}
      </p>
    </div>
  );
}
