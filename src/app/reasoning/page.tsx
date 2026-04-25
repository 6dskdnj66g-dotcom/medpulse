"use client";

import { useState } from "react";
import { Stethoscope, ClipboardList, Search, FlaskConical, CheckCircle, ChevronRight, Lock } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

type Stage = "complaint" | "history" | "exam" | "investigations" | "diagnosis" | "outcome";

interface CaseStep {
  stage: Stage;
  titleEn: string;
  titleAr: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: CaseStep[] = [
  { stage: "complaint",      titleEn: "Chief Complaint",  titleAr: "الشكوى الرئيسية", icon: ClipboardList },
  { stage: "history",        titleEn: "History",          titleAr: "التاريخ المرضي",   icon: Stethoscope },
  { stage: "exam",           titleEn: "Physical Exam",    titleAr: "الفحص السريري",    icon: Search },
  { stage: "investigations", titleEn: "Investigations",   titleAr: "الفحوصات",          icon: FlaskConical },
  { stage: "diagnosis",      titleEn: "Your Diagnosis",   titleAr: "تشخيصك",           icon: CheckCircle },
  { stage: "outcome",        titleEn: "Outcome",          titleAr: "النتيجة",           icon: ChevronRight },
];

interface Case {
  id: string;
  complaint: { en: string; ar: string };
  history: { en: string; ar: string };
  exam: { en: string; ar: string };
  investigations: { en: string; ar: string };
  correctDiagnosis: string;
  explanation: { en: string; ar: string };
  specialty: string;
}

const DEMO_CASE: Case = {
  id: "case_001",
  complaint: {
    en: "A 65-year-old male presents with sudden-onset severe chest pain radiating to the left arm, diaphoresis, and shortness of breath for the past 2 hours.",
    ar: "مريض ذكر عمره 65 سنة يشكو من ألم شديد مفاجئ في الصدر يمتد إلى الذراع الأيسر، مع تعرق غزير وضيق في التنفس منذ ساعتين.",
  },
  history: {
    en: "PMH: Hypertension (10 years, on amlodipine), Type 2 DM (metformin). Smoker 20 pack-years, quit 5 years ago. FH: Father died of MI at age 58. No prior cardiac history. ROS: No fever, cough, or leg swelling.",
    ar: "التاريخ المرضي: ارتفاع ضغط الدم منذ 10 سنوات (على أملوديبين)، سكري نوع 2 (ميتفورمين). مدخن سابق 20 علبة/سنة، أقلع منذ 5 سنوات. تاريخ عائلي: الأب توفي بنوبة قلبية عند 58 سنة.",
  },
  exam: {
    en: "Vitals: BP 160/95, HR 100 (regular), RR 22, T 37.2°C, SpO₂ 94% on air. Diaphoretic. Cardiovascular: S3 gallop, no murmurs. Chest: mild bibasal crackles. JVP: 6 cm. No peripheral edema.",
    ar: "العلامات الحيوية: ضغط 160/95، نبض 100 (منتظم)، معدل التنفس 22، حرارة 37.2°م، تشبع أكسجين 94% بالهواء. يتعرق بشدة. قلبياً: صوت S3، لا نفخات. رئوياً: خراخر قاعدية خفيفة. لا وذمة طرفية.",
  },
  investigations: {
    en: "ECG: ST elevation in leads II, III, aVF (inferior STEMI). Troponin I: 8.4 ng/mL (↑↑). CXR: mild pulmonary venous congestion. CBC: Hb 13.2, WBC 14.5, platelets 230. BMP: Creatinine 1.1, glucose 180.",
    ar: "رسم القلب: ارتفاع قطعة ST في الاشتقاقات II وIII وaVF (احتشاء سفلي). التروبونين I: 8.4 نانوغرام/مل (مرتفع جداً). صورة الصدر: احتقان وريدي رئوي خفيف. فحص الدم كامل، البيوكيمياء طبيعية باستثناء غلوكوز 180.",
  },
  correctDiagnosis: "Inferior STEMI (ST-Elevation Myocardial Infarction)",
  explanation: {
    en: "This is a classic inferior STEMI with ST elevation in II, III, aVF (right coronary artery territory). The presentation — sudden-onset chest pain with radiation, diaphoresis, elevated troponins, and ECG changes — meets STEMI criteria. Management: activate cath lab immediately, dual antiplatelet (aspirin + P2Y12 inhibitor), anticoagulation, and primary PCI within 90 minutes of first medical contact. [ACC/AHA STEMI Guidelines 2022]",
    ar: "هذه حالة احتشاء سفلي STEMI كلاسيكية مع ارتفاع ST في الاشتقاقات II وIII وaVF (إقليم الشريان التاجي الأيمن). الإدارة الفورية: تفعيل مختبر القسطرة، مضادات الصفيحات المزدوجة (أسبرين + مثبط P2Y12)، مضادات التخثر، وإجراء PCI الأولي خلال 90 دقيقة من أول اتصال طبي. [ACC/AHA 2022]",
  },
  specialty: "Cardiology",
};

export default function ReasoningPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [userDiagnosis, setUserDiagnosis] = useState("");
  const [showOutcome, setShowOutcome] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentStage = STAGES[currentStageIndex];
  const caseData = DEMO_CASE;

