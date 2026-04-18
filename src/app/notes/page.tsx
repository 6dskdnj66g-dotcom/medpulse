"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, ClipboardEdit, ShieldCheck, Copy, CheckCircle, Download, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { exportMedicalReport } from "@/lib/pdfExport";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageContext";

const TEMPLATES = [
  {
    label: "Chest Pain",
    value: `65-year-old male with 2-hour history of central crushing chest pain radiating to the left arm. Associated with diaphoresis and shortness of breath. PMH: Type 2 diabetes, hypertension, smoker 30 pack-years. Medications: Metformin 1g BD, Amlodipine 5mg OD. Allergies: Penicillin (rash). BP 155/95, HR 98, RR 20, SpO2 96% on air, Temp 37.1. Chest: clear. Heart: no murmurs. ECG: ST elevation in V1-V4. Troponin I: 2.8 ng/mL (elevated).`,
  },
  {
    label: "Diabetic Ketoacidosis",
    value: `28-year-old female known Type 1 diabetic presents with 2-day history of nausea, vomiting, abdominal pain, and polyuria. She missed two insulin doses due to illness. BP 100/60, HR 118, RR 28 (Kussmaul breathing), Temp 37.8, SpO2 98%. Abdomen: diffuse tenderness. Blood glucose 28 mmol/L. VBG: pH 7.18, HCO3 10, pCO2 25. Ketones 6+. Na 132, K 5.8, Cl 98. Anion gap 24. Urinalysis: glucose and ketones positive.`,
  },
  {
    label: "Pneumonia",
    value: `72-year-old male with 5-day history of productive cough with yellow sputum, fever, and progressive dyspnoea. PMH: COPD (GOLD II), hypertension. Current medications: Salbutamol inhaler PRN, Tiotropium OD, Ramipril 5mg OD. Lives alone. Temp 38.9, BP 138/85, HR 102, RR 26, SpO2 91% on air (94% on 2L O2). Chest examination: dullness and bronchial breathing at right base. CXR: consolidation right lower lobe. WBC 16.5, CRP 210.`,
  },
  {
    label: "Stroke",
    value: `78-year-old female brought by family with sudden onset right-sided weakness and slurred speech starting 90 minutes ago. Known AF on aspirin (not anticoagulated). PMH: Hypertension, hyperlipidemia. BP 185/110, HR 88 irregular, RR 16, SpO2 98%, Temp 36.9. NIHSS: 14. Right facial droop, right arm paresis (0/5), right leg paresis (2/5), aphasia. CT head: no hemorrhage. CT perfusion: left MCA territory ischemic penumbra.`,
  },
];

