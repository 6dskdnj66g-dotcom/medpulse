"use client";

import React, { useState } from "react";
import { Calculator, Heart, Activity, Droplets, Scale, Brain, ChevronDown, ChevronUp, CheckCircle, Info, Download, Save, Loader2 } from "lucide-react";
import { exportMedicalReport } from "@/core/utils/pdfExport";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { supabase } from "@/core/database/supabase";

// ── Calculator Definitions ─────────────────────────────────────────────────
const CALCULATORS = [
  { id: "curb65", label: "CURB-65", subtitle: "Pneumonia Severity", icon: Activity, color: "sky", desc: "Predicts 30-day mortality in community-acquired pneumonia" },
  { id: "chadsvasc", label: "CHA₂DS₂-VASc", subtitle: "AF Stroke Risk", icon: Heart, color: "rose", desc: "Stroke risk in non-valvular atrial fibrillation" },
  { id: "wells_dvt", label: "Wells DVT", subtitle: "DVT Probability", icon: Droplets, color: "indigo", desc: "Pre-test probability for deep vein thrombosis" },
  { id: "wells_pe", label: "Wells PE", subtitle: "PE Probability", icon: Droplets, color: "orange", desc: "Clinical probability for pulmonary embolism" },
  { id: "meld", label: "MELD Score", subtitle: "Liver Disease Severity", icon: Activity, color: "emerald", desc: "Model for End-Stage Liver Disease — transplant prioritization" },
  { id: "egfr", label: "eGFR (CKD-EPI)", subtitle: "Kidney Function", icon: Droplets, color: "teal", desc: "Estimated glomerular filtration rate — 2021 CKD-EPI equation" },
  { id: "bmi", label: "BMI Calculator", subtitle: "Body Mass Index", icon: Scale, color: "violet", desc: "Body Mass Index with WHO Classification" },
  { id: "nihss", label: "NIHSS", subtitle: "Stroke Severity", icon: Brain, color: "purple", desc: "NIH Stroke Scale — quantifies neurological deficit" },
];

