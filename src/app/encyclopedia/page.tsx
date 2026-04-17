"use client";

import { useState } from "react";
import {
  ArrowRight, BookOpen, HeartPulse, Brain, Microscope, Stethoscope,
  Baby, Pill, Activity, Search, X, Dna, ExternalLink,
  ShieldCheck, FlaskConical, Bone, Eye
} from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useLanguage } from "@/components/LanguageContext";

const SPECIALTIES = [
  {
    id: "physiology",
    icon: Activity,
    label: "Physiology",
    labelAr: "علم وظائف الأعضاء",
    color: "emerald",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-500/40",
    articles: 1420,
    description: "Fundamental mechanisms of human life systems, homeostasis, and cellular function across organ systems.",
    descriptionAr: "الآليات الأساسية لوظائف الجسم البشري والتوازن الداخلي والوظيفة الخلوية عبر أجهزة الأعضاء.",
  },
  {
    id: "internal-medicine",
    icon: Stethoscope,
    label: "Internal Medicine",
    labelAr: "الطب الداخلي",
    color: "sky",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600 dark:text-sky-400",
    borderColor: "hover:border-sky-500/40",
    articles: 2840,
    description: "Comprehensive database of adult diseases, diagnostic algorithms, and standard-of-care treatment protocols.",
    descriptionAr: "قاعدة بيانات شاملة لأمراض البالغين وخوارزميات التشخيص وبروتوكولات العلاج المعيارية.",
  },
  {
    id: "cardiology",
    icon: HeartPulse,
    label: "Cardiology",
    labelAr: "أمراض القلب",
    color: "rose",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderColor: "hover:border-rose-500/40",
    articles: 1920,
    description: "ECG interpretation, heart failure management, arrhythmias, and interventional cardiology per ACC/AHA 2026.",
    descriptionAr: "تفسير رسم القلب، علاج فشل القلب، اضطرابات النظم، وأمراض القلب التداخلية وفق ACC/AHA 2026.",
  },
  {
    id: "neurology",
    icon: Brain,
    label: "Neurology",
    labelAr: "طب الأعصاب",
    color: "indigo",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "hover:border-indigo-500/40",
    articles: 1640,
    description: "Stroke protocols, movement disorders, epilepsy management, and CNS pathology from AAN 2026.",
    descriptionAr: "بروتوكولات السكتة الدماغية، اضطرابات الحركة، الصرع، وأمراض الجهاز العصبي المركزي.",
  },
  {
    id: "pathology",
    icon: Microscope,
    label: "Pathology",
    labelAr: "علم الأمراض",
    color: "teal",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderColor: "hover:border-teal-500/40",
    articles: 1380,
    description: "Histopathology, gross specimen interpretation, and molecular pathology indexed by tissue type.",
    descriptionAr: "علم الأنسجة المرضية، تفسير العينات الكلية، والأمراض الجزيئية مُصنّفة حسب نوع النسيج.",
  },
  {
    id: "anatomy",
    icon: Dna,
    label: "Anatomy",
    labelAr: "علم التشريح",
    color: "amber",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-500/40",
    articles: 950,
    description: "Gross anatomy, neuroanatomy, and embryology with high-fidelity clinical correlations.",
    descriptionAr: "التشريح الكلي، تشريح الأعصاب، وعلم الأجنة مع الارتباطات السريرية عالية الدقة.",
  },
  {
    id: "pharmacology",
    icon: Pill,
    label: "Pharmacology",
    labelAr: "علم الأدوية",
    color: "violet",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor: "hover:border-violet-500/40",
    articles: 3100,
    description: "Drug mechanisms, interactions, contraindications, and clinical pharmacology updated to 2026.",
    descriptionAr: "آليات الأدوية والتفاعلات الدوائية وموانع الاستخدام وعلم الأدوية السريري محدّث لعام 2026.",
  },
  {
    id: "pediatrics",
    icon: Baby,
    label: "Pediatrics",
    labelAr: "طب الأطفال",
    color: "pink",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-600 dark:text-pink-400",
    borderColor: "hover:border-pink-500/40",
    articles: 1120,
    description: "Developmental milestones, pediatric dosing protocols, and neonatal emergency management.",
    descriptionAr: "المعالم التنموية، جرعات الأطفال، وإدارة حالات الطوارئ في حديثي الولادة.",
  },
  {
    id: "surgery",
    icon: Stethoscope,
    label: "Surgery",
    labelAr: "الجراحة",
    color: "slate",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    borderColor: "hover:border-slate-500/40",
    articles: 2110,
    description: "Perioperative care, surgical oncology, trauma surgery, and laparoscopic techniques — Bailey & Love 28th Ed.",
    descriptionAr: "الرعاية حول العملية الجراحية، جراحة الأورام، جراحة الصدمات، والتقنيات بالمنظار.",
  },
  {
    id: "obstetrics",
    icon: Baby,
    label: "Obstetrics & Gynecology",
    labelAr: "التوليد وأمراض النساء",
    color: "fuchsia",
    iconBg: "bg-fuchsia-500/10",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    borderColor: "hover:border-fuchsia-500/40",
    articles: 1450,
    description: "Antenatal care, obstetric emergencies, and gynecologic oncology from ACOG, RCOG, FIGO 2026.",
    descriptionAr: "رعاية ما قبل الولادة، طوارئ التوليد، وأورام النساء وفق إرشادات ACOG وRCOG وFIGO 2026.",
  },
  {
    id: "oncology",
    icon: FlaskConical,
    label: "Oncology",
    labelAr: "علم الأورام",
    color: "orange",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    borderColor: "hover:border-orange-500/40",
    articles: 1880,
    description: "Cancer biology, targeted therapy, immuno-oncology, and palliative care from NCCN, ESMO, ASCO 2026.",
    descriptionAr: "بيولوجيا السرطان، العلاج المستهدف، العلاج المناعي، والرعاية التلطيفية وفق NCCN وESMO وASCO 2026.",
  },
  {
    id: "orthopedics",
    icon: Bone,
    label: "Orthopedics",
    labelAr: "جراحة العظام",
    color: "stone",
    iconBg: "bg-stone-500/10",
    iconColor: "text-stone-600 dark:text-stone-400",
    borderColor: "hover:border-stone-500/40",
    articles: 980,
    description: "Fracture management, joint arthroplasty, sports medicine, and spine surgery — AAOS 2026.",
    descriptionAr: "إدارة الكسور، تركيب المفاصل، الطب الرياضي، وجراحة العمود الفقري وفق AAOS 2026.",
  },
  {
    id: "ophthalmology",
    icon: Eye,
    label: "Ophthalmology",
    labelAr: "طب العيون",
    color: "cyan",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "hover:border-cyan-500/40",
    articles: 720,
    description: "Retinal disease, glaucoma, cataract surgery, and neuro-ophthalmology — AAO 2026.",
    descriptionAr: "أمراض الشبكية، الجلوكوما، جراحة إعتام عدسة العين، وطب العيون العصبي.",
  },
];

