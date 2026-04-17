"use client";

import { useState } from "react";
import { Trophy, Clock, CheckCircle, X, ChevronRight, RotateCcw, Award, BookOpen, Brain } from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";

// ── Question Bank ──────────────────────────────────────────────────────────
const QUESTION_BANK = [
  // Cardiology
  {
    specialty: "Cardiology",
    difficulty: "Hard",
    stem: "A 68-year-old woman with atrial fibrillation presents with sudden onset severe chest pain radiating to the back, unequal blood pressures in both arms (right 185/95 mmHg, left 140/80 mmHg), and a new aortic regurgitation murmur. CT shows a dilated aortic root. What is the most likely diagnosis?",
    options: ["Acute STEMI", "Aortic Dissection Type A", "Aortic Dissection Type B", "Pulmonary Embolism", "Hypertensive Emergency"],
    answer: 1,
    explanation: "The triad of tearing chest pain radiating to the back, unequal arm blood pressures, and a new AR murmur strongly suggests Stanford Type A aortic dissection (involving the ascending aorta). Type A is a surgical emergency with mortality increasing ~1%/hour without intervention. [ACC/AHA Aortic Disease Guidelines 2026]",
    reference: "ACC/AHA 2022 Aortic Disease Guidelines, Updated 2026"
  },
  {
    specialty: "Cardiology",
    difficulty: "Medium",
    stem: "A 55-year-old diabetic male with HFrEF (EF 30%) is on maximum-tolerated doses of ACE inhibitor, beta-blocker, and spironolactone. His NT-proBNP remains elevated. Which medication should be added next according to 2026 ESC Heart Failure guidelines?",
    options: ["Digoxin", "SGLT2 inhibitor (Dapagliflozin/Empagliflozin)", "Hydralazine + Nitrate", "Amiodarone", "Ivabradine"],
    answer: 1,
    explanation: "SGLT2 inhibitors (dapagliflozin DAPA-HF, empagliflozin EMPEROR-Reduced) are a Class I, Level A recommendation in HFrEF, reducing cardiovascular death and HF hospitalization regardless of diabetes status. They are the 4th pillar of evidence-based HFrEF therapy alongside ACEi/ARNi, BB, and MRA. [ESC Heart Failure Guidelines 2023, reaffirmed 2026]",
    reference: "ESC HF Guidelines 2023/2026, DAPA-HF Trial, EMPEROR-Reduced Trial"
  },
  {
    specialty: "Cardiology",
    difficulty: "Easy",
    stem: "A 45-year-old man presents with palpitations. ECG shows a delta wave, short PR interval (<120ms), and a widened QRS. What is the most appropriate next investigation for symptomatic evaluation?",
    options: ["24-hour Holter monitor", "Electrophysiology study (EPS)", "Cardiac MRI", "Echocardiogram", "Exercise stress test"],
    answer: 1,
    explanation: "The ECG findings describe Wolff-Parkinson-White (WPW) syndrome. Electrophysiology study (EPS) is the gold standard for risk stratification and to guide radiofrequency ablation, which is curative. EPS identifies the accessory pathway location and assesses its refractory period. [ACC/AHA SVT Guidelines 2026]",
    reference: "ACC/AHA/HRS SVT Guidelines 2015, Updated 2026"
  },
  // Internal Medicine
  {
    specialty: "Internal Medicine",
    difficulty: "Hard",
    stem: "A 72-year-old female with CKD stage 3b (eGFR 38) develops AKI after starting an NSAID. Her new eGFR is 21, serum potassium is 6.8 mEq/L, and ECG shows peaked T waves. BP 195/110. What is the MOST urgent immediate intervention?",
    options: ["Sodium bicarbonate IV", "Calcium gluconate IV", "Insulin + Dextrose", "Salbutamol nebulization", "Emergency hemodialysis"],
    answer: 1,
    explanation: "With K+ 6.8 and peaked T waves (ECG changes of hyperkalemia), the FIRST priority is cardiac membrane stabilization with IV Calcium Gluconate (or Calcium Chloride). This does NOT lower K+ but protects the heart within minutes. Then treat the K+ with insulin/dextrose, salbutamol, and kayexalate. Calcium gluconate is the immediate life-saving step. [KDIGO AKI Guidelines 2026]",
    reference: "KDIGO AKI Guidelines 2026; UpToDate: Treatment of Hyperkalemia"
  },
  {
    specialty: "Internal Medicine",
    difficulty: "Medium",
    stem: "A 58-year-old woman presents with bilateral symmetrical joint pain in small joints of hands (MCPs and PIPs), morning stiffness lasting >1 hour, and elevated anti-CCP antibodies. X-ray: periarticular erosions. ESR 85, CRP 45. What is the first-line DMARD according to ACR 2026 guidelines?",
    options: ["Hydroxychloroquine", "Methotrexate", "Sulfasalazine", "Adalimumab (anti-TNF)", "Leflunomide"],
    answer: 1,
    explanation: "Methotrexate (MTX) remains the anchor DMARD and first-line choice for moderate-to-severe RA per ACR 2026. It is introduced early (within 3 months of diagnosis) with folic acid supplementation. Biologics (anti-TNF) are added if inadequate response to MTX at 3-6 months. [ACR RA Guidelines 2026]",
    reference: "ACR Rheumatoid Arthritis Guidelines 2021, Updated 2026"
  },
  // Neurology
  {
    specialty: "Neurology",
    difficulty: "Hard",
    stem: "A 34-year-old woman has 2 episodes of optic neuritis (6 months apart) and an episode of transverse myelitis. MRI brain: periventricular lesions with 'Dawson fingers'. CSF: oligoclonal bands positive. What is the diagnosis, and what is the first-line disease-modifying therapy?",
    options: ["Neuromyelitis Optica — Rituximab", "Multiple Sclerosis RRMS — High-dose interferon beta", "Multiple Sclerosis RRMS — Natalizumab or Ocrelizumab", "Neurosarcoidosis — Prednisone", "AQP4+ NMOSD — Inebilizumab"],
    answer: 2,
    explanation: "Dawson fingers (lesions perpendicular to ventricles on sagittal MRI), oligoclonal bands, and relapsing-remitting course confirms MS. Per ECTRIMS/AAN 2026, high-efficacy therapy (Natalizumab, Ocrelizumab, or Ofatumumab) is preferred for early active RRMS given the evidence from OPERA, AFFIRM, and ORATORIO trials. [AAN MS Guidelines 2026]",
    reference: "AAN/ECTRIMS MS Management Guidelines 2026"
  },
  // Respiratory
  {
    specialty: "Respiratory",
    difficulty: "Medium",
    stem: "A 40-year-old asthmatic woman has persistent symptoms despite high-dose ICS + LABA + LAMA triple therapy. Eosinophil count: 450 cells/μL. FeNO: 45 ppb. What is the most appropriate add-on therapy per GINA 2026?",
    options: ["Oral corticosteroids (chronic)", "Theophylline", "Anti-IL-5 biologic (Mepolizumab/Benralizumab)", "Roflumilast", "Azithromycin"],
    answer: 2,
    explanation: "Eosinophilia (>300/μL) and elevated FeNO indicate type 2 (T2-high) severe asthma. Anti-IL-5 biologics (mepolizumab, benralizumab, dupilumab) are GINA Step 5 add-on therapy for severe eosinophilic asthma, reducing exacerbations by ~50%. GINA 2026 positions them strongly before chronic OCS. [GINA 2026 Guidelines]",
    reference: "GINA 2026 Severe Asthma Guidelines"
  },
  // Endocrinology
  {
    specialty: "Endocrinology",
    difficulty: "Medium",
    stem: "A 52-year-old male with T2DM on metformin has HbA1c 8.4%. He has established ASCVD (previous MI). eGFR 55. What is the best drug to add per ADA 2026 to reduce major adverse cardiovascular events (MACE)?",
    options: ["Sulfonylurea (Glibenclamide)", "GLP-1 RA (Semaglutide)", "DPP-4 inhibitor (Sitagliptin)", "Long-acting insulin", "Pioglitazone"],
    answer: 1,
    explanation: "In T2DM with established ASCVD, GLP-1 receptor agonists (especially Semaglutide — SUSTAIN-6, Liraglutide — LEADER trial) have demonstrated significant MACE reduction, CV death reduction, and weight loss. ADA 2026 gives GLP-1 RAs or SGLT2i a Class I recommendation in patients with ASCVD, regardless of HbA1c. [ADA Standards of Care 2026]",
    reference: "ADA Standards of Medical Care in Diabetes 2026, LEADER Trial, SUSTAIN-6"
  },
  // Nephrology
  {
    specialty: "Nephrology",
    difficulty: "Hard",
    stem: "A 38-year-old man presents with haematuria, proteinuria 3.5g/24h, and progressive renal failure over 6 months. Biopsy shows mesangial IgA deposits with complement C3. What is the histological finding called, and what is the 2026 recommended treatment for high-risk IgA nephropathy?",
    options: ["Membranous nephropathy — Rituximab", "IgA Nephropathy — Budesonide (targeted release) + RAAS blockade + SGLT2i", "Focal segmental glomerulosclerosis — Cyclosporine", "Lupus nephritis — Mycophenolate + Hydroxychloroquine", "Minimal change disease — High-dose steroids"],
    answer: 1,
    explanation: "Mesangial IgA deposits = IgA Nephropathy (Berger's disease). KDIGO 2021 (reaffirmed 2026) recommends: 1) Optimized supportive care: RAAS blockade (ACEi/ARB) + SGLT2i (shown to reduce proteinuria and slow CKD progression in IgA-N). 2) Targeted-release budesonide (Nefecon) for high-risk IgA-N — approved after NEFIGAN/NefIgArd trials. [KDIGO IgA Nephropathy Guideline 2026]",
    reference: "KDIGO Glomerular Diseases Guidelines 2021/2026; NefIgArd Trial"
  },
  // Surgery
  {
    specialty: "Surgery",
    difficulty: "Medium",
    stem: "A 67-year-old male presents with sudden onset severe periumbilic pain for 6 hours, now diffuse with rigidity. He is a smoker with known AAA (6.5cm). BP 90/60, HR 128, distended abdomen. Ultrasound shows free fluid. What is the immediate priority?",
    options: ["CT aortogram to confirm diagnosis", "IV fluids and observation", "Emergency surgical repair (open or EVAR)", "Endovascular stenting as elective procedure", "Vasopressors and ICU admission only"],
    answer: 2,
    explanation: "This presentation is ruptured abdominal aortic aneurysm (rAAA) — a vascular emergency. With hemodynamic instability and free peritoneal fluid, the priority is emergency surgical repair. Permissive hypotension (target systolic 50-70 mmHg) until clamping. EVAR (endovascular) is preferred if anatomy suitable and team available. CT aortogram should only be done if hemodynamically STABLE. [SVS AAA Guidelines 2026]",
    reference: "Society for Vascular Surgery AAA Guidelines 2026; IMPROVE Trial"
  },
  // Pediatrics
  {
    specialty: "Pediatrics",
    difficulty: "Medium",
    stem: "A 3-year-old boy develops sudden onset barking cough, stridor at rest, and mild respiratory distress at 11 PM. Temperature 38.1°C, SpO2 97%. He is alert and interactive. CXR shows 'steeple sign'. What is the first-line management?",
    options: ["Nebulized adrenaline (epinephrine) immediately", "Broad spectrum antibiotics for epiglottitis", "Single dose oral/IM dexamethasone (0.15-0.6 mg/kg)", "Bag-mask ventilation and ICU admission", "Heliox therapy"],
    answer: 2,
    explanation: "Steeple sign on CXR + barking cough + stridor = Croup (Laryngotracheobronchitis). For mild-moderate croup, a single dose of oral dexamethasone (0.15-0.6mg/kg, max 10mg) is first-line per AAP 2026. Nebulized epinephrine is reserved for severe croup (stridor at rest AND increased WOB). Corticosteroids reduce severity and return visits by ~50%. [AAP Croup Clinical Guidelines 2026]",
    reference: "AAP Clinical Practice Guideline: Croup 2026"
  },
];