// ── Result Component ───────────────────────────────────────────────────────
// ── Result Wrapper ──────────────────────────────────────────────────────────
function CalcResultWrapper({ id, title, score, risk, label, color, rawData }: { 
  id: string; 
  title: string;
  score: number | string; 
  label: string; 
  color: string; 
  risk: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData: any;
}) {
  const { user } = useSupabaseAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const colors: Record<string, string> = {
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    yellow: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    red: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    blue: "bg-[var(--color-vital-cyan)]/10 border-[var(--color-vital-cyan)]/30 text-[var(--color-vital-cyan)] drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  };

  return (
    <div className="space-y-4">
      <div id={id} className={`rounded-[24px] border p-6 md:p-8 backdrop-blur-md transition-all duration-500 ${colors[color] || colors.blue}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-80 mb-1">{label}</p>
            <p className="text-5xl md:text-6xl font-black tracking-tight">{score}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                setIsExporting(true);
                await exportMedicalReport(id, { title: `${title} - Clinical Result`, filename: `${title.replace(/\s+/g, '_')}_Result` });
                setIsExporting(false);
              }}
              disabled={isExporting}
              className="p-3 rounded-2xl bg-[var(--bg-0)]/40 hover:bg-[var(--bg-0)]/80 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 shadow-sm"
              title="Download PDF Document"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
            {user && (
              <button
                onClick={async () => {
                  setIsSaving(true);
                  const { error } = await supabase.from("clinical_records").insert({
                    user_id: user.id,
                    type: "calc_result",
                    title: `${title}: Score ${score}`,
                    content: { score, risk, label, title, inputs: rawData },
                  });
                  if (!error) setSaved(true);
                  setTimeout(() => setSaved(false), 3000);
                  setIsSaving(false);
                }}
                disabled={isSaving || saved}
                className="p-3 rounded-2xl bg-[var(--bg-0)]/40 hover:bg-[var(--bg-0)]/80 backdrop-blur-sm border border-white/10 hover:scale-105 transition-all duration-300 shadow-sm"
                title="Save Profile Record"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Save className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
        <div className="pt-4 border-t border-black/5 dark:border-white/10">
          <p className="text-base md:text-lg font-extrabold">{risk}</p>
        </div>
      </div>
    </div>
  );
}

// ── Field Component ────────────────────────────────────────────────────────
function CField({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-2xl px-4 py-3 text-[var(--text-primary)] font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
      />
    </div>
  );
}

function CCheck({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left w-full ${
        value
          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300"
          : "bg-[var(--bg-0)] border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-tertiary)]/70"
      }`}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${value ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
        {value && <CheckCircle className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

// ── Individual Calculators ─────────────────────────────────────────────────

function CURB65Calculator() {
  const [confusion, setConfusion] = useState(false);
  const [bun, setBun] = useState(false);
  const [rr, setRr] = useState(false);
  const [bp, setBp] = useState(false);
  const [age, setAge] = useState(false);

  const score = [confusion, bun, rr, bp, age].filter(Boolean).length;
  const risk = score <= 1 ? { label: "LOW RISK", color: "green", management: "Outpatient treatment possible. Mortality: <3%" }
    : score === 2 ? { label: "MODERATE RISK", color: "yellow", management: "Consider short inpatient admission or supervised outpatient. Mortality: ~9%" }
    : { label: "HIGH RISK", color: "red", management: "Inpatient hospitalization required. Consider ICU if score ≥4. Mortality: 15-40%" };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <CCheck label="Confusion (new onset)" value={confusion} onChange={setConfusion} />
        <CCheck label="BUN >7 mmol/L (>19 mg/dL)" value={bun} onChange={setBun} />
        <CCheck label="Respiratory Rate ≥30/min" value={rr} onChange={setRr} />
        <CCheck label="BP <90 systolic or ≤60 diastolic" value={bp} onChange={setBp} />
        <CCheck label="Age ≥65 years" value={age} onChange={setAge} />
      </div>
      <CalcResultWrapper 
        id="curb65-result" 
        title="CURB-65"
        score={score} 
        label="CURB-65 Score" 
        color={risk.color} 
        risk={`${risk.label} — ${risk.management}`}
        rawData={{ confusion, bun, rr, bp, age }}
      />
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: IDSA/ATS 2026 Community-Acquired Pneumonia Guidelines]</p>
    </div>
  );
}

function CHADSVASCCalculator() {
  const [hf, setHf] = useState(false);
  const [htn, setHtn] = useState(false);
  const [age75, setAge75] = useState(false);
  const [dm, setDm] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [vascular, setVascular] = useState(false);
  const [age65, setAge65] = useState(false);
  const [female, setFemale] = useState(false);

  const score = [hf, htn, dm, vascular, age65, female].filter(Boolean).length + (age75 ? 2 : 0) + (stroke ? 2 : 0);
  const risk = score === 0 ? { label: "LOW", color: "green", rec: "No anticoagulation recommended" }
    : score === 1 ? { label: "LOW-MODERATE", color: "yellow", rec: "Consider anticoagulation (men). No therapy for women-only score of 1" }
    : { label: "HIGH", color: "red", rec: "Oral anticoagulation recommended (DOAC preferred over warfarin)" };
  const annualRisk = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 6.7, 15.2][Math.min(score, 9)];

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <CCheck label="Congestive Heart Failure / LV dysfunction (+1)" value={hf} onChange={setHf} />
        <CCheck label="Hypertension (+1)" value={htn} onChange={setHtn} />
        <CCheck label="Age ≥75 years (+2)" value={age75} onChange={setAge75} />
        <CCheck label="Diabetes Mellitus (+1)" value={dm} onChange={setDm} />
        <CCheck label="Stroke / TIA / Thromboembolism history (+2)" value={stroke} onChange={setStroke} />
        <CCheck label="Vascular Disease (MI, PAD, aortic plaque) (+1)" value={vascular} onChange={setVascular} />
        <CCheck label="Age 65–74 years (+1)" value={age65} onChange={setAge65} />
        <CCheck label="Female sex (+1)" value={female} onChange={setFemale} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <CalcResultWrapper 
          id="chadsvasc-result" 
          title="CHA₂DS₂-VASc"
          score={score} 
          label="CHA₂DS₂-VASc Score" 
          color={risk.color} 
          risk={`${risk.label}: ${risk.rec} (Annual Risk: ${annualRisk}%)`}
          rawData={{ hf, htn, age75, dm, stroke, vascular, age65, female }}
        />
      </div>
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: ESC 2026 Atrial Fibrillation Guidelines]</p>
    </div>
  );
}