export default function ClinicalNotesPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [info, setInfo] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const { lang } = useLanguage();
  const isAr = lang === "ar";

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  const generate = async () => {
    if (!info.trim() || info.trim().length < 20) return;
    setIsLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicalInfo: info }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setResult(prev => prev + text);
      }
    } catch {
      setResult("⚠️ Failed to generate note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] rounded-[20px] flex items-center justify-center shadow-xl transform -rotate-3">
            <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {isAr ? "الملاحظات" : "Clinical" } <span className="brand-gradient-text">{isAr ? "السريرية" : "Notes"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">
              {isAr ? "ملاحظات SOAP بالذكاء الاصطناعي · معايير ACGME · رموز ICD-11" : "AI-generated SOAP Notes · ACGME & Joint Commission Standards · ICD-11 Codes"}
            </p>
          </div>
        </div>
        <div className="flex items-start md:items-center gap-3 p-4 bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 rounded-2xl max-w-3xl shadow-sm backdrop-blur-sm">
          <ShieldCheck className="w-5 h-5 text-[var(--color-medical-indigo)] flex-shrink-0 mt-0.5 md:mt-0" />
          <p className="text-[13px] md:text-sm font-bold text-[var(--color-medical-indigo)] opacity-90">
            {isAr ? "راجع جميع الملاحظات قبل الاستخدام السريري. مطلوب توقيع الطبيب للسجلات الطبية." : "Review all AI-generated notes before clinical use. Physician signature required for medical records."}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Input */}
        <div className="space-y-6 flex flex-col">
          <div className="medpulse-card p-6 md:p-8 flex-1 flex flex-col shadow-lg border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">{isAr ? "المعلومات السريرية" : "Clinical Information"}</h2>
              <ClipboardEdit className="w-5 h-5 text-[var(--text-tertiary)]" />
            </div>

            {/* Templates */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">{isAr ? "قوالب سريعة" : "Quick Templates"}</p>
              <div className="flex flex-wrap gap-2.5">
                {TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setInfo(t.value)}
                    className="text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--color-medical-indigo)] hover:text-white hover:border-[var(--color-medical-indigo)] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1 group">
              <textarea
                value={info}
                onChange={e => setInfo(e.target.value)}
                placeholder="Describe the patient case: demographics, chief complaint, history, examination findings, vitals, investigations, past medical history, medications, allergies..."
                rows={12}
                className="w-full h-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 text-sm md:text-[15px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-medical-indigo)]/50 focus:border-transparent outline-none transition-all duration-300 resize-none shadow-inner group-hover:shadow-md"
              />
            </div>

            <button
              onClick={generate}
              disabled={isLoading || info.trim().length < 20}
              className="w-full mt-6 bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] border-0 text-white font-extrabold disabled:from-[var(--bg-3)] disabled:to-[var(--bg-3)] disabled:text-[var(--text-tertiary)] disabled:shadow-none shadow-lg hover:shadow-xl py-4 md:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 active:scale-95"
            >
              {isLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="tracking-wide">{isAr ? "جارٍ التوليد..." : "Generating Note..."}</span></>
                : <><FileText className="w-5 h-5" /> <span className="tracking-wide">{isAr ? "توليد الملاحظة" : "Generate SOAP Note"}</span></>}
            </button>
          </div>

          <div className="p-6 glass level-1 rounded-3xl border border-[var(--border-subtle)]">
            <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-clinical-violet)] mb-4">Tips for Best Results</h3>
            <ul className="space-y-3 text-xs md:text-[13px] font-medium text-[var(--text-secondary)]">
              <li className="flex items-start gap-3"><span className="text-[var(--color-clinical-violet)] mt-0.5">→</span> <span>Include vitals, examination findings, and lab results</span></li>
              <li className="flex items-start gap-3"><span className="text-[var(--color-clinical-violet)] mt-0.5">→</span> <span>Mention past medical history and medications</span></li>
              <li className="flex items-start gap-3"><span className="text-[var(--color-clinical-violet)] mt-0.5">→</span> <span>State the timeline clearly (onset, duration, progression)</span></li>
              <li className="flex items-start gap-3"><span className="text-[var(--color-clinical-violet)] mt-0.5">→</span> <span>Include relevant imaging and investigation results</span></li>
            </ul>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col h-full min-h-[500px] lg:min-h-full">
          {result ? (
            <div className="medpulse-card p-6 md:p-8 flex flex-col h-full shadow-2xl border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 bg-[var(--color-vital-cyan)]/10 px-4 py-2 rounded-xl text-[var(--color-vital-cyan)]">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest">SOAP Note</h2>
                </div>
                <div className="flex items-center flex-wrap gap-2 md:gap-3">
                  <button
                    onClick={async () => {
                      setIsExporting(true);
                      await exportMedicalReport("soap-content", { title: "Clinical SOAP Note", filename: "SOAP_Report" });
                      setIsExporting(false);
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-[var(--bg-1)] hover:bg-[var(--bg-2)] text-[var(--text-secondary)] transition-all border border-[var(--border-subtle)] hover:shadow-sm"
                    title="Download Report PDF"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    PDF
                  </button>
                  {user && (
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        const { error } = await supabase.from("clinical_records").insert({
                          user_id: user.id,
                          type: "soap_note",
                          title: `SOAP Note: ${info.substring(0, 30)}...`,
                          content: { note: result, input: info },
                        });
                        if (!error) setSaved(true);
                        setTimeout(() => setSaved(false), 3000);
                        setIsSaving(false);
                      }}
                      disabled={isSaving || saved}
                      className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all border border-[var(--border-subtle)] hover:shadow-sm ${saved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-[var(--bg-1)] hover:bg-[var(--bg-2)] text-[var(--text-secondary)]"}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saved ? "Saved" : "Save"}
                    </button>
                  )}
                  <button
                    onClick={copy}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-0)] transition-all shadow-md active:scale-95"
                  >
                    {copied ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
              <div id="soap-content" className="flex-1 overflow-y-auto bg-[var(--bg-0)] rounded-2xl p-5 md:p-6 border border-[var(--border-subtle)] shadow-inner custom-scrollbar">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:text-[var(--color-medical-indigo)] prose-strong:text-[var(--text-primary)] prose-li:text-[var(--text-secondary)] prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--text-tertiary)] glass level-0 rounded-[32px] border-2 border-dashed border-[var(--border-subtle)] p-12 transition-all hover:bg-[var(--bg-1)]/50">
              <div className="w-24 h-24 bg-[var(--bg-2)] rounded-3xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3">
                <FileText className="w-12 h-12 opacity-50" />
              </div>
              <p className="font-extrabold text-xl text-[var(--text-secondary)]">Awaiting Clinical Input</p>
              <p className="text-sm mt-3 text-center opacity-80 leading-relaxed font-medium">Enter patient information on the left<br />or select a rapid template to instantly synthesize</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
