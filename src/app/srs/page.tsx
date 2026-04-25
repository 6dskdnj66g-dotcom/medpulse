"use client";

import { useState, useCallback } from "react";
import { Brain, RotateCcw, Check, BookOpen, TrendingUp, Clock } from "lucide-react";
import {
  type SRSCard,
  type Quality,
  calculateNextReview,
  getDueCards,
  getRetentionStats,
  createCard,
} from "@/lib/srs/sm2";
import { useLanguage } from "@/core/i18n/LanguageContext";

const STORAGE_KEY = "medpulse_srs_cards";

function loadCards(): SRSCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getSeedCards();
  } catch {
    return getSeedCards();
  }
}

function saveCards(cards: SRSCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function getSeedCards(): SRSCard[] {
  return [
    createCard(
      "What is the most common cause of community-acquired pneumonia?",
      "Streptococcus pneumoniae (pneumococcus) — causes ~30-50% of CAP requiring hospitalization. [Evidence: ATS/IDSA 2019 guidelines]",
      { type: "usmle", id: "pneumonia_01" },
      ["pulmonology", "infectious"]
    ),
    createCard(
      "What are the classic ECG findings of STEMI?",
      "ST elevation ≥1mm in ≥2 contiguous limb leads or ≥2mm in ≥2 contiguous precordial leads, OR new LBBB. New Q waves may develop. [ACC/AHA 2022]",
      { type: "usmle", id: "ecg_stemi_01" },
      ["cardiology", "ECG"]
    ),
    createCard(
      "ما هو معدل الجلسرين الطبيعي في الدم؟",
      "أقل من 150 ملغ/ديسيلتر (1.7 مليمول/لتر) — القيمة المثالية أقل من 100 ملغ/ديسيلتر. [ACC/AHA 2019]",
      { type: "encyclopedia", id: "lipids_ar_01" },
      ["endocrinology", "lipids"]
    ),
    createCard(
      "CURB-65 score: what does each letter stand for?",
      "C = Confusion (new), U = Urea >7 mmol/L (>19 mg/dL), R = Respiratory rate ≥30/min, B = BP systolic <90 or diastolic ≤60, 65 = Age ≥65. Score ≥3 = severe CAP, consider ICU. [BTS 2009]",
      { type: "usmle", id: "curb65_01" },
      ["pulmonology", "calculators"]
    ),
    createCard(
      "First-line treatment for type 2 diabetes (no CVD/CKD)?",
      "Metformin (if eGFR ≥30 and tolerated) + lifestyle modification. If HbA1c >9% or symptomatic: consider early insulin or dual therapy. [ADA 2024 Standards of Care]",
      { type: "encyclopedia", id: "dm2_treatment_01" },
      ["endocrinology"]
    ),
  ];
}

const QUALITY_BUTTONS: { q: Quality; labelEn: string; labelAr: string; color: string }[] = [
  { q: 0, labelEn: "Blackout", labelAr: "لم أتذكر", color: "bg-red-500 hover:bg-red-400" },
  { q: 2, labelEn: "Hard",     labelAr: "صعب",       color: "bg-orange-500 hover:bg-orange-400" },
  { q: 3, labelEn: "Good",     labelAr: "جيد",        color: "bg-blue-500 hover:bg-blue-400" },
  { q: 5, labelEn: "Easy",     labelAr: "سهل",        color: "bg-emerald-500 hover:bg-emerald-400" },
];

export default function SRSPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [cards, setCards] = useState<SRSCard[]>(() => loadCards());
  const [dueCards, setDueCards] = useState<SRSCard[]>(() => getDueCards(loadCards()));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const stats = getRetentionStats(cards);
  const currentCard = dueCards[currentIndex];

  const handleQuality = useCallback(
    (q: Quality) => {
      if (!currentCard) return;

      const updated = cards.map((c) =>
        c.id === currentCard.id ? calculateNextReview(c, q) : c
      );
      saveCards(updated);
      setCards(updated);
      setReviewedCount((n) => n + 1);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= dueCards.length) {
        setSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setShowBack(false);
      }
    },
    [cards, currentCard, currentIndex, dueCards.length]
  );

  const resetSession = () => {
    const reloaded = loadCards();
    setCards(reloaded);
    setDueCards(getDueCards(reloaded));
    setCurrentIndex(0);
    setShowBack(false);
    setSessionComplete(false);
    setReviewedCount(0);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
            <Brain className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "بطاقات التكرار المتباعد" : "Spaced Repetition"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              SM-2 Algorithm · Anki-style
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { icon: BookOpen,   n: stats.total,    label: isAr ? "إجمالي" : "Total",     color: "text-slate-400" },
          { icon: Clock,      n: stats.due,      label: isAr ? "مستحق" : "Due",        color: "text-amber-500" },
          { icon: TrendingUp, n: stats.mature,   label: isAr ? "ناضج" : "Mature",      color: "text-emerald-500" },
          { icon: Brain,      n: stats.newCards, label: isAr ? "جديد" : "New",         color: "text-violet-500" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="medpulse-card p-3 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <div className="text-xl font-black text-[var(--text-primary)]">{s.n}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Review area */}
      {dueCards.length === 0 || sessionComplete ? (
        <div className="medpulse-card p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">
            {isAr ? "أحسنت! انتهت جلسة المراجعة" : "Well done! Session complete"}
          </h2>
          <p className="text-[var(--text-secondary)] font-medium mb-2">
            {isAr
              ? `راجعت ${reviewedCount} بطاقة في هذه الجلسة.`
              : `Reviewed ${reviewedCount} cards this session.`}
          </p>
          {stats.due === 0 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-6">
              {isAr ? "لا توجد بطاقات مستحقة للمراجعة الآن." : "No cards due for review right now."}
            </p>
          )}
          <button onClick={resetSession} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
            <RotateCcw className="w-4 h-4" />
            {isAr ? "ابدأ جلسة جديدة" : "Start new session"}
          </button>
        </div>
      ) : currentCard ? (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-tertiary)] font-bold">
            <span>{isAr ? `البطاقة ${currentIndex + 1} من ${dueCards.length}` : `Card ${currentIndex + 1} of ${dueCards.length}`}</span>
            <span className="uppercase tracking-widest">{currentCard.tags?.join(" · ")}</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-2)] rounded-full mb-6">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div className="medpulse-card p-6 mb-4 min-h-[180px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-3">
                {isAr ? "السؤال" : "Question"}
              </p>
              <p className="text-lg font-bold text-[var(--text-primary)] leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            {!showBack ? (
              <button
                onClick={() => setShowBack(true)}
                className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                {isAr ? "اكشف الإجابة" : "Show Answer"}
              </button>
            ) : null}
          </div>

          {showBack && (
            <>
              <div className="medpulse-card p-6 mb-6 border-l-4 border-emerald-500">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
                  {isAr ? "الإجابة" : "Answer"}
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                  {currentCard.back}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {QUALITY_BUTTONS.map(({ q, labelEn, labelAr, color }) => (
                  <button
                    key={q}
                    onClick={() => handleQuality(q)}
                    className={`${color} text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-95`}
                  >
                    {isAr ? labelAr : labelEn}
                  </button>
                ))}
              </div>

              <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-3 font-medium">
                {isAr
                  ? "قيّم مدى تذكرك للإجابة"
                  : "Rate how well you remembered the answer"}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