function WellsDVTCalculator() {
  const fields = [
    { label: "Active cancer (+1)", key: "cancer" },
    { label: "Paralysis/plaster of lower extremity (+1)", key: "paralysis" },
    { label: "Bedridden >3 days or surgery in past 12 weeks (+1)", key: "bedrest" },
    { label: "Localized tenderness along deep venous system (+1)", key: "tenderness" },
    { label: "Entire leg swollen (+1)", key: "swollen" },
    { label: "Calf swelling >3cm vs asymptomatic side (+1)", key: "calf" },
    { label: "Collateral superficial veins (non-varicose) (+1)", key: "collateral" },
    { label: "Previously documented DVT (+1)", key: "prev" },
    { label: "Alternative diagnosis ≥ as likely as DVT (-2)", key: "alt" },
  ];

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const score = Object.entries(checks).reduce((acc, [key, val]) => {
    if (!val) return acc;
    return acc + (key === "alt" ? -2 : 1);
  }, 0);
  const risk = score <= 0 ? { label: "LOW PROBABILITY", color: "green", rec: "D-dimer. If negative → DVT excluded" }
    : score <= 2 ? { label: "MODERATE PROBABILITY", color: "yellow", rec: "D-dimer or compression ultrasound" }
    : { label: "HIGH PROBABILITY", color: "red", rec: "Compression ultrasound immediately. Anticoagulate while awaiting" };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {fields.map(f => (
          <CCheck key={f.key} label={f.label} value={!!checks[f.key]} onChange={v => setChecks(prev => ({ ...prev, [f.key]: v }))} />
        ))}
      </div>
      <CalcResultWrapper 
        id="wells-dvt-result" 
        title="Wells DVT"
        score={score} 
        label="Wells DVT Score" 
        color={risk.color} 
        risk={`${risk.label} — ${risk.rec}`}
        rawData={checks}
      />
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: CHEST/ISTH Antithrombotic Guidelines 2026]</p>
    </div>
  );
}

function WellsPECalculator() {
  const fields = [
    { label: "Clinical signs/symptoms of DVT (+3)", key: "dvt", pts: 3 },
    { label: "PE is #1 diagnosis or equally likely (+3)", key: "pe1", pts: 3 },
    { label: "HR >100 bpm (+1.5)", key: "hr", pts: 1.5 },
    { label: "Immobilization ≥3 days or surgery in past 4 weeks (+1.5)", key: "immo", pts: 1.5 },
    { label: "Previous DVT or PE (+1.5)", key: "prev", pts: 1.5 },
    { label: "Hemoptysis (+1)", key: "hemo", pts: 1 },
    { label: "Malignancy (treatment within 6 months or palliative) (+1)", key: "cancer", pts: 1 },
  ];

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const score = fields.reduce((acc, f) => acc + (checks[f.key] ? f.pts : 0), 0);
  const risk = score < 2 ? { label: "LOW PROBABILITY", color: "green", rec: "D-dimer. PERC rule if low pre-test probability" }
    : score <= 6 ? { label: "MODERATE PROBABILITY", color: "yellow", rec: "CT pulmonary angiography (CTPA)" }
    : { label: "HIGH PROBABILITY", color: "red", rec: "CTPA urgently. Consider anticoagulation before imaging" };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {fields.map(f => (
          <CCheck key={f.key} label={f.label} value={!!checks[f.key]} onChange={v => setChecks(prev => ({ ...prev, [f.key]: v }))} />
        ))}
      </div>
      <CalcResultWrapper 
        id="wells-pe-result" 
        title="Wells PE"
        score={score.toFixed(1)} 
        label="Wells PE Score" 
        color={risk.color} 
        risk={`${risk.label} — ${risk.rec}`}
        rawData={checks}
      />
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: European Society of Cardiology PE Guidelines 2026]</p>
    </div>
  );
}

