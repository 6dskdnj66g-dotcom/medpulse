"use client";

import { useState, useRef, useEffect } from "react";
import { Activity, Loader2, AlertTriangle, CheckCircle, ArrowRight, Download, Save, Mic, MicOff } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { exportMedicalReport } from "@/core/utils/pdfExport";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import { supabase } from "@/core/database/supabase";

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
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { lang } = useLanguage();
  const isAr = lang === "ar";

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = isAr ? 'ar-SA' : 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }
          if (finalTranscript) {
            setDescription(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isAr]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
    emerald: "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)] shadow-inner text-emerald-600 dark:text-emerald-400 font-extrabold",
    rose: "border-rose-500/30 bg-rose-500/5 hover:border-rose-500 hover:shadow-[0_10px_20px_-10px_rgba(244,63,94,0.3)] shadow-inner text-rose-600 dark:text-rose-400 font-extrabold",
    orange: "border-orange-500/30 bg-orange-500/5 hover:border-orange-500 hover:shadow-[0_10px_20px_-10px_rgba(249,115,22,0.3)] shadow-inner text-orange-600 dark:text-orange-400 font-extrabold",
    red: "border-red-500/30 bg-red-500/5 hover:border-red-500 hover:shadow-[0_10px_20px_-10px_rgba(239,68,68,0.3)] shadow-inner text-red-600 dark:text-red-400 font-extrabold",
    purple: "border-purple-500/30 bg-purple-500/5 hover:border-purple-500 hover:shadow-[0_10px_20px_-10px_rgba(168,85,247,0.3)] shadow-inner text-purple-600 dark:text-purple-400 font-extrabold",
    amber: "border-amber-500/30 bg-amber-500/5 hover:border-amber-500 hover:shadow-[0_10px_20px_-10px_rgba(245,158,11,0.3)] shadow-inner text-amber-600 dark:text-amber-400 font-extrabold",
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Ambient background glows */}
      <div className="absolute top-[0%] left-[20%] w-[30%] h-[30%] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 md:mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Activity className="w-7 h-7 md:w-8 md:h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {isAr ? "محرك تفسير" : "ECG Interpretation"} <span className="text-rose-500">{isAr ? "تخطيط القلب" : "Engine"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">
              {isAr ? "إرشادات ACC/AHA 2026 · تحليل على مستوى أخصائي القلب" : "ACC/AHA 2026 · Marriott's Electrocardiography · Cardiologist-Level Analysis"}
            </p>
          </div>
        </div>
        <div className="flex items-start md:items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-4xl shadow-sm backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 md:mt-0" />
          <p className="text-[13px] md:text-sm font-bold text-rose-600 dark:text-rose-400 opacity-90 leading-relaxed">
            {isAr ? "أداة تعليمية لدعم القرار السريري. تأكد دائماً مع أخصائي القلب في الحالات الحادة. لا تستند بالكامل على الذكاء الاصطناعي." : "Clinical tool for education and decision support. Always confirm with cardiologist in acute settings. Do not rely solely on AI."}
          </p>
        </div>
      </div>

      {/* Preset ECGs */}
      <div className="mb-10 relative z-10 flex flex-col xl:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-5">{isAr ? "سيناريوهات تدريبية" : "Training Scenarios"}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {ECG_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => analyzeECG(p.description)}
                className={`p-5 md:p-6 rounded-[24px] transition-all duration-300 text-left group active:scale-95 animate-in slide-in-from-bottom-4 backdrop-blur-md ${colorMap[p.color]}`}
                style={{ animationDelay: `${i * 50}ms`, borderWidth: '1px' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[14px] md:text-[15px] font-extrabold tracking-wide drop-shadow-sm">{p.label}</span>
                  <div className={`w-8 h-8 rounded-full bg-[var(--bg-0)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shadow-sm`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] md:text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed font-medium mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Realistic Heart Model */}
        <div className="xl:w-[400px] h-[350px] xl:h-auto rounded-[32px] overflow-hidden border border-rose-500/20 bg-black/5 shadow-2xl relative flex-shrink-0 group">
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent pointer-events-none z-10"></div>
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
              {isAr ? "مجسم قلب حي 3D" : "Live 3D Heart"}
            </span>
          </div>
          {/* Sketchfab iframe for realistic beating heart */}
          <iframe 
            title="Animated Human Heart" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            src="https://sketchfab.com/models/dedbab26bd27413eaf55148caaccc9f7/embed?autostart=1&preload=1&ui_controls=0&ui_infos=0&ui_watermark=0&transparent=1"
            className="absolute inset-0 w-full h-full object-contain pointer-events-auto"
            style={{ filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))" }}
          ></iframe>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 relative z-10 flex-1">
        {/* Input */}
        <div className="medpulse-card glass level-1 p-6 md:p-8 flex flex-col shadow-lg border-[var(--border-subtle)] h-full">
          <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-5">{isAr ? "وصف نتائج تخطيط القلب" : "ECG Findings Description"}</h2>
          <div className="relative group flex-1 flex flex-col">
            <button
              onClick={toggleListen}
              className={`absolute top-4 right-4 z-10 p-2.5 rounded-xl transition-all ${
                isListening 
                  ? "bg-rose-500 text-white shadow-[0_0_15px_-3px_rgba(244,63,94,0.5)] animate-pulse" 
                  : "bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10"
              }`}
              title={isAr ? (isListening ? "إيقاف التسجيل" : "تحدث لإدخال البيانات") : (isListening ? "Stop listening" : "Dictate ECG findings")}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe ECG findings: Rate, rhythm, P waves, PR interval, QRS duration/morphology, ST changes, T waves, QTc, axis, bundle branch blocks...&#10;&#10;Example: Rate 95 bpm, irregular rhythm, absent P waves, narrow QRS 80ms, no ST elevation, QTc 420ms..."
              className="w-full flex-1 min-h-[300px] bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[24px] px-5 py-5 pr-14 text-[14px] md:text-[15px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/30 outline-none transition-all resize-none shadow-inner leading-loose"
            />
          </div>
          <button
            onClick={() => analyzeECG()}
            disabled={isLoading || !description.trim()}
            className="w-full mt-6 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-extrabold py-4 md:py-5 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(244,63,94,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(244,63,94,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-3 border-0 group"
          >
            {isLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="tracking-wide">{isAr ? "جارٍ تفسير تخطيط القلب..." : "Interpreting ECG..."}</span></>
              : <><Activity className="w-5 h-5 animate-pulse" /> <span className="tracking-wide">{isAr ? "تفسير تخطيط القلب" : "Interpret ECG"}</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-50" /></>}
          </button>
        </div>

        {/* Result */}
        <div className="flex flex-col h-full min-h-[500px] lg:min-h-full">
          {result ? (
            <div className="medpulse-card flex flex-col p-6 md:p-8 h-full shadow-2xl border-[var(--border-subtle)] animate-in slide-in-from-right-8 bg-[var(--bg-0)]">
              <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-[14px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-sm">
                  <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--text-primary)]">ECG Analysis Report</h2>
                
                <div className="ml-auto flex flex-wrap items-center gap-2 md:gap-3">
                  <button
                    onClick={async () => {
                      setIsExporting(true);
                      await exportMedicalReport("ecg-content", { title: "AI ECG Interpretation Report", filename: "ECG_Report" });
                      setIsExporting(false);
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-[var(--color-medical-indigo)] hover:text-white hover:bg-[var(--color-medical-indigo)] bg-[var(--color-medical-indigo)]/10 px-3 py-2 rounded-xl transition-all border border-[var(--color-medical-indigo)]/30 disabled:opacity-50"
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
              <div id="ecg-content" className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-strong:text-rose-600 overflow-y-auto max-h-[65vh] p-4 bg-[var(--bg-0)] rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-64 flex flex-col items-center justify-center text-[var(--text-tertiary)]/70 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12">
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

