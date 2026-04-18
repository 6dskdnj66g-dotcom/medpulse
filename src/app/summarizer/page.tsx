"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Stethoscope, Activity, FileText, Pill, Sparkles,
  AlertTriangle, CheckCircle, Microscope, ClipboardList,
  ShieldCheck, Brain, X, Copy, RefreshCw, Loader2, UploadCloud, Image as ImageIcon
} from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { useLanguage } from "@/components/LanguageContext";

interface SummaryResult {
  chiefComplaint?: string | null;
  pathophysiology?: string | null;
  keySymptoms?: string[] | null;
  investigations?: string[] | null;
  diagnosis?: {
    primary?: string | null;
    differential?: string[] | null;
  } | null;
  management?: string | null;
  cautions?: string | null;
  evidenceLevel?: string | null;
  error?: string;
}

const SAMPLE_TEXTS = [
  {
    label: "Heart Failure Case",
    text: `65-year-old male with a 2-week history of progressive dyspnea on exertion and bilateral ankle swelling. He has a background of hypertension and type 2 diabetes mellitus. On examination: BP 155/95 mmHg, HR 105 bpm irregular, RR 22 bpm. JVP elevated at 4cm above sternal notch. Bibasal crackles on auscultation. Bilateral pitting edema to knees. CXR shows cardiomegaly with pulmonary congestion. BNP elevated at 890 pg/mL. Echo: LVEF 30%, dilated left ventricle.`,
  },
  {
    label: "Stroke Presentation",
    text: `72-year-old female brought to ED with acute onset of right-sided weakness and speech difficulty for 2 hours. PMHx: AF on warfarin, hypertension. INR on admission: 1.1. NIHSS score: 14. CT head: no hemorrhage. CT perfusion: large penumbra in left MCA territory. BP 185/100 mmHg. The patient is aphasic but follows simple commands. Facial droop noted on the right. Right arm power 1/5, right leg 2/5.`,
  },
  {
    label: "Pneumonia Notes",
    text: `38-year-old immunocompetent male presenting with 5-day history of productive cough with rusty sputum, fever 39.2°C, pleuritic chest pain. O2 sat 91% on air. CXR: right lower lobe consolidation. WBC 16,000 cells/μL with neutrophilia. CRP 145 mg/L. Sputum gram stain: gram-positive diplococci. No recent travel. No sick contacts. CURB-65 score: 2.`,
  },
];