function MELDCalculator() {
  const [creatinine, setCreatinine] = useState(1.0);
  const [bilirubin, setBilirubin] = useState(1.0);
  const [inr, setInr] = useState(1.0);
  const [sodium, setSodium] = useState(138);

  const meld = Math.round(
    10 * (0.957 * Math.log(Math.max(creatinine, 1)) + 0.378 * Math.log(Math.max(bilirubin, 1)) + 1.12 * Math.log(Math.max(inr, 1))) + 6.43
  );
  const meldSodium = Math.min(Math.max(meld + 1.32 * (137 - sodium) - 0.033 * meld * (137 - sodium), meld), 40);
  const mortality = meld < 10 ? "1.9%" : meld < 20 ? "6–20%" : meld < 30 ? "20–76%" : meld < 40 ? "52–82%" : ">71%";
  const color = meld < 10 ? "green" : meld < 20 ? "yellow" : meld < 30 ? "orange" : "red";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <CField label="Creatinine (mg/dL)" value={creatinine} onChange={setCreatinine} min={0.1} max={20} />
        <CField label="Bilirubin (mg/dL)" value={bilirubin} onChange={setBilirubin} min={0.1} max={50} />
        <CField label="INR" value={inr} onChange={setInr} min={1} max={10} />
        <CField label="Sodium (mEq/L)" value={sodium} onChange={setSodium} min={100} max={150} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <CalcResultWrapper 
          id="meld-result" 
          title="MELD/MELD-Na"
          score={`${meld} / ${Math.round(meldSodium)}`} 
          label="MELD / MELD-Na" 
          color={color} 
          risk={`90-Day Mortality: ${mortality}. MELD-Na used for transplant prioritization.`}
          rawData={{ creatinine, bilirubin, inr, sodium }}
        />
      </div>
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: AASLD/UNOS MELD-Na 2026 Guidelines]</p>
    </div>
  );
}

function EGFRCalculator() {
  const [age, setAge] = useState(50);
  const [creatinine, setCreatinine] = useState(1.0);
  const [female, setFemale] = useState(false);

  const k = female ? 0.7 : 0.9;
  const a = female ? -0.241 : -0.302;
  const cr = creatinine / k;
  const egfr = Math.round(142 * Math.pow(Math.min(cr, 1), a) * Math.pow(Math.max(cr, 1), -1.200) * Math.pow(0.9938, age) * (female ? 1.012 : 1));
  const stage = egfr >= 90 ? { s: "G1 — Normal", color: "green" }
    : egfr >= 60 ? { s: "G2 — Mildly Decreased", color: "green" }
    : egfr >= 45 ? { s: "G3a — Mildly-Moderately Decreased", color: "yellow" }
    : egfr >= 30 ? { s: "G3b — Moderately-Severely Decreased", color: "orange" }
    : egfr >= 15 ? { s: "G4 — Severely Decreased", color: "orange" }
    : { s: "G5 — Kidney Failure", color: "red" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <CField label="Age (years)" value={age} onChange={setAge} min={18} max={110} />
        <CField label="Serum Creatinine (mg/dL)" value={creatinine} onChange={setCreatinine} min={0.1} max={20} />
      </div>
      <CCheck label="Female sex" value={female} onChange={setFemale} />
      <CalcResultWrapper 
        id="egfr-result" 
        title="eGFR (CKD-EPI)"
        score={`${egfr} mL/min/1.73m²`} 
        label="eGFR (CKD-EPI 2021)" 
        color={stage.color} 
        risk={`CKD Stage: ${stage.s}`}
        rawData={{ age, creatinine, female }}
      />
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-xs text-[var(--text-tertiary)] space-y-1">
        <p className="font-black text-[var(--text-secondary)] dark:text-slate-300 mb-2">Drug Dose Adjustment Thresholds:</p>
        <p>• Metformin: Avoid if eGFR &lt;30, reduce if &lt;45</p>
        <p>• DOACs: Check individual agent — most avoid if eGFR &lt;15-30</p>
        <p>• NSAIDS: Avoid if eGFR &lt;30</p>
        <p>• Contrast: Extra caution if eGFR &lt;45</p>
      </div>
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: KDIGO CKD Guidelines 2026 · CKD-EPI 2021 Equation]</p>
    </div>
  );
}