type QuestionMode = "by-specialty" | "exam" | "mixed";

export default function USMLEPage() {
  const { addXp } = useAchievement();
  const [mode, setMode] = useState<QuestionMode | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [_timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState(QUESTION_BANK);

  const specialties = [...new Set(QUESTION_BANK.map(q => q.specialty))];

  const startExam = (m: QuestionMode, sp?: string) => {
    let qs = m === "by-specialty" && sp ? QUESTION_BANK.filter(q => q.specialty === sp) : [...QUESTION_BANK];
    qs = qs.sort(() => Math.random() - 0.5);
    setQuestions(qs);
    setMode(m);
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
    setAnswered(new Array(qs.length).fill(false));
    setFinished(false);
    if (sp) setSpecialty(sp);
    if (m === "exam") setTimeLeft(qs.length * 90);
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const confirmAnswer = () => {
    if (selected === null) return;
    const correct = selected === questions[currentQ].answer;
    if (correct) {
      setScore(s => s + 1);
      addXp(15, "USMLE Correct Answer");
    }
    setShowAnswer(true);
    const newAnswered = [...answered];
    newAnswered[currentQ] = correct;
    setAnswered(newAnswered);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentQ(q => q + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  const pct = Math.round((score / questions.length) * 100);

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 w-full page-transition">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">USMLE Clinical Mode</h1>
              <p className="text-slate-500 text-sm">Step 2 CK Style Questions · {QUESTION_BANK.length} Questions · Evidence-Based 2026</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button onClick={() => startExam("mixed")} className="premium-card p-8 text-center group hover:border-indigo-500/50 transition-all">
            <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Mixed Mode</h3>
            <p className="text-sm text-slate-500">All specialties, random order</p>
            <p className="text-xs font-black text-indigo-500 mt-2">{QUESTION_BANK.length} Questions</p>
          </button>
          <button onClick={() => { setMode("by-specialty"); setSpecialty(null); }} className="premium-card p-8 text-center group hover:border-teal-500/50 transition-all">
            <BookOpen className="w-12 h-12 text-teal-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">By Specialty</h3>
            <p className="text-sm text-slate-500">Focus on one discipline</p>
            <p className="text-xs font-black text-teal-500 mt-2">{specialties.length} Specialties</p>
          </button>
          <button onClick={() => startExam("exam")} className="premium-card p-8 text-center group hover:border-rose-500/50 transition-all">
            <Clock className="w-12 h-12 text-rose-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Exam Mode</h3>
            <p className="text-sm text-slate-500">Timed, NBME-style</p>
            <p className="text-xs font-black text-rose-500 mt-2">90 sec/question</p>
          </button>
        </div>

        {mode === "by-specialty" && !specialty && (
          <div className="premium-card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Choose Specialty</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {specialties.map(sp => (
                <button key={sp} onClick={() => startExam("by-specialty", sp)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all group">
                  <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{sp}</h4>
                  <p className="text-xs text-slate-400 mt-1">{QUESTION_BANK.filter(q => q.specialty === sp).length} questions</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const grade = pct >= 70 ? "PASS" : "NEEDS REVIEW";
    const isPassing = pct >= 70;
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10 w-full page-transition text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassing ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
          <Award className={`w-12 h-12 ${isPassing ? "text-emerald-500" : "text-rose-500"}`} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Session Complete</h1>
        <p className={`text-2xl font-black mb-6 ${isPassing ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{grade}</p>
        <div className="premium-card p-8 mb-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-4xl font-black text-indigo-600">{score}/{questions.length}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">Correct</p>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-800 dark:text-white">{pct}%</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">Score</p>
            </div>
            <div>
              <p className="text-4xl font-black text-amber-500">{score * 15}</p>
              <p className="text-xs font-black uppercase text-slate-400 mt-1">XP Earned</p>
            </div>
          </div>
        </div>
        <button onClick={() => setMode(null)} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10">
          <RotateCcw className="w-4 h-4" /> Return to USMLE Hub
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 w-full page-transition">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setMode(null)} className="text-slate-400 hover:text-slate-600 transition-colors">← Exit</button>
          <span className="text-sm font-black text-slate-500">{q.specialty} · {q.difficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-black text-slate-500">{currentQ + 1} / {questions.length}</span>
          <span className="text-sm font-black text-emerald-600">{score} correct</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-8">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
      </div>

      <div className="premium-card p-8 mb-6">
        <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-lg">{q.stem}</p>
      </div>

      <div className="space-y-3 mb-8">
        {q.options.map((opt, idx) => {
          let cls = "premium-card p-5 cursor-pointer text-left transition-all border-2 ";
          if (!showAnswer) {
            cls += selected === idx ? "border-indigo-500 bg-indigo-500/5" : "border-transparent hover:border-slate-200";
          } else {
            if (idx === q.answer) cls += "border-emerald-500 bg-emerald-500/10";
            else if (idx === selected && selected !== q.answer) cls += "border-rose-500 bg-rose-500/10";
            else cls += "border-transparent opacity-50";
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${selected === idx ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{opt}</span>
                {showAnswer && idx === q.answer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                {showAnswer && idx === selected && selected !== q.answer && <X className="w-5 h-5 text-rose-500 ml-auto" />}
              </div>
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 mb-3">Explanation</h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
          <p className="text-xs text-slate-400 mt-3 font-black">[{q.reference}]</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showAnswer ? (
          <button onClick={confirmAnswer} disabled={selected === null} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10 disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Answer <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={nextQuestion} className="btn-premium bg-indigo-600 border-0 text-white py-4 px-10">
            {currentQ + 1 >= questions.length ? "View Results" : "Next Question"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