function ResultSection({ icon: Icon, title, colorClass, bgClass, children }: {
  icon: React.ElementType;
  title: string;
  colorClass: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${bgClass} rounded-[20px] p-5 md:p-6 border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
      <h3 className={`font-extrabold ${colorClass} flex items-center mb-4 text-[13px] md:text-sm uppercase tracking-widest relative z-10`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2.5 flex-shrink-0" />
        {title}
      </h3>
      <div className="text-[var(--text-secondary)] text-[13px] md:text-[14px] leading-relaxed font-medium relative z-10">{children}</div>
    </section>
  );
}

export default function SummarizerPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [inputText, setInputText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addXp } = useAchievement();
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  

  const handleAnalyze = async () => {
    if ((!inputText.trim() && !image) || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/medical-summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, image }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "An unknown error occurred.");
        return;
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const parsed: SummaryResult = data;
      setResult(parsed);
      addXp(100, "Analyzed Clinical Document");
    } catch (err) {
      console.error("Summarizer error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInputText("");
    setImage(null);
    setResult(null);
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSampleLoad = (text: string) => {
    setInputText(text);
    setResult(null);
    setError(null);
  };

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Ambient background glows */}
      <div className="absolute top-[0%] right-[0%] w-[30%] h-[30%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[0%] w-[40%] h-[40%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="mb-10 md:mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <FileText className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-sky-500 opacity-80" />
              <span className="text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-medical-indigo)] bg-[var(--color-medical-indigo)]/10 px-3 py-1 rounded-[8px] border border-[var(--color-medical-indigo)]/20 shadow-sm">{isAr ? "التحليل السريري المتقدم" : "Advanced Clinical Analysis"}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {isAr ? "الملخص الطبي" : "Medical Summarizer"} <span className="text-sky-500">{isAr ? "الذكي" : "AI"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px] md:text-[15px] font-medium max-w-2xl mt-3 leading-relaxed">
              {isAr
                ? "قم بلصق الحالات السريرية أو السجلات أو الفحوصات أو الملاحظات. يستخرج نظامنا الذكي منظومة سريرية منظمة بأمان وموثوقية مدعوماً بـ Gemini Zero-Hallucination."
                : "Paste patient history, lab results, discharge summaries, or lecture notes. Our medical AI extracts a structured clinical assessment guaranteed zero-hallucination."}
            </p>
          </div>
        </div>
      </div>

      {/* Sample loaders */}
      <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
        <span className="text-[11px] md:text-xs text-[var(--text-tertiary)] font-extrabold uppercase tracking-widest bg-[var(--bg-1)] px-3 py-2 rounded-[10px] border border-[var(--border-subtle)]">{isAr ? "حالات تدريبية:" : "Load Sample Case:"}</span>
        {SAMPLE_TEXTS.map((s) => (
          <button
            key={s.label}
            onClick={() => handleSampleLoad(s.text)}
            className="text-[11px] md:text-xs px-4 py-2 rounded-[12px] bg-[var(--bg-0)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-extrabold hover:text-[var(--color-medical-indigo)] hover:border-[var(--color-medical-indigo)]/30 hover:bg-[var(--color-medical-indigo)]/5 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 min-h-[650px] relative z-10 h-full">
        {/* ─── Input Panel ─── */}
        <div className="flex flex-col medpulse-card glass level-1 border-[var(--border-subtle)] shadow-xl overflow-hidden h-full">
          <div className="bg-[var(--bg-1)] border-b border-[var(--border-subtle)] px-5 py-4 flex justify-between items-center bg-opacity-80 backdrop-blur-md">
            <span className="flex items-center space-x-3 text-[13px] font-extrabold uppercase tracking-widest text-[var(--text-primary)]">
              <ClipboardList className="w-4 h-4 text-[var(--text-tertiary)]/70" />
              <span>{isAr ? "المدخل السريري" : "Clinical Source Input"}</span>
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-black text-[var(--text-tertiary)] bg-[var(--bg-2)] px-2.5 py-1 rounded-[8px] border border-[var(--border-subtle)]">
                {inputText.length} chars
              </span>
              {inputText && (
                <button
                  onClick={handleReset}
                  className="text-[var(--text-tertiary)] hover:text-rose-500 bg-[var(--bg-2)] hover:bg-rose-500/10 p-1.5 rounded-[8px] transition-colors border border-[var(--border-subtle)] hover:border-rose-500/30"
                  title="Clear Input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-5 md:p-6 relative min-h-[350px] bg-[var(--bg-0)] flex flex-col">
            <textarea
              className="flex-1 w-full h-full min-h-[250px] resize-none outline-none bg-transparent text-[14px] md:text-[15px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 leading-[1.8] tracking-wide relative z-10"
              placeholder={"Paste patient history, lab results, discharge summaries, or clinical notes here...\n\nExample:\n'45-year-old male presenting with acute chest pain radiating to the jaw, diaphoresis, and shortness of breath for 3 hours. ECG shows ST-elevation in leads II, III, aVF...'"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="absolute bottom-6 right-6 z-20">
              <label className="cursor-pointer bg-[var(--bg-0)] border border-[var(--border-subtle)] hover:border-[var(--color-vital-cyan)]/40 hover:bg-[var(--color-vital-cyan)]/5 text-[var(--text-secondary)] p-3 rounded-[16px] flex items-center space-x-2 shadow-lg transition-all group backdrop-blur-xl">
                <UploadCloud className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-vital-cyan)] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] md:text-xs font-extrabold uppercase tracking-widest group-hover:text-[var(--color-vital-cyan)] transition-colors">{isAr ? "إرفاق فحص/مختبر" : "Upload Scan/Labs"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            
            {image && (
              <div className="mt-6 p-4 bg-[var(--color-vital-cyan)]/10 rounded-[20px] border border-[var(--color-vital-cyan)]/20 flex items-start space-x-4 shadow-sm animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[14px] overflow-hidden flex-shrink-0 border-2 border-[var(--color-vital-cyan)]/30 relative shadow-inner">
                  <Image src={image} alt="Uploaded lab" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] md:text-sm font-extrabold text-[var(--color-vital-cyan)] flex items-center shadow-sm">
                    <ImageIcon className="w-4 h-4 mr-2" /> {isAr ? "مرفق صورة سريرية" : "Clinical Source Image Attached"}
                  </p>
                  <p className="text-[11px] md:text-[12px] text-[var(--color-vital-cyan)]/80 mt-1.5 font-bold leading-relaxed">
                    {isAr ? "سيقوم الذكاء الاصطناعي باستخراج وتحليل النتائج تلقائياً مع مراعاة النص المكتوب." : "MedPulse AI will automatically extract and process findings from the image."}
                  </p>
                </div>
                <button onClick={() => setImage(null)} className="text-[var(--color-vital-cyan)]/60 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-[10px] transition-all border border-transparent hover:border-rose-500/20 bg-white/5">
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </div>
          <div className="p-5 md:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-1)] bg-opacity-50">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!inputText.trim() && !image)}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:from-[var(--bg-2)] disabled:to-[var(--bg-2)] disabled:text-[var(--text-tertiary)] disabled:shadow-none text-white font-extrabold py-4 md:py-5 px-6 rounded-[20px] transition-all flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_rgba(14,165,233,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(14,165,233,0.6)] hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:border disabled:border-[var(--border-subtle)] text-[14px] md:text-[15px] uppercase tracking-wide group"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isAr ? "جاري الاستخراج بـ Gemini 2026..." : "Extracting via MedPulse AI Engine..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>{isAr ? "تحليل واستخراج ذكي" : "Analyze & Generate Summary"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Output Panel ─── */}
        <div className="flex flex-col medpulse-card glass level-2 border-[var(--border-subtle)] shadow-2xl overflow-hidden h-full bg-[var(--bg-0)]">
          <div className="bg-[var(--bg-1)] border-b border-[var(--border-subtle)] px-5 py-4 flex justify-between items-center">
            <span className="flex items-center space-x-3 text-[13px] font-extrabold uppercase tracking-widest text-[var(--color-medical-indigo)]">
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? "التقرير الهيكلي الآمن" : "Structured MedPulse Report"}</span>
            </span>
            {result && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest transition-all px-3 py-1.5 rounded-[10px] border ${
                  copied ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-[var(--bg-0)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/30 hover:text-[var(--color-medical-indigo)]"
                }`}
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            {/* Empty State */}
            {!isAnalyzing && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-6 py-16 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-[var(--bg-2)] rounded-[24px] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] transform rotate-3">
                  <Brain className="h-10 w-10 text-[var(--color-medical-indigo)] opacity-40" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="font-extrabold text-[16px] text-[var(--text-primary)] mb-2 uppercase tracking-wide">{isAr ? "في انتظار المدخل السريري" : "Awaiting Clinical Input"}</p>
                  <p className="text-[13px] md:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{isAr ? "أدخل التاريخ المرضي أو النتائج المخبرية لتوليد تقرير هيكلي شامل بدقة عالية." : "Input patient history or lab documents to generate a structurally secure clinical assessment."}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full space-y-5 py-12 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-rose-500/10 rounded-[20px] flex items-center justify-center border border-rose-500/20 shadow-sm transform -rotate-3">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="font-extrabold text-xl text-[var(--text-primary)] mb-2">Analysis Failed</p>
                  <p className="text-[13px] md:text-sm text-[var(--text-secondary)] font-medium">{error}</p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="flex items-center space-x-2 text-[13px] font-extrabold text-sky-500 hover:text-white bg-sky-500/10 hover:bg-sky-500 border border-sky-500/20 hover:border-sky-500 px-6 py-3 rounded-[14px] transition-all shadow-sm uppercase tracking-widest mt-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isAr ? "إعادة المحاولة" : "Try Again"}</span>
                </button>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="space-y-6 animate-pulse p-2">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-[14px] flex-shrink-0 border border-sky-500/20" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--bg-2)] rounded-full w-48" />
                    <div className="h-3 bg-[var(--bg-2)] rounded-full w-32" />
                  </div>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-[20px] p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--bg-2)] to-transparent opacity-50 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    <div className="h-4 bg-[var(--bg-2)] rounded-full w-32" />
                    <div className="h-3 bg-[var(--bg-2)] rounded-full w-full" />
                    <div className="h-3 bg-[var(--bg-2)] rounded-full w-5/6" />
                  </div>
                ))}
                <div className="text-center text-[11px] font-extrabold text-[var(--color-medical-indigo)] pt-4 flex items-center justify-center space-x-2 uppercase tracking-widest opacity-80">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Context...</span>
                </div>
              </div>
            )}

            {/* Result State */}
            {result && !isAnalyzing && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Evidence Badge */}
                {result.evidenceLevel && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] md:text-xs font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-[12px] shadow-sm w-fit mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Evidence Rating: {result.evidenceLevel}</span>
                  </div>
                )}

                {/* Chief Complaint */}
                {result.chiefComplaint && (
                  <ResultSection icon={Stethoscope} title="Chief Complaint" colorClass="text-[var(--text-secondary)] dark:text-slate-300" bgClass="bg-[var(--bg-1)] border-[var(--border-subtle)] shadow-sm">
                    {result.chiefComplaint}
                  </ResultSection>
                )}

                {/* Pathophysiology */}
                {result.pathophysiology && (
                  <ResultSection icon={Brain} title="Pathophysiology" colorClass="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-500/5 border-indigo-500/10 shadow-sm shadow-indigo-500/5">
                    {result.pathophysiology}
                  </ResultSection>
                )}

                {/* Key Symptoms */}
                {result.keySymptoms && result.keySymptoms.length > 0 && (
                  <ResultSection icon={Activity} title="Key Symptoms & Signs" colorClass="text-rose-600 dark:text-rose-400" bgClass="bg-rose-500/5 border-rose-500/10 shadow-sm shadow-rose-500/5">
                    <ul className="space-y-2">
                      {result.keySymptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-rose-500 font-black mt-0.5">•</span>
                          <span className="font-medium text-[var(--text-primary)]">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultSection>
                )}

                {/* Investigations */}
                {result.investigations && result.investigations.length > 0 && (
                  <ResultSection icon={Microscope} title="Recommended Investigations" colorClass="text-teal-600 dark:text-teal-400" bgClass="bg-teal-500/5 border-teal-500/10 shadow-sm shadow-teal-500/5">
                    <ul className="space-y-2">
                      {result.investigations.map((inv, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-teal-500 font-black mt-0.5">•</span>
                          <span className="font-medium text-[var(--text-primary)]">{inv}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultSection>
                )}

                {/* Diagnosis */}
                {result.diagnosis && (
                  <div className="bg-sky-500/5 rounded-[20px] p-5 md:p-6 border border-sky-500/15 shadow-sm shadow-sky-500/5">
                    <h3 className="font-extrabold text-sky-600 dark:text-sky-400 flex items-center mb-4 text-[13px] md:text-sm uppercase tracking-widest">
                      <ClipboardList className="w-4 h-4 md:w-5 md:h-5 mr-2.5 flex-shrink-0" />
                      Differential Diagnosis
                    </h3>
                    {result.diagnosis.primary && (
                      <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-5 py-3.5 rounded-[14px] font-extrabold text-[14px] md:text-[15px] mb-4 shadow-[0_10px_20px_-10px_rgba(14,165,233,0.5)] flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 opacity-90" />
                        Primary: {result.diagnosis.primary}
                      </div>
                    )}
                    {result.diagnosis.differential && result.diagnosis.differential.length > 0 && (
                      <div className="bg-[var(--bg-0)] p-4 rounded-[16px] border border-[var(--border-subtle)]">
                        <p className="text-[10px] md:text-[11px] text-sky-500 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Consider Differentials:</p>
                        <div className="flex flex-wrap gap-2.5">
                          {result.diagnosis.differential.map((d, i) => (
                            <span key={i} className="text-[12px] md:text-[13px] bg-[var(--bg-1)] border border-[var(--border-subtle)] text-[var(--text-secondary)] px-3 py-1.5 rounded-[10px] font-bold shadow-sm">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Management */}
                {result.management && (
                  <ResultSection icon={Pill} title="Management & Interventions" colorClass="text-amber-600 dark:text-amber-400" bgClass="bg-amber-500/5 border-amber-500/10 shadow-sm shadow-amber-500/5">
                    <div className="font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{result.management}</div>
                  </ResultSection>
                )}

                {/* Cautions */}
                {result.cautions && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-[20px] p-5 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/20 blur-[30px] rounded-full pointer-events-none" />
                    <h3 className="font-extrabold text-rose-600 dark:text-rose-400 flex items-center mb-3 text-[13px] uppercase tracking-widest relative z-10">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 animate-pulse" />
                      Critical Red Flags
                    </h3>
                    <p className="text-rose-600 dark:text-rose-300 font-bold text-[13px] md:text-[14px] leading-relaxed relative z-10">{result.cautions}</p>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="mt-8 bg-[var(--bg-1)] rounded-[16px] p-4 text-[11px] text-[var(--text-tertiary)] font-medium leading-relaxed border border-[var(--border-subtle)]">
                  <strong className="font-extrabold text-rose-500/70 mr-1 uppercase tracking-widest">System Notice:</strong> This summary was computed exclusively for decision-support via MedPulse 2026 AI infrastructure. 
                  Do not bypass final clinical review. Always consult primary literature and senior medical personnel.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