function BMICalculator() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);

  const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
  const cat = bmi < 18.5 ? { label: "Underweight", color: "blue", rec: "Nutritional assessment. Consider underlying pathology." }
    : bmi < 25 ? { label: "Normal Weight", color: "green", rec: "Maintain healthy lifestyle. CVD risk: Low" }
    : bmi < 30 ? { label: "Overweight", color: "yellow", rec: "Lifestyle modification. Screen for metabolic syndrome." }
    : bmi < 35 ? { label: "Obesity Class I", color: "orange", rec: "Medical intervention. Consider pharmacotherapy." }
    : bmi < 40 ? { label: "Obesity Class II", color: "red", rec: "Bariatric surgery evaluation. Intensive management." }
    : { label: "Obesity Class III (Severe)", color: "red", rec: "Bariatric surgery strongly indicated. Multidisciplinary team." };
  const ibw = (f: boolean) => f ? 45.5 + 2.3 * ((height * 0.393701) - 60) : 50 + 2.3 * ((height * 0.393701) - 60);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <CField label="Weight (kg)" value={weight} onChange={setWeight} min={20} max={300} />
        <CField label="Height (cm)" value={height} onChange={setHeight} min={100} max={250} />
      </div>
      <CalcResultWrapper 
        id="bmi-result" 
        title="BMI"
        score={bmi} 
        label="BMI Result" 
        color={cat.color} 
        risk={`${cat.label} — ${cat.rec}`}
        rawData={{ weight, height }}
      />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
          <p className="text-xs font-black uppercase text-[var(--text-tertiary)]/70 mb-1">Ideal Body Weight (Male)</p>
          <p className="font-black text-[var(--text-primary)]">{Math.round(ibw(false))} kg</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
          <p className="text-xs font-black uppercase text-[var(--text-tertiary)]/70 mb-1">Ideal Body Weight (Female)</p>
          <p className="font-black text-[var(--text-primary)]">{Math.round(ibw(true))} kg</p>
        </div>
      </div>
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: WHO BMI Classification 2026]</p>
    </div>
  );
}