// ── Real medical source links ────────────────────────────────────────────────
interface SourceEntry { label: string; url: string }

const SOURCE_CATEGORIES: { label: string; labelAr: string; color: string; badgeClass: string; sources: SourceEntry[] }[] = [
  {
    label: "Premier Journals",
    labelAr: "المجلات الطبية الكبرى",
    color: "indigo",
    badgeClass: "source-badge-indigo",
    sources: [
      { label: "NEJM (IF 176.1)",          url: "https://www.nejm.org" },
      { label: "The Lancet (IF 202.7)",     url: "https://www.thelancet.com" },
      { label: "JAMA (IF 157.3)",           url: "https://jamanetwork.com" },
      { label: "BMJ (IF 105.7)",            url: "https://www.bmj.com" },
      { label: "Nature Medicine",           url: "https://www.nature.com/nm" },
      { label: "Annals of Internal Med.",   url: "https://www.acpjournals.org/journal/aim" },
      { label: "Circulation",               url: "https://www.ahajournals.org/journal/circ" },
      { label: "European Heart Journal",    url: "https://academic.oup.com/eurheartj" },
      { label: "J Clinical Oncology",       url: "https://ascopubs.org/journal/jco" },
      { label: "Gut / BMJ",                 url: "https://gut.bmj.com" },
      { label: "Chest / ACCP",             url: "https://journal.chestnet.org" },
      { label: "Kidney International",      url: "https://www.kidney-international.org" },
    ],
  },
  {
    label: "Clinical Evidence Databases",
    labelAr: "قواعد الأدلة السريرية",
    color: "emerald",
    badgeClass: "source-badge-emerald",
    sources: [
      { label: "UpToDate 2026",             url: "https://www.uptodate.com" },
      { label: "Cochrane Library (1A)",     url: "https://www.cochranelibrary.com" },
      { label: "PubMed / MEDLINE",          url: "https://pubmed.ncbi.nlm.nih.gov" },
      { label: "ClinicalTrials.gov",        url: "https://clinicaltrials.gov" },
      { label: "DynaMed 2026",             url: "https://www.dynamed.com" },
      { label: "BMJ Best Practice",        url: "https://bestpractice.bmj.com" },
      { label: "Embase",                    url: "https://www.embase.com" },
    ],
  },
  {
    label: "International Guidelines",
    labelAr: "الإرشادات الدولية",
    color: "teal",
    badgeClass: "source-badge-teal",
    sources: [
      { label: "WHO 2026",                  url: "https://www.who.int/publications" },
      { label: "NICE (UK) 2026",           url: "https://www.nice.org.uk/guidance" },
      { label: "CDC 2026",                  url: "https://www.cdc.gov/publications" },
      { label: "ACC / AHA 2026",           url: "https://www.acc.org/guidelines" },
      { label: "ESC 2026",                  url: "https://www.escardio.org/Guidelines" },
      { label: "KDIGO 2026",               url: "https://kdigo.org/guidelines" },
      { label: "IDSA / ATS 2026",          url: "https://www.idsociety.org/practice-guideline" },
      { label: "ADA 2026",                  url: "https://diabetesjournals.org/care" },
      { label: "NCCN 2026",                url: "https://www.nccn.org/guidelines" },
      { label: "ESMO 2026",                url: "https://www.esmo.org/guidelines" },
      { label: "ACR 2026",                  url: "https://www.rheumatology.org/Practice-Quality/Clinical-Support/Clinical-Practice-Guidelines" },
      { label: "AAN 2026",                  url: "https://www.aan.com/Guidelines" },
      { label: "ACOG 2026",                url: "https://www.acog.org/clinical" },
      { label: "AAP 2026",                  url: "https://publications.aap.org" },
      { label: "AAOS 2026",               url: "https://www.aaos.org/quality/clinical-quality-guides" },
    ],
  },
  {
    label: "Foundational Textbooks",
    labelAr: "الكتب الطبية الأساسية",
    color: "amber",
    badgeClass: "source-badge-amber",
    sources: [
      { label: "Harrison's 21st Ed",        url: "https://accessmedicine.mhmedical.com/book.aspx?bookid=3095" },
      { label: "Goldman-Cecil 27th Ed",     url: "https://www.clinicalkey.com" },
      { label: "Braunwald's 12th Ed",      url: "https://www.clinicalkey.com" },
      { label: "Robbins & Cotran 10th Ed", url: "https://www.clinicalkey.com" },
      { label: "Gray's Anatomy 5th Ed",    url: "https://www.clinicalkey.com" },
      { label: "Guyton & Hall 14th Ed",    url: "https://www.clinicalkey.com" },
      { label: "Adams & Victor's 11th Ed", url: "https://accessmedicine.mhmedical.com" },
      { label: "Nelson's Pediatrics 22nd", url: "https://www.clinicalkey.com" },
      { label: "Williams Obstetrics 26th", url: "https://accessmedicine.mhmedical.com" },
      { label: "Bailey & Love 28th Ed",    url: "https://www.routledge.com" },
      { label: "Goodman & Gilman 14th Ed", url: "https://accesspharmacy.mhmedical.com" },
      { label: "Oxford Handbook 10th Ed",  url: "https://academic.oup.com/online-resources/the-oxford-handbook" },
      { label: "CMDT 2026",                url: "https://accessmedicine.mhmedical.com/book.aspx?bookid=3095" },
    ],
  },
];

