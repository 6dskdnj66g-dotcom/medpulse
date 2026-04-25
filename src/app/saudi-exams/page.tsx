"use client";

import { Award, Target } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import Link from "next/link";

const EXAMS = [
  {
    id: "sle",
    nameEn: "SLE — Saudi Licensure Exam",
    nameAr: "اختبار الترخيص السعودي (SLE)",
    org: "Saudi Commission for Health Specialties (SCHS)",
    descEn: "General licensure exam for healthcare professionals wishing to practice in Saudi Arabia. Tests basic medical sciences and clinical knowledge.",
    descAr: "اختبار الترخيص العام للممارسة الصحية في المملكة العربية السعودية. يشمل العلوم الطبية الأساسية والمعرفة السريرية.",
    badge: "SCHS",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    resources: ["/usmle", "/encyclopedia", "/calculators"],
  },
  {
    id: "smle",
    nameEn: "SMLE — Saudi Medical Licensure Exam",
    nameAr: "اختبار الترخيص الطبي السعودي (SMLE)",
    org: "Saudi Commission for Health Specialties",
    descEn: "Comprehensive MCQ-based exam for medical doctors. Covers all clinical disciplines. Passing is required to practice medicine in KSA.",
    descAr: "اختبار شامل بأسئلة الاختيار من متعدد للأطباء البشريين. يغطي جميع التخصصات السريرية. اجتيازه شرط لمزاولة مهنة الطب في المملكة.",
    badge: "SMLE",
    color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    resources: ["/usmle", "/professors", "/mdt"],
  },
  {
    id: "arab-board",
    nameEn: "Arab Board of Health Specializations",
    nameAr: "البورد العربي للاختصاصات الصحية",
    org: "Arab Board of Health Specializations",
    descEn: "Postgraduate specialist certification covering 27 medical specialties. Recognized across 22 Arab League countries.",
    descAr: "شهادة تخصصية بعد التخرج تشمل 27 تخصصاً طبياً. معترف بها في 22 دولة عربية.",
    badge: "Arab Board",
    color: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
    resources: ["/encyclopedia", "/library", "/professors"],
  },
  {
    id: "saudi-board",
    nameEn: "Saudi Board — Specialty Certification",
    nameAr: "البورد السعودي للتخصصات الطبية",
    org: "Saudi Commission for Health Specialties",
    descEn: "Saudi specialty board certification programs across 60+ disciplines. Requires completion of accredited residency programs.",
    descAr: "برامج البورد السعودي للتخصصات الطبية في 60+ تخصصاً. يتطلب إتمام برامج الإقامة المعتمدة.",
    badge: "Saudi Board",
    color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    resources: ["/encyclopedia", "/library", "/mdt"],
  },
];

const STRATEGIES = [
  { n: "1", textEn: "Master USMLE-style MCQs in the USMLE Bank — same vignette style as SMLE", textAr: "أتقن أسئلة MCQ بنمط USMLE — نفس أسلوب SMLE في الوقت الحالي" },
  { n: "2", textEn: "Use AI Professors for specialty-specific deep dives", textAr: "استخدم أساتذة الذكاء الاصطناعي للتعمق في كل تخصص" },
  { n: "3", textEn: "Practice clinical reasoning with MDT debates", textAr: "تدرّب على التفكير السريري عبر مناظرات MDT" },
  { n: "4", textEn: "Review the Medical Encyclopedia (308+ sources) for guideline updates", textAr: "راجع الموسوعة الطبية (308+ مصدر) لتحديثات الإرشادات" },
  { n: "5", textEn: "Use SRS flashcards for high-yield facts retention", textAr: "استخدم بطاقات التكرار المتباعد للمحافظة على المعلومات الأساسية" },
];

export default function SaudiExamsPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-4xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "الاختبارات الطبية السعودية" : "Saudi Medical Exams"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              SLE · SMLE · Arab Board · Saudi Board
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {EXAMS.map((exam) => (
          <div key={exam.id} className="medpulse-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${exam.color}`}>
                    {exam.badge}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-medium">{exam.org}</span>
                </div>
                <h3 className="font-extrabold text-[var(--text-primary)] text-base mb-2">
                  {isAr ? exam.nameAr : exam.nameEn}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                  {isAr ? exam.descAr : exam.descEn}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-2">
              <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest self-center">
                {isAr ? "الأدوات المقترحة:" : "Recommended tools:"}
              </span>
              {exam.resources.map((r) => (
                <Link
                  key={r}
                  href={r}
                  className="text-[11px] font-bold text-[var(--color-medical-indigo)] bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full hover:bg-indigo-500/20 transition-colors"
                >
                  {r.replace("/", "")}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Study strategy */}
      <div className="medpulse-card p-6">
        <div className="flex items-center gap-2 mb-5 text-indigo-500">
          <Target className="w-5 h-5" />
          <h2 className="font-black text-base text-[var(--text-primary)]">
            {isAr ? "استراتيجية الدراسة عبر MedPulse" : "MedPulse Study Strategy"}
          </h2>
        </div>
        <div className="space-y-3">
          {STRATEGIES.map((s) => (
            <div key={s.n} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.n}
              </span>
              <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                {isAr ? s.textAr : s.textEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
