"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Stethoscope, Activity, FileText, Pill, Sparkles,
  AlertTriangle, CheckCircle, Microscope, ClipboardList,
  ShieldCheck, Brain, X, Copy, RefreshCw, Loader2, UploadCloud, Image as ImageIcon
} from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";

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
    <section className={`${bgClass} rounded-xl p-4 border border-slate-100`}>
      <h3 className={`font-bold ${colorClass} flex items-center mb-3 text-sm`}>
        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
        {title}
      </h3>
      <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function SummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addXp } = useAchievement();
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full transition-colors">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sky-500 text-xs font-bold uppercase tracking-widest mb-3">
          <Activity className="w-4 h-4" />
          <span>AI Clinical Analysis Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center">
          <FileText className="h-8 w-8 text-sky-500 mr-3" />
          Medical Summarizer
        </h1>
        <p className="text-slate-500 text-base max-w-2xl">
          Paste patient history, lab results, or lecture notes. Our AI extracts structured clinical insights 
          with zero hallucination — powered by Gemini 1.5 Pro.
        </p>
      </div>

      {/* Sample loaders */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider self-center mr-1">Load sample:</span>
        {SAMPLE_TEXTS.map((s) => (
          <button
            key={s.label}
            onClick={() => handleSampleLoad(s.text)}
            className="text-xs px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold hover:bg-sky-100 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-h-[600px]">
        {/* ─── Input Panel ─── */}
        <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-semibold text-slate-700 flex justify-between items-center">
            <span className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <span>Clinical Input</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-normal text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                {inputText.length} chars
              </span>
              {inputText && (
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 relative min-h-[400px]">
            <textarea
              className="w-full h-full resize-none outline-none text-slate-700 placeholder-slate-400 text-sm leading-relaxed font-mono"
              placeholder="Paste patient history, lab results, discharge summaries, or lecture notes here...

Example:
'45-year-old male presenting with acute chest pain radiating to the jaw, diaphoresis, and shortness of breath for 3 hours. ECG shows ST-elevation in leads II, III, aVF...'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute top-6 right-6">
              <label className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-xl flex items-center space-x-2 shadow-sm transition-colors">
                <UploadCloud className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-semibold">Upload Print/Lab</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            
            {image && (
              <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/30 rounded-xl border border-sky-100 dark:border-sky-800 flex items-start space-x-3">
                <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-300">
                  <Image src={image} alt="Uploaded lab" width={64} height={64} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-sky-800 dark:text-sky-300 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1.5" /> Image Attached
                  </p>
                  <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                    The AI will extract findings automatically.
                  </p>
                </div>
                <button onClick={() => setImage(null)} className="text-sky-400 hover:text-rose-500 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!inputText.trim() && !image)}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm shadow-sky-200 dark:shadow-none active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze &amp; Summarize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Output Panel ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-semibold text-slate-700 flex justify-between items-center">
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Structured Clinical Summary</span>
            </span>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/30">
            {/* Empty State */}
            {!isAnalyzing && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Brain className="h-10 w-10 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-500 mb-1">Awaiting Clinical Input</p>
                  <p className="text-sm text-slate-400">Paste text and click Analyze to generate a structured medical summary.</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-sky-100 rounded-lg flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-40" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-slate-100 rounded-xl p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-32" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                  </div>
                ))}
                <div className="text-center text-xs text-slate-400 pt-2 flex items-center justify-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini is analyzing clinical content...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 py-10">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-rose-400" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="font-bold text-slate-700 mb-1">Analysis Failed</p>
                  <p className="text-sm text-slate-500">{error}</p>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="flex items-center space-x-2 text-sm text-sky-600 hover:text-sky-700 font-semibold border border-sky-200 bg-sky-50 px-4 py-2 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* Result State */}
            {result && !isAnalyzing && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Evidence Badge */}
                {result.evidenceLevel && (
                  <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Evidence Level: {result.evidenceLevel}</span>
                  </div>
                )}

                {/* Chief Complaint */}
                {result.chiefComplaint && (
                  <ResultSection icon={Stethoscope} title="Chief Complaint" colorClass="text-slate-700" bgClass="bg-slate-50">
                    {result.chiefComplaint}
                  </ResultSection>
                )}

                {/* Pathophysiology */}
                {result.pathophysiology && (
                  <ResultSection icon={Brain} title="Pathophysiology" colorClass="text-indigo-700" bgClass="bg-indigo-50/50">
                    {result.pathophysiology}
                  </ResultSection>
                )}

                {/* Key Symptoms */}
                {result.keySymptoms && result.keySymptoms.length > 0 && (
                  <ResultSection icon={Activity} title="Key Symptoms & Signs" colorClass="text-rose-700" bgClass="bg-rose-50/50">
                    <ul className="space-y-1">
                      {result.keySymptoms.map((s, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-rose-400 mt-0.5 font-bold">·</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultSection>
                )}

                {/* Investigations */}
                {result.investigations && result.investigations.length > 0 && (
                  <ResultSection icon={Microscope} title="Investigations" colorClass="text-teal-700" bgClass="bg-teal-50/50">
                    <ul className="space-y-1">
                      {result.investigations.map((inv, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-teal-400 mt-0.5 font-bold">·</span>
                          <span>{inv}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultSection>
                )}

                {/* Diagnosis */}
                {result.diagnosis && (
                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                    <h3 className="font-bold text-sky-700 flex items-center mb-3 text-sm">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Diagnosis
                    </h3>
                    {result.diagnosis.primary && (
                      <div className="bg-sky-500 text-white px-3 py-2 rounded-lg font-bold text-sm mb-3">
                        ✓ Primary: {result.diagnosis.primary}
                      </div>
                    )}
                    {result.diagnosis.differential && result.diagnosis.differential.length > 0 && (
                      <div>
                        <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider mb-1">Differentials:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.diagnosis.differential.map((d, i) => (
                            <span key={i} className="text-xs bg-white border border-sky-200 text-sky-700 px-2 py-1 rounded-lg font-medium">
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
                  <ResultSection icon={Pill} title="Management & Treatment" colorClass="text-amber-700" bgClass="bg-amber-50/50">
                    {result.management}
                  </ResultSection>
                )}

                {/* Cautions */}
                {result.cautions && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <h3 className="font-bold text-rose-700 flex items-center mb-2 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      ⚠️ Clinical Cautions & Red Flags
                    </h3>
                    <p className="text-rose-600 text-sm leading-relaxed">{result.cautions}</p>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 leading-relaxed border border-slate-200">
                  <strong>Disclaimer:</strong> This summary is AI-generated for educational and clinical decision support purposes only. 
                  It does not replace professional clinical judgment. Always verify with primary literature and consult qualified clinicians.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
