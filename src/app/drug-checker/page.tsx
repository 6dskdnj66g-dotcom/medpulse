"use client";

import { useState, useRef } from "react";
import { Pill, Plus, X, AlertTriangle, ShieldCheck, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="max-w-5xl mx-auto p-6 md:p-10 w-full page-transition">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Drug Interaction Checker</h1>
            <p className="text-slate-500 text-sm">Powered by Lexicomp 2026 · Micromedex 2026 · FDA Drug Safety</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <p className="text-xs font-bold text-rose-700 dark:text-rose-400">For pharmacist/physician use only. Always verify with current drug references before clinical decisions.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Drug Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Add Medications</h2>

            {/* Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => handleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && input.trim()) addDrug(input.trim());
                }}
                placeholder="Type drug name..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
              />
              {/* Autocomplete */}
              {filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {filtered.map(d => (
                    <button key={d} onClick={() => addDrug(d)} className="w-full px-4 py-2.5 text-sm font-bold text-left text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Add</p>
              <div className="flex flex-wrap gap-1.5">
                {["Warfarin", "Aspirin", "Amiodarone", "Metformin", "Simvastatin", "Ciprofloxacin", "Fluconazole", "Clarithromycin"].map(d => (
                  <button key={d} onClick={() => addDrug(d)}
                    disabled={selectedDrugs.includes(d)}
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Drugs */}
          {selectedDrugs.length > 0 && (
            <div className="premium-card p-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Selected Drugs ({selectedDrugs.length})</h2>
              <div className="space-y-2 mb-6">
                {selectedDrugs.map(d => (
                  <div key={d} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-sm font-black text-slate-800 dark:text-white">{d}</span>
                    </div>
                    <button onClick={() => removeDrug(d)} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={checkInteractions}
                disabled={selectedDrugs.length < 2 || isLoading}
                className="w-full btn-premium bg-gradient-to-r from-rose-600 to-orange-500 border-0 text-white disabled:opacity-40 disabled:cursor-not-allowed justify-center py-4"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ShieldCheck className="w-4 h-4" /> Check Interactions</>}
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="premium-card p-8 h-full">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Interaction Analysis Report</h2>
                <span className="ml-auto text-[10px] font-black text-slate-400">Lexicomp · Micromedex 2026</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-black prose-strong:text-rose-600 prose-a:text-sky-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12">
              <Pill className="w-16 h-16 opacity-20 mb-4" />
              <p className="font-black text-lg">No Analysis Yet</p>
              <p className="text-sm mt-2 text-center">Add at least 2 drugs from the left panel<br />then click &quot;Check Interactions&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