  function getStageContent(stage: Stage): string {
    const content: Record<Stage, { en: string; ar: string } | string> = {
      complaint:      caseData.complaint,
      history:        caseData.history,
      exam:           caseData.exam,
      investigations: caseData.investigations,
      diagnosis:      { en: "", ar: "" },
      outcome:        { en: "", ar: "" },
    };
    const c = content[stage];
    if (typeof c === "object") return isAr ? c.ar : c.en;
    return c;
  }

  function evaluateDiagnosis() {
    const keywords = ["stemi", "mi", "myocardial infarction", "احتشاء", "نوبة قلبية", "inferior"];
    const lower = userDiagnosis.toLowerCase();
    const correct = keywords.some((kw) => lower.includes(kw));
    setScore(correct ? 90 : 40);
    setShowOutcome(true);
    setCurrentStageIndex(STAGES.length - 1);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-4xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
            <Stethoscope className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "مدرب التفكير السريري" : "Clinical Reasoning Trainer"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              Step-by-step case progression
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 mt-2">
          <span>{isAr ? "تخصص:" : "Specialty:"}</span>
          <span>{caseData.specialty}</span>
        </div>
      </div>

      {/* Stage progress */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STAGES.slice(0, -1).map((s, i) => {
          const Icon = s.icon;
          const done = i < currentStageIndex;
          const active = i === currentStageIndex;
          return (
            <div key={s.stage} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active ? "bg-indigo-600 text-white" :
                done  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                "bg-[var(--bg-2)] text-[var(--text-tertiary)]"
              }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? s.titleAr : s.titleEn}</span>
              </div>
              {i < STAGES.length - 2 && (
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${done ? "text-emerald-500" : "text-[var(--text-tertiary)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content area */}
      <div className="medpulse-card p-6 mb-6">
        <p className="text-[10px] font-black text-[var(--color-medical-indigo)] uppercase tracking-widest mb-4">
          {isAr ? currentStage.titleAr : currentStage.titleEn}
        </p>

        {currentStage.stage !== "diagnosis" && currentStage.stage !== "outcome" && (
          <p className="text-[var(--text-primary)] leading-relaxed font-medium">
            {getStageContent(currentStage.stage)}
          </p>
        )}

        {currentStage.stage === "diagnosis" && (
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-4">
              {isAr
                ? "بناءً على المعلومات المتاحة، ما هو تشخيصك؟"
                : "Based on the information available, what is your diagnosis?"}
            </p>
            <textarea
              value={userDiagnosis}
              onChange={(e) => setUserDiagnosis(e.target.value)}
              placeholder={isAr ? "اكتب تشخيصك هنا..." : "Enter your diagnosis..."}
              className="w-full h-28 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--text-primary)] text-sm font-medium resize-none focus:outline-none focus:border-indigo-500"
              dir="auto"
            />
          </div>
        )}

        {showOutcome && currentStage.stage === "outcome" && (
          <div>
            <div className={`p-4 rounded-xl mb-4 ${score && score >= 70 ? "bg-emerald-500/10 border border-emerald-500/25" : "bg-amber-500/10 border border-amber-500/25"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-[var(--text-primary)]">
                  {isAr ? "التشخيص الصحيح:" : "Correct Diagnosis:"}
                </span>
                <span className={`text-2xl font-black ${score && score >= 70 ? "text-emerald-500" : "text-amber-500"}`}>
                  {score}/100
                </span>
              </div>
              <p className="font-bold text-[var(--text-primary)] mb-3">{caseData.correctDiagnosis}</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                {isAr ? caseData.explanation.ar : caseData.explanation.en}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!showOutcome && (
        <div className="flex justify-end">
          {currentStage.stage === "diagnosis" ? (
            <button
              onClick={evaluateDiagnosis}
              disabled={!userDiagnosis.trim()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {isAr ? "تحقق من التشخيص" : "Check Diagnosis"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentStageIndex((i) => Math.min(i + 1, STAGES.length - 2))}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              {isAr ? "التالي" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {!showOutcome && currentStageIndex < STAGES.length - 2 && (
        <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-4 font-medium flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          {isAr
            ? "الخطوات التالية مقفلة حتى تكمل الخطوة الحالية"
            : "Subsequent steps are unlocked as you progress"}
        </p>
      )}
    </div>
  );
}