function NIHSSCalculator() {
  const domains = [
    { label: "Level of consciousness", key: "loc", max: 3 },
    { label: "LOC questions (month, age)", key: "locq", max: 2 },
    { label: "LOC commands (close eyes, grip)", key: "locc", max: 2 },
    { label: "Best gaze", key: "gaze", max: 2 },
    { label: "Visual fields", key: "visual", max: 3 },
    { label: "Facial palsy", key: "facial", max: 3 },
    { label: "Motor arm left", key: "armL", max: 4 },
    { label: "Motor arm right", key: "armR", max: 4 },
    { label: "Motor leg left", key: "legL", max: 4 },
    { label: "Motor leg right", key: "legR", max: 4 },
    { label: "Limb ataxia", key: "ataxia", max: 2 },
    { label: "Sensory", key: "sensory", max: 2 },
    { label: "Best language", key: "language", max: 3 },
    { label: "Dysarthria", key: "dysarthria", max: 2 },
    { label: "Extinction/Inattention", key: "neglect", max: 2 },
  ];

  const [scores, setScores] = useState<Record<string, number>>({});
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const sev = total === 0 ? { label: "No Stroke", color: "green" }
    : total <= 4 ? { label: "Minor Stroke", color: "yellow" }
    : total <= 15 ? { label: "Moderate Stroke", color: "orange" }
    : total <= 20 ? { label: "Moderate-Severe", color: "red" }
    : { label: "Severe Stroke", color: "red" };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {domains.map(d => (
          <div key={d.key} className="flex items-center gap-4 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-2xl p-4">
            <p className="flex-1 text-sm font-bold text-[var(--text-secondary)] dark:text-slate-300">{d.label}</p>
            <div className="flex gap-1">
              {Array.from({ length: d.max + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScores(prev => ({ ...prev, [d.key]: i }))}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${scores[d.key] === i ? "bg-indigo-500 text-white" : "bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:bg-indigo-100"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <CalcResultWrapper 
        id="nihss-result" 
        title="NIHSS"
        score={total} 
        label="NIHSS Total Score" 
        color={sev.color} 
        risk={sev.label}
        rawData={scores}
      />
      <p className="text-xs text-[var(--text-tertiary)]/70 font-bold">[Evidence: AHA/ASA Stroke Guidelines 2026]</p>
    </div>
  );
}

const CALC_COMPONENTS: Record<string, React.FC> = {
  curb65: CURB65Calculator,
  chadsvasc: CHADSVASCCalculator,
  wells_dvt: WellsDVTCalculator,
  wells_pe: WellsPECalculator,
  meld: MELDCalculator,
  egfr: EGFRCalculator,
  bmi: BMICalculator,
  nihss: NIHSSCalculator,
};

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CalculatorsPage() {
  useSupabaseAuth();
  const [active, setActive] = useState<string | null>(null);
  const colorMap: Record<string, string> = {
    sky: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    teal: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10 md:mb-12">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--color-vital-cyan)] to-[var(--color-clinical-violet)] rounded-[20px] flex items-center justify-center shadow-xl transform -rotate-2">
            <Calculator className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
               Clinical <span className="brand-gradient-text">Calculators</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">Evidence-based medical models updated to April 2026 guidelines</p>
          </div>
        </div>
        <div className="flex items-start md:items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl max-w-2xl shadow-sm backdrop-blur-sm">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 md:mt-0" />
          <p className="text-[13px] md:text-sm font-bold text-amber-600 dark:text-amber-400">For clinical decision support only. Always apply clinical judgment and consult current guidelines.</p>
        </div>
      </div>

      <div className="space-y-5">
        {CALCULATORS.map(calc => {
          const Icon = calc.icon;
          const isOpen = active === calc.id;
          const CalcComponent = CALC_COMPONENTS[calc.id];
          const colors = colorMap[calc.color] || colorMap.indigo;

          return (
            <div key={calc.id} className={`medpulse-card overflow-hidden transition-all duration-500 ${isOpen ? 'ring-2 ring-[var(--border-subtle)] shadow-xl scale-[1.01]' : 'hover:shadow-md'}`}>
              <button
                className="w-full flex items-center gap-5 p-5 md:p-6 text-left outline-none"
                onClick={() => setActive(isOpen ? null : calc.id)}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border shadow-sm ${colors}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)]">{calc.label}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-0.5 mb-1.5">{calc.subtitle}</p>
                  <p className="text-[13px] md:text-sm text-[var(--text-secondary)] font-medium line-clamp-1 md:line-clamp-none">{calc.desc}</p>
                </div>
                <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[var(--color-vital-cyan)]/10 text-[var(--color-vital-cyan)]' : 'bg-[var(--bg-2)] text-[var(--text-tertiary)]'}`}>
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>
              {isOpen && CalcComponent && (
                <div className="px-5 md:px-8 pb-8 border-t border-[var(--border-subtle)] pt-8 bg-[var(--bg-0)]/50">
                  <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
                    <CalcComponent />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

