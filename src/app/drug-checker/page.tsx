"use client";

import { useState, useRef } from "react";
import { Pill, X, AlertTriangle, ShieldCheck, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { useLanguage } from "@/components/LanguageContext";

const COMMON_DRUGS = [
  "Warfarin", "Aspirin", "Clopidogrel", "Metformin", "Insulin",
  "Atorvastatin", "Simvastatin", "Lisinopril", "Amlodipine", "Metoprolol",
  "Furosemide", "Spironolactone", "Amiodarone", "Digoxin", "Heparin",
  "Apixaban", "Rivaroxaban", "Dabigatran", "Sildenafil", "Nitroglycerine",
  "Ciprofloxacin", "Clarithromycin", "Fluconazole", "Rifampicin", "Phenytoin",
  "Carbamazepine", "Valproate", "Lithium", "Haloperidol", "Quetiapine",
  "Sertraline", "Fluoxetine", "Venlafaxine", "Tramadol", "Morphine",
  "Codeine", "Ibuprofen", "Naproxen", "Prednisone", "Dexamethasone",
  "Tacrolimus", "Cyclosporine", "Methotrexate", "Azathioprine", "Hydroxychloroquine",
  "Omeprazole", "Pantoprazole", "Domperidone", "Ondansetron", "Doxycycline",
  "Amoxicillin", "Co-amoxiclav", "Vancomycin", "Gentamicin", "Ceftriaxone",
  "Semaglutide", "Tirzepatide", "Empagliflozin", "Dapagliflozin", "Sitagliptin",
];

export default function DrugCheckerPage() {
  useSupabaseAuth();
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { lang } = useLanguage();
  const isAr = lang === "ar";

  

  const handleInput = (val: string) => {
    setInput(val);
    if (val.trim().length > 1) {
      setFiltered(COMMON_DRUGS.filter(d => d.toLowerCase().includes(val.toLowerCase()) && !selectedDrugs.includes(d)).slice(0, 8));
    } else {
      setFiltered([]);
    }
  };

  const addDrug = (drug: string) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs(prev => [...prev, drug]);
    }
    setInput("");
    setFiltered([]);
    inputRef.current?.focus();
  };

  const removeDrug = (drug: string) => {
    setSelectedDrugs(prev => prev.filter(d => d !== drug));
    setResult("");
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    setIsLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/drug-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: selectedDrugs }),
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
      setResult("⚠️ Failed to analyze interactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Ambient background glows */}
      <div className="absolute top-[0%] left-[20%] w-[30%] h-[30%] bg-[var(--color-critical-red)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className="mb-8 md:mb-12 relative z-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[var(--color-critical-red)] to-rose-400 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(225,29,72,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Pill className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {isAr ? "فاحص التفاعلات" : "Drug Interaction" } <span className="text-[var(--color-critical-red)]">{isAr ? "الدوائية" : "Checker"}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">
              {isAr ? "مدعوم بـ Lexicomp 2026 · Micromedex 2026 · سلامة الدواء FDA" : "Powered by Lexicomp 2026 · Micromedex 2026 · FDA Drug Safety"}
            </p>
          </div>
        </div>
        <div className="flex items-start md:items-center gap-3 p-4 bg-[var(--color-critical-red)]/10 border border-[var(--color-critical-red)]/20 rounded-2xl max-w-3xl shadow-sm backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-[var(--color-critical-red)] flex-shrink-0 mt-0.5 md:mt-0" />
          <p className="text-[13px] md:text-sm font-bold text-[var(--color-critical-red)] opacity-90 leading-relaxed">
            {isAr ? "للاستخدام الطبي والصيدلاني فقط. تحقق دائماً من المراجع الدوائية الحالية قبل القرارات السريرية." : "For pharmacist/physician use only. Always verify with current drug references before clinical decisions."}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 md:gap-8 relative z-10">
        {/* Drug Input Panel */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="medpulse-card p-6 md:p-8 flex-1 flex flex-col shadow-lg border-[var(--border-subtle)] bg-[var(--bg-1)]/50">
            <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-5">{isAr ? "إضافة الأدوية" : "Add Medications"}</h2>

            {/* Input */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => handleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && input.trim()) addDrug(input.trim());
                }}
                placeholder="Type drug name..."
                className="w-full pl-12 pr-5 py-4 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] text-[15px] font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-critical-red)]/10 focus:border-[var(--color-critical-red)]/30 outline-none transition-all shadow-inner"
              />
              {/* Autocomplete */}
              {filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                  {filtered.map(d => (
                    <button key={d} onClick={() => addDrug(d)} className="w-full px-5 py-3.5 text-[14px] font-bold text-left text-[var(--text-primary)] hover:bg-[var(--color-critical-red)]/10 hover:text-[var(--color-critical-red)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add */}
            <div className="mt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">{isAr ? "إضافة سريعة" : "Quick Add"}</p>
              <div className="flex flex-wrap gap-2">
                {["Warfarin", "Aspirin", "Amiodarone", "Metformin", "Simvastatin", "Ciprofloxacin", "Fluconazole", "Clarithromycin"].map(d => (
                  <button key={d} onClick={() => addDrug(d)}
                    disabled={selectedDrugs.includes(d)}
                    className="text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl bg-[var(--bg-0)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--color-critical-red)] hover:text-white hover:border-[var(--color-critical-red)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95">
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Drugs */}
          {selectedDrugs.length > 0 && (
            <div className="medpulse-card p-6 md:p-8 shadow-xl border-[var(--color-critical-red)]/20 animate-in slide-in-from-top-4">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--color-critical-red)] mb-5">{isAr ? `الأدوية المختارة (${selectedDrugs.length})` : `Selected Drugs (${selectedDrugs.length})`}</h2>
              <div className="space-y-2.5 mb-6">
                {selectedDrugs.map((d, i) => (
                  <div key={d} className="flex items-center justify-between bg-[var(--bg-0)] rounded-2xl px-5 py-4 border border-[var(--border-subtle)] shadow-sm group hover:border-[var(--color-critical-red)]/30 transition-colors animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-critical-red)] shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                      <span className="text-[14px] md:text-[15px] font-extrabold text-[var(--text-primary)]">{d}</span>
                    </div>
                    <button onClick={() => removeDrug(d)} className="text-[var(--text-tertiary)] hover:text-[var(--color-critical-red)] hover:bg-[var(--color-critical-red)]/10 p-1.5 rounded-lg transition-all">
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={checkInteractions}
                disabled={selectedDrugs.length < 2 || isLoading}
                className="w-full bg-gradient-to-r from-[var(--color-critical-red)] to-rose-500 text-white font-extrabold py-4 md:py-5 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(225,29,72,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(225,29,72,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-3 border-0"
              >
                {isLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> <span className="tracking-wide">{isAr ? "جارٍ التحليل..." : "Analyzing Interactions..."}</span></>
                  : <><ShieldCheck className="w-5 h-5" /> <span className="tracking-wide">{isAr ? "فحص التفاعلات" : "Check Interactions"}</span></>}
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-[500px] lg:min-h-full">
          {result ? (
            <div className="medpulse-card flex flex-col p-6 md:p-8 h-full shadow-2xl border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-[var(--border-subtle)]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[var(--text-primary)]">Interaction Analysis Report</h2>
                <span className="ml-auto text-[9px] md:text-[10px] font-extrabold tracking-widest uppercase text-[var(--text-tertiary)] bg-[var(--bg-1)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">Lexicomp · Micromedex 2026</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto custom-scrollbar pr-2 prose-headings:font-extrabold prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--color-critical-red)] prose-a:text-[var(--color-medical-indigo)] prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-li:text-[var(--text-secondary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--text-tertiary)] glass level-0 rounded-[32px] border-2 border-dashed border-[var(--border-subtle)] p-12 transition-all hover:bg-[var(--bg-1)]/50">
              <div className="w-24 h-24 bg-[var(--bg-2)] rounded-3xl flex items-center justify-center mb-6 shadow-sm transform rotate-3">
                <Pill className="w-12 h-12 opacity-40 text-[var(--color-critical-red)]" />
              </div>
              <p className="font-extrabold text-xl text-[var(--text-secondary)]">{isAr ? "لا يوجد تحليل بعد" : "No Analysis Yet"}</p>
              <p className="text-sm mt-3 text-center opacity-80 leading-relaxed font-medium">{isAr ? "أضف دواءين على الأقل من اليسار\nثم انقر «فحص التفاعلات»" : <>Add at least 2 drugs from the left panel<br />then click &quot;Check Interactions&quot;</>}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
