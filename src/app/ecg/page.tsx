"use client";

import { useState } from "react";
import { Activity, Loader2, ShieldCheck, AlertTriangle, ChevronRight, CheckCircle, X, ArrowRight, Download, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { exportMedicalReport } from "@/lib/pdfExport";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

const ECG_PRESETS = [
  {
    label: "Normal Sinus Rhythm",
    description: "Rate 72 bpm, regular rhythm, P waves upright in II, PR 160ms, QRS 80ms narrow, QTc 400ms, no ST changes, no T wave abnormalities.",
    color: "emerald",
  },
  {
    label: "STEMI — Anterior",
    description: "Rate 95 bpm, regular rhythm, ST elevation 3mm in V1-V4 with reciprocal ST depression in II, III, aVF. Q waves developing in V2-V3. QRS 90ms. Normal P waves. History: 2h chest pain.",
    color: "rose",
  },
  {
    label: "Atrial Fibrillation",
    description: "Irregularly irregular rhythm, no discernible P waves, wavy baseline, ventricular rate 110 bpm, narrow QRS 75ms, no ST changes. QTc unmeasurable due to AF.",
    color: "orange",
  },
  {
    label: "Complete Heart Block",
    description: "P waves regular at rate 80 bpm, QRS regular at rate 38 bpm (escape rhythm), PR interval completely variable — P waves bear no relationship to QRS. QRS wide at 140ms (LBBB morphology).",
    color: "red",
  },
  {
    label: "Left Bundle Branch Block",
    description: "Rate 68 bpm, regular sinus rhythm, QRS duration 145ms, notched R wave in V5-V6 (RSR' pattern), rS in V1, ST depression V4-V6, T wave inversion lateral leads.",
    color: "purple",
  },
  {
    label: "Hyperkalemia",
    description: "Rate 55 bpm, sinus bradycardia, peaked (tented) T waves in V1-V4 with amplitude 12mm, PR prolongation 240ms, QRS widening 120ms, no P waves visible in some leads. Serum K: 7.2 mEq/L.",
    color: "amber",
  },
];

export default function ECGPage() {
  const { user } = useSupabaseAuth();
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const analyzeECG = async (desc?: string) => {
    const query = desc || description;
    if (!query.trim()) return;
    setIsLoading(true);
    setResult("");
    if (desc) setDescription(desc);

    try {
      const res = await fetch("/api/ecg-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: query }),
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
      setResult("⚠️ Failed to analyze ECG. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500",
    rose: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500",
    orange: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500",
    red: "border-red-500/30 bg-red-500/5 hover:border-red-500",
    purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500",
    amber: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500",
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 w-full page-transition">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">ECG Interpretation Engine</h1>
            <p className="text-slate-500 text-sm">ACC/AHA 2026 · Marriott&#39;s Electrocardiography · Cardiologist-Level Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Clinical tool for education and decision support. Always confirm with cardiologist in acute settings.</p>
        </div>
      </div>

      {/* Preset ECGs */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Training Scenarios</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ECG_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => analyzeECG(p.description)}
              className={`p-4 rounded-2xl border-2 transition-all text-left group ${colorMap[p.color]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-slate-800 dark:text-white">{p.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">ECG Findings Description</h2>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe ECG findings: Rate, rhythm, P waves, PR interval, QRS duration/morphology, ST changes, T waves, QTc, axis, bundle branch blocks, etc.

Example: Rate 95 bpm, irregular rhythm, absent P waves, narrow QRS 80ms, no ST elevation, QTc 420ms..."
            rows={12}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none mb-4"
          />
          <button
            onClick={() => analyzeECG()}
            disabled={isLoading || !description.trim()}
            className="w-full btn-premium bg-gradient-to-r from-rose-600 to-orange-500 border-0 text-white disabled:opacity-40 disabled:cursor-not-allowed justify-center py-4"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Interpreting ECG...</> : <><Activity className="w-4 h-4" /> Interpret ECG</>}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="premium-card p-8 h-full">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Activity className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">ECG Report</h2>
                
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setIsExporting(true);
                      await exportMedicalReport("ecg-content", { title: "AI ECG Interpretation Report", filename: "ECG_Report" });
                      setIsExporting(false);
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
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
                          type: "ecg_report",
                          title: `ECG: ${description.substring(0, 30)}...`,
                          content: { report: result, findings: description },
                        });
                        if (!error) setSaved(true);
                        setTimeout(() => setSaved(false), 3000);
                        setIsSaving(false);
                      }}
                      disabled={isSaving || saved}
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${saved ? "text-emerald-500" : "text-rose-600 hover:text-rose-700"}`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saved ? "Saved" : "Save"}
                    </button>
                  )}
                </div>
              </div>
              <div id="ecg-content" className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-strong:text-rose-600 overflow-y-auto max-h-[65vh] p-4 bg-white dark:bg-slate-900 rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12">
              <Activity className="w-16 h-16 opacity-20 mb-4" />
              <p className="font-black text-lg">Awaiting ECG Input</p>
              <p className="text-sm mt-2 text-center">Select a preset scenario or<br />describe the ECG findings manually</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
