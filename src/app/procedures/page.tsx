"use client";

import { useState } from "react";
import { Video, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

interface Procedure {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  indications: string[];
  contraindications: string[];
  steps: string[];
  complications: string[];
  youtubeId?: string;
}

const PROCEDURES: Procedure[] = [
  {
    id: "central-line",
    nameEn: "Central Venous Line Insertion (IJV)",
    nameAr: "تركيب خط وريدي مركزي (الوريد الوداجي)",
    category: "Vascular Access",
    indications: ["CVP monitoring", "Vasopressor infusion", "Lack of peripheral access", "TPN administration"],
    contraindications: ["Coagulopathy (INR >1.5, platelets <50k) — relative", "Active skin infection at site", "Contralateral pneumothorax"],
    steps: [
      "Position: Trendelenburg 15°, head turned contralaterally",
      "Identify landmarks: triangle between SCM heads and clavicle",
      "Ultrasound-guided (preferred): identify IJV and carotid",
      "Sterile prep and drape, local anaesthesia",
      "Seldinger technique: needle → guidewire → dilator → catheter",
      "Confirm blood return from all lumens, flush, secure",
      "CXR post-procedure to confirm tip position and exclude pneumothorax",
    ],
    complications: ["Arterial puncture", "Pneumothorax", "Haemothorax", "Air embolism", "Line infection (CLABSI)"],
  },
  {
    id: "lp",
    nameEn: "Lumbar Puncture",
    nameAr: "البزل القطني",
    category: "Neurological",
    indications: ["Suspected meningitis/encephalitis", "SAH workup (after normal CT)", "CSF pressure measurement", "Intrathecal drug delivery"],
    contraindications: ["Raised ICP with focal signs (herniation risk)", "Coagulopathy", "Skin infection at site", "Suspected spinal cord tumour"],
    steps: [
      "Position: lateral decubitus with knees drawn up (fetal) OR seated hunched forward",
      "Identify L3/L4 or L4/L5 interspace (iliac crest level)",
      "Sterile prep and drape, local anaesthesia to skin and subcutaneous tissue",
      "Insert spinal needle at midline, bevel up, slight cephalad angle",
      "Advance through ligamentum flavum — feel 'give' when entering subarachnoid space",
      "Stylet out → CSF flows freely → measure opening pressure",
      "Collect 3-4 tubes (1-2 mL each) for cell count, protein, glucose, culture, oligoclonal bands",
      "Replace stylet before removing needle",
    ],
    complications: ["Post-LP headache (20-30%)", "Backache", "Bleeding (epidural haematoma)", "Infection", "Tonsillar herniation (if ICP raised)"],
  },
  {
    id: "abg",
    nameEn: "Arterial Blood Gas (ABG) Draw",
    nameAr: "سحب عينة غاز الدم الشرياني",
    category: "Diagnostics",
    indications: ["Respiratory failure assessment", "Acid-base disorders", "Monitoring ventilated patients"],
    contraindications: ["Absent collateral circulation (Allen test negative)", "AV fistula in same arm", "Local infection"],
    steps: [
      "Perform modified Allen test: occlude radial + ulnar → release ulnar → hand should pink up within 7 seconds",
      "Position wrist extended 30-60°, palpate radial pulse",
      "Clean skin with alcohol swab",
      "Insert ABG needle (pre-heparinized syringe) at 45° angle, bevel up",
      "Arterial pressure will fill syringe spontaneously (2-3 mL)",
      "Withdraw needle, immediate firm pressure for 5 minutes (10 min if anticoagulated)",
      "Remove air bubbles, cap syringe, label, process within 15 minutes",
    ],
    complications: ["Haematoma", "Arterial spasm", "Vasovagal episode", "Infection (rare)"],
  },
];

export default function ProceduresPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [selected, setSelected] = useState<Procedure | null>(null);

  if (selected) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <button
          onClick={() => setSelected(null)}
          className="mb-6 text-[var(--color-medical-indigo)] font-bold text-sm flex items-center gap-1 hover:underline"
        >
          ← {isAr ? "العودة" : "Back"}
        </button>

        <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1">
          {isAr ? selected.nameAr : selected.nameEn}
        </h1>
        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-6">
          {selected.category}
        </span>

        <div className="space-y-5">
          {[
            { icon: CheckCircle, title: isAr ? "المؤشرات" : "Indications", items: selected.indications, color: "text-emerald-500" },
            { icon: AlertTriangle, title: isAr ? "موانع الاستعمال" : "Contraindications", items: selected.contraindications, color: "text-rose-500" },
          ].map(({ icon: Icon, title, items, color }) => (
            <div key={title} className="medpulse-card p-5">
              <div className={`flex items-center gap-2 mb-3 font-black text-sm ${color}`}>
                <Icon className="w-4 h-4" />
                {title}
              </div>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] font-medium flex gap-2">
                    <span className="text-[var(--text-tertiary)] flex-shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="medpulse-card p-5">
            <p className="font-black text-sm text-[var(--color-medical-indigo)] mb-3">
              {isAr ? "الخطوات" : "Steps"}
            </p>
            <ol className="space-y-3">
              {selected.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-primary)] font-medium">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="medpulse-card p-5 border-l-4 border-rose-500">
            <p className="font-black text-sm text-rose-500 mb-3">
              {isAr ? "المضاعفات المحتملة" : "Possible Complications"}
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.complications.map((c) => (
                <span key={c} className="text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)] px-4 py-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20">
            <Video className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              {isAr ? "الإجراءات السريرية" : "Clinical Procedures"}
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-widest">
              Step-by-step guides + indications
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {PROCEDURES.map((proc) => (
          <button
            key={proc.id}
            onClick={() => setSelected(proc)}
            className="w-full medpulse-card p-5 text-start flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-sm mb-1">
                {isAr ? proc.nameAr : proc.nameEn}
              </h3>
              <span className="text-[11px] font-bold text-sky-500 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                {proc.category}
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-[var(--text-tertiary)] ${isAr ? "rotate-180" : ""}`} />
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-[var(--text-tertiary)] mt-8 font-medium">
        {isAr ? "سيتم إضافة فيديوهات تعليمية قريباً" : "Educational video embeds coming soon"}
      </p>
    </div>
  );
}
