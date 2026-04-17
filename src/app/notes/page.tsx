"use client";

import { useState } from "react";
import { FileText, Loader2, ClipboardEdit, ShieldCheck, Copy, CheckCircle, Download, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { exportMedicalReport } from "@/lib/pdfExport";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

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
  const { user } = useSupabaseAuth();
  const [info, setInfo] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 w-full page-transition">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Clinical Notes Generator</h1>
            <p className="text-slate-500 text-sm">AI-generated SOAP Notes · ACGME & Joint Commission Standards · ICD-11 Codes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400">Review all AI-generated notes before clinical use. Physician signature required for medical records.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-6">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Clinical Information</h2>
              <ClipboardEdit className="w-4 h-4 text-slate-400" />
            </div>

            {/* Templates */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Templates</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setInfo(t.value)}
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 hover:bg-teal-500 hover:text-white transition-all"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="Describe the patient case: demographics, chief complaint, history, examination findings, vitals, investigations, past medical history, medications, allergies..."
              rows={14}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
            />

            <button
              onClick={generate}
              disabled={isLoading || info.trim().length < 20}
              className="w-full mt-4 btn-premium bg-gradient-to-r from-teal-600 to-cyan-600 border-0 text-white disabled:opacity-40 disabled:cursor-not-allowed justify-center py-4"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating SOAP Note...</> : <><FileText className="w-4 h-4" /> Generate Clinical SOAP Note</>}
            </button>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Tips for Best Results</h3>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex gap-2"><span className="text-teal-500">→</span> Include vitals, examination findings, and lab results</li>
              <li className="flex gap-2"><span className="text-teal-500">→</span> Mention past medical history and medications</li>
              <li className="flex gap-2"><span className="text-teal-500">→</span> State the timeline clearly (onset, duration, progression)</li>
              <li className="flex gap-2"><span className="text-teal-500">→</span> Include relevant imaging and investigation results</li>
            </ul>
          </div>
        </div>

        {/* Output */}
        <div>
          {result ? (
            <div className="premium-card p-8 h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">SOAP Note</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setIsExporting(true);
                      await exportMedicalReport("soap-content", { title: "Clinical SOAP Note", filename: "SOAP_Report" });
                      setIsExporting(false);
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    title="تحميل كتقرير PDF"
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
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${saved ? "text-emerald-500" : "text-teal-600 hover:text-teal-700"}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saved ? "Saved" : "Save"}
                    </button>
                  )}
                  <button
                    onClick={copy}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    {copied ? <><CheckCircle className="w-4 h-4 text-teal-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
              <div id="soap-content" className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-teal-700 prose-strong:text-slate-900 dark:prose-strong:text-white overflow-y-auto max-h-[70vh] p-4 bg-white dark:bg-slate-900 rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12">
              <FileText className="w-16 h-16 opacity-20 mb-4" />
              <p className="font-black text-lg">Awaiting Clinical Input</p>
              <p className="text-sm mt-2 text-center">Enter patient information on the left<br />or select a template to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