function EncyclopediaHome() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");

  const filtered = SPECIALTIES.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.labelAr.includes(search) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalSources = SOURCE_CATEGORIES.reduce((acc, c) => acc + c.sources.length, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12 page-transition" dir={dir}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden glass-panel p-8 md:p-12 rounded-[2.5rem] border border-indigo-500/10">
        <div className="absolute top-0 right-0 opacity-[0.06] pointer-events-none translate-x-1/4 -translate-y-1/4">
          <BookOpen className="w-96 h-96 text-indigo-500" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "طبعة الذكاء السريري 2026" : "2026 Clinical Intelligence Edition"}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            {isAr ? "المكتبة الطبية" : "The Universal"}<br />
            <span className="medical-gradient-text">{isAr ? "الشاملة" : "Medical Library"}</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl">
            {isAr
              ? "مستودع سريري شامل مُفهرس من مراجعات Cochrane ومعايير USMLE والأدبيات الطبية الأولية. بروتوكولات مضمونة الدقة."
              : "A comprehensive RAG-enabled clinical repository indexed from Cochrane reviews, USMLE standards, and primary medical literature. Zero-hallucination guaranteed."}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{isAr ? "18,400+ مجلد موثّق" : "18,400+ Verified Volumes"}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{isAr ? "محدّث مارس 2026" : "Updated March 2026"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-2xl mx-auto group">
        <Search className={`absolute ${dir === "rtl" ? "right-6" : "left-6"} top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? "ابحث في التخصصات السريرية..." : "Search clinical modules (e.g. 'Cardiology', 'Sepsis')"}
          className={`w-full ${dir === "rtl" ? "pr-16 pl-16" : "pl-16 pr-16"} py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl text-lg font-bold shadow-xl shadow-indigo-500/5 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 dark:text-white placeholder:text-slate-400`}
        />
        {search && (
          <button onClick={() => setSearch("")} className={`absolute ${dir === "rtl" ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors`}>
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Specialties Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map(specialty => (
          <Link key={specialty.id} href={`/encyclopedia/${specialty.id}`}
            className={`premium-card p-6 flex flex-col group border-2 border-transparent ${specialty.borderColor} transition-all`}>
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 ${specialty.iconBg} rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <specialty.icon className={`w-7 h-7 ${specialty.iconColor}`} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{isAr ? "مقال" : "Articles"}</p>
                <p className={`text-sm font-black ${specialty.iconColor}`}>{specialty.articles.toLocaleString()}</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{isAr ? specialty.labelAr : specialty.label}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
              {isAr ? specialty.descriptionAr : specialty.description}
            </p>
            <div className={`flex items-center gap-2 ${specialty.iconColor} font-black text-xs uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800/50`}>
              {isAr ? "دخول المكتبة" : "Enter Library"}
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${dir === "rtl" ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`} />
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-bold text-lg">{isAr ? `لا توجد نتائج لـ "${search}"` : `No modules match "${search}"`}</p>
            <button onClick={() => setSearch("")} className="text-indigo-500 font-bold hover:underline">
              {isAr ? "إعادة تعيين البحث" : "Reset Search"}
            </button>
          </div>
        )}
      </div>

      {/* ── Global Medical Sources Panel ── */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {isAr ? "سجل المصادر الطبية العالمية" : "Global Medical Sources Registry"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto">
            {isAr
              ? <>MedPulse AI مُزامن مع <strong className="text-slate-700 dark:text-slate-200">{totalSources}+</strong> مصدر طبي معترف به دولياً، محدّث حتى <strong className="text-slate-700 dark:text-slate-200">أبريل 2026</strong>.</>
              : <>MedPulse AI is synchronized with <strong className="text-slate-700 dark:text-slate-200">{totalSources}+</strong> internationally recognized medical sources, updated to <strong className="text-slate-700 dark:text-slate-200">April 2026</strong>.</>
            }
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {SOURCE_CATEGORIES.map(cat => (
            <div key={cat.label} className="premium-card p-6">
              <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${
                cat.color === "indigo"  ? "text-indigo-600  dark:text-indigo-400"  :
                cat.color === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                cat.color === "teal"    ? "text-teal-600    dark:text-teal-400"    :
                                          "text-amber-600   dark:text-amber-400"
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  cat.color === "indigo"  ? "bg-indigo-500"  :
                  cat.color === "emerald" ? "bg-emerald-500" :
                  cat.color === "teal"    ? "bg-teal-500"    :
                                            "bg-amber-500"
                }`} />
                {isAr ? cat.labelAr : cat.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.sources.map(src => (
                  <a
                    key={src.label}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${src.label}`}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all hover:scale-105 hover:shadow-md cursor-pointer ${cat.badgeClass}`}
                  >
                    {src.label}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <EncyclopediaHome />
    </ErrorBoundary>
  );
}
