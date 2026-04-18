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
    iconColor: "text-slate-600 dark:text-[var(--text-tertiary)]/70",
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in zoom-in-95 duration-700 relative" dir={dir}>

      {/* Ambient background glows */}
      <div className="absolute top-[0%] left-[0%] w-[40%] h-[40%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[0%] w-[30%] h-[30%] bg-[var(--color-clinical-violet)]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden medpulse-card glass level-2 p-8 md:p-14 border border-[var(--border-subtle)] shadow-[0_20px_40px_-15px_rgba(var(--color-medical-indigo-rgb),0.15)] group">
        <div className="absolute top-0 right-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none translate-x-1/4 -translate-y-1/4 transition-transform duration-1000 group-hover:rotate-12 group-hover:scale-110">
          <BookOpen className="w-96 h-96 text-[var(--color-medical-indigo)]" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 text-[var(--color-medical-indigo)] text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em] mb-5 bg-[var(--color-medical-indigo)]/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-[var(--color-medical-indigo)]/20">
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
            <span>{isAr ? "طبعة الذكاء السريري 2026" : "2026 Clinical Intelligence Edition"}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] mb-6 leading-tight tracking-tight">
            {isAr ? "المكتبة الطبية" : "The Universal"}<br />
            <span className="brand-gradient-text">{isAr ? "الشاملة" : "Medical Library"}</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-medium">
            {isAr
              ? "مستودع سريري شامل مُفهرس من مراجعات Cochrane ومعايير USMLE والأدبيات الطبية الأولية. بروتوكولات لعام 2026 مضمونة الدقة بدمج مباشر لـ RAG."
              : "A comprehensive RAG-enabled clinical repository indexed from Cochrane reviews, USMLE standards, and primary medical literature. Zero-hallucination guaranteed."}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-[var(--bg-0)]/80 backdrop-blur-md border border-[var(--border-subtle)] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[13px] md:text-sm font-extrabold text-[var(--text-primary)] tracking-wide">{isAr ? "18,400+ مجلد موثّق" : "18,400+ Verified Volumes"}</span>
            </div>
            <div className="bg-[var(--bg-0)]/80 backdrop-blur-md border border-[var(--border-subtle)] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-3 h-3 rounded-full bg-[var(--color-medical-indigo)] shadow-[0_0_10px_rgba(var(--color-medical-indigo-rgb),0.8)]" />
              <span className="text-[13px] md:text-sm font-extrabold text-[var(--text-primary)] tracking-wide">{isAr ? "محدّث مارس 2026" : "Updated March 2026"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-3xl mx-auto group z-20">
        <Search className={`absolute ${dir === "rtl" ? "right-6" : "left-6"} top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors`} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? "ابحث في التخصصات السريرية (مثال: أمراض القلب، الإنتان)..." : "Search clinical modules (e.g. 'Cardiology', 'Sepsis')"}
          className={`w-full ${dir === "rtl" ? "pr-16 pl-16" : "pl-16 pr-16"} py-5 md:py-6 bg-[var(--bg-0)]/90 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl text-base md:text-lg font-bold shadow-lg shadow-[var(--color-medical-indigo)]/5 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 transition-all outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)]`}
        />
        {search && (
          <button onClick={() => setSearch("")} className={`absolute ${dir === "rtl" ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-[var(--bg-1)] p-2 rounded-xl transition-all`}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Specialties Grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 relative z-10">
        {filtered.length > 0 ? filtered.map((specialty, i) => (
          <Link key={specialty.id} href={`/encyclopedia/${specialty.id}`}
            className={`medpulse-card p-6 md:p-8 flex flex-col group border border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--color-medical-indigo-rgb),0.2)] bg-[var(--bg-0)] hover:-translate-y-1.5 animate-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between mb-8">
              <div className={`w-16 h-16 md:w-20 md:h-20 ${specialty.iconBg} rounded-[24px] flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500 border border-[var(--border-subtle)] backdrop-blur-md`}>
                <specialty.icon className={`w-8 h-8 md:w-10 md:h-10 ${specialty.iconColor}`} />
              </div>
              <div className="text-right bg-[var(--bg-1)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-0.5">{isAr ? "مقال" : "Articles"}</p>
                <p className={`text-[13px] md:text-sm font-black ${specialty.iconColor} tracking-wide`}>{specialty.articles.toLocaleString()}</p>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">{isAr ? specialty.labelAr : specialty.label}</h3>
            <p className="text-[var(--text-secondary)] text-[13px] md:text-[14px] leading-relaxed font-medium mb-8 flex-1">
              {isAr ? specialty.descriptionAr : specialty.description}
            </p>
            <div className={`flex items-center justify-between font-extrabold text-[11px] md:text-xs uppercase tracking-widest pt-5 border-t border-[var(--border-subtle)] text-[var(--text-tertiary)] group-hover:${specialty.iconColor} transition-colors`}>
              <span>{isAr ? "استكشاف التخصص" : "Explore Module"}</span>
              <div className={`w-8 h-8 rounded-full bg-[var(--bg-1)] group-hover:${specialty.iconBg} flex items-center justify-center transition-colors`}>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${dir === "rtl" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </div>
            </div>
          </Link>
        )) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-5 glass level-1 rounded-[32px] border-2 border-dashed border-[var(--border-subtle)]">
            <div className="w-24 h-24 bg-[var(--bg-2)] rounded-[24px] flex items-center justify-center shadow-sm transform -rotate-6">
              <Search className="w-12 h-12 opacity-40 text-[var(--color-medical-indigo)]" />
            </div>
            <p className="font-extrabold text-xl text-[var(--text-secondary)] mt-4">{isAr ? `لا توجد نتائج مطابقة لـ "${search}"` : `No modules match "${search}"`}</p>
            <button onClick={() => setSearch("")} className="text-[13px] font-extrabold text-[var(--color-medical-indigo)] hover:text-white hover:bg-[var(--color-medical-indigo)] px-5 py-2.5 rounded-xl border border-[var(--color-medical-indigo)]/30 transition-all shadow-sm">
              {isAr ? "إعادة تعيين البحث" : "Clear Search Filters"}
            </button>
          </div>
        )}
      </div>

      {/* ── Global Medical Sources Panel ── */}
      <div className="space-y-8 mt-16 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-[var(--color-vital-cyan)]/10 mb-5 border border-[var(--color-vital-cyan)]/20 shadow-sm">
            <ExternalLink className="w-8 h-8 text-[var(--color-vital-cyan)]" />
          </div>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">
            {isAr ? "سجل المصادر الطبية العالمية" : "Global Medical Sources Registry"}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? <>نظام MedPulse AI مُزامن مباشرةً مع <strong className="text-[var(--text-primary)] font-black">{totalSources}+</strong> مصدر طبي معترف به دولياً، محدّث حتى <strong className="text-[var(--color-medical-indigo)] font-black">أبريل 2026</strong> لضمان أدق بروتوكولات الرعاية.</>
              : <>MedPulse AI is immediately synchronized with <strong className="text-[var(--text-primary)] font-black">{totalSources}+</strong> internationally recognized medical sources, updated to <strong className="text-[var(--color-medical-indigo)] font-black">April 2026</strong>.</>
            }
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {SOURCE_CATEGORIES.map((cat, i) => (
            <div key={cat.label} className="medpulse-card glass level-1 p-6 md:p-8 border border-[var(--border-subtle)] hover:shadow-xl transition-shadow animate-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`flex h-4 w-4 relative`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${
                    cat.color === "indigo" ? "bg-indigo-500" :
                    cat.color === "emerald" ? "bg-emerald-500" :
                    cat.color === "teal" ? "bg-teal-500" : "bg-amber-500"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-4 w-4 shadow-sm ${
                    cat.color === "indigo" ? "bg-indigo-500" :
                    cat.color === "emerald" ? "bg-emerald-500" :
                    cat.color === "teal" ? "bg-teal-500" : "bg-amber-500"
                  }`}></span>
                </span>
                <h4 className={`text-[12px] md:text-[13px] font-extrabold uppercase tracking-widest ${
                  cat.color === "indigo"  ? "text-indigo-600  dark:text-indigo-400"  :
                  cat.color === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                  cat.color === "teal"    ? "text-teal-600    dark:text-teal-400"    :
                                            "text-amber-600   dark:text-amber-400"
                }`}>
                  {isAr ? cat.labelAr : cat.label}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {cat.sources.map(src => (
                  <a
                    key={src.label}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${src.label}`}
                    className={`inline-flex items-center gap-2 text-[11px] md:text-[12px] font-extrabold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.03] hover:shadow-md cursor-pointer border border-[var(--border-subtle)] bg-[var(--bg-0)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/30`}
                  >
                    {src.label}
                    <ExternalLink className="w-3 h-3 opacity-50" />
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
