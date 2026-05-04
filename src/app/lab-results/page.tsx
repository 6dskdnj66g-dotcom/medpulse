"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import {
  FlaskConical,
  AlertTriangle,
  Send,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  HeartPulse,
  Dna,
  Syringe,
  Microscope,
  Stethoscope
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LAB_PANELS = {
  cbc: {
    labelAr: "صورة الدم الكاملة (CBC)",
    labelEn: "Complete Blood Count (CBC)",
    icon: <Activity className="w-5 h-5" />,
    color: "from-rose-500 to-red-600",
    fields: [
      { key: "WBC", unit: "×10³/µL", normal: "4.5–11.0" },
      { key: "RBC", unit: "×10⁶/µL", normal: "4.2–5.8 (M) / 3.8–5.2 (F)" },
      { key: "Hemoglobin", unit: "g/dL", normal: "13.5–17.5 (M) / 12.0–16.0 (F)" },
      { key: "Hematocrit", unit: "%", normal: "41–53 (M) / 36–46 (F)" },
      { key: "MCV", unit: "fL", normal: "80–100" },
      { key: "MCH", unit: "pg", normal: "27–33" },
      { key: "MCHC", unit: "g/dL", normal: "32–36" },
      { key: "Platelets", unit: "×10³/µL", normal: "150–400" },
      { key: "Neutrophils", unit: "%", normal: "50–70" },
      { key: "Lymphocytes", unit: "%", normal: "20–40" },
      { key: "Eosinophils", unit: "%", normal: "1–4" },
    ],
  },
  bmp: {
    labelAr: "الكيمياء الحيوية (BMP)",
    labelEn: "Basic Metabolic Panel (BMP)",
    icon: <Dna className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-600",
    fields: [
      { key: "Sodium (Na)", unit: "mEq/L", normal: "136–145" },
      { key: "Potassium (K)", unit: "mEq/L", normal: "3.5–5.1" },
      { key: "Chloride (Cl)", unit: "mEq/L", normal: "98–107" },
      { key: "Bicarbonate (HCO₃)", unit: "mEq/L", normal: "22–29" },
      { key: "BUN", unit: "mg/dL", normal: "7–25" },
      { key: "Creatinine", unit: "mg/dL", normal: "0.6–1.2 (M) / 0.5–1.1 (F)" },
      { key: "Glucose", unit: "mg/dL", normal: "70–100 (fasting)" },
      { key: "Calcium", unit: "mg/dL", normal: "8.5–10.5" },
    ],
  },
  lft: {
    labelAr: "وظائف الكبد (LFT)",
    labelEn: "Liver Function Tests (LFT)",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "from-amber-500 to-orange-600",
    fields: [
      { key: "ALT (SGPT)", unit: "U/L", normal: "7–56" },
      { key: "AST (SGOT)", unit: "U/L", normal: "10–40" },
      { key: "ALP", unit: "U/L", normal: "44–147" },
      { key: "GGT", unit: "U/L", normal: "9–48" },
      { key: "Total Bilirubin", unit: "mg/dL", normal: "0.2–1.2" },
      { key: "Direct Bilirubin", unit: "mg/dL", normal: "0.0–0.3" },
      { key: "Total Protein", unit: "g/dL", normal: "6.3–8.2" },
      { key: "Albumin", unit: "g/dL", normal: "3.5–5.0" },
      { key: "PT/INR", unit: "INR", normal: "0.8–1.2" },
    ],
  },
  thyroid: {
    labelAr: "وظائف الغدة الدرقية (TFT)",
    labelEn: "Thyroid Function Tests (TFT)",
    icon: <Stethoscope className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-600",
    fields: [
      { key: "TSH", unit: "mIU/L", normal: "0.4–4.0" },
      { key: "Free T4 (fT4)", unit: "ng/dL", normal: "0.8–1.8" },
      { key: "Free T3 (fT3)", unit: "pg/mL", normal: "2.3–4.2" },
      { key: "Anti-TPO", unit: "IU/mL", normal: "<35" },
    ],
  },
  lipids: {
    labelAr: "الدهون (Lipid Profile)",
    labelEn: "Lipid Profile",
    icon: <HeartPulse className="w-5 h-5" />,
    color: "from-purple-500 to-fuchsia-600",
    fields: [
      { key: "Total Cholesterol", unit: "mg/dL", normal: "<200" },
      { key: "LDL", unit: "mg/dL", normal: "<100 (optimal)" },
      { key: "HDL", unit: "mg/dL", normal: ">40 (M) / >50 (F)" },
      { key: "Triglycerides", unit: "mg/dL", normal: "<150" },
      { key: "Non-HDL Cholesterol", unit: "mg/dL", normal: "<130" },
    ],
  },
};

type PanelKey = keyof typeof LAB_PANELS;

interface LabEntry {
  key: string;
  value: string;
  unit: string;
}

export default function LabResultsPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";

  const [selectedPanel, setSelectedPanel] = useState<PanelKey>("bmp");
  const [labValues, setLabValues] = useState<Record<string, string>>({});
  const [customEntries, setCustomEntries] = useState<LabEntry[]>([]);
  const [clinicalContext, setClinicalContext] = useState("");
  
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleValueChange = (key: string, value: string) => {
    setLabValues((prev) => ({ ...prev, [key]: value }));
  };

  const addCustomEntry = () => {
    setCustomEntries((prev) => [...prev, { key: "", value: "", unit: "" }]);
  };

  const updateCustomEntry = (idx: number, field: keyof LabEntry, val: string) => {
    setCustomEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e))
    );
  };

  const removeCustomEntry = (idx: number) => {
    setCustomEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildLabText = () => {
    const panel = LAB_PANELS[selectedPanel];
    const lines: string[] = [`Panel: ${panel.labelEn}`];

    panel.fields.forEach(({ key, unit, normal }) => {
      const val = labValues[key];
      if (val?.trim()) {
        lines.push(`${key}: ${val} ${unit} (Reference: ${normal})`);
      }
    });

    customEntries.forEach(({ key, value, unit }) => {
      if (key.trim() && value.trim()) {
        lines.push(`${key}: ${value} ${unit}`);
      }
    });

    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const labText = buildLabText();
    const hasValues = labText.split("\n").length > 1;
    if (!hasValues) return;

    setResult("");
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/lab-interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labText, clinicalContext }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResult(accumulated);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setResult(isAr ? "⚠️ حدث خطأ في الاتصال. حاول مرة أخرى." : "⚠️ Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setLabValues({});
    setCustomEntries([]);
    setClinicalContext("");
    setResult("");
    abortRef.current?.abort();
  };

  const currentPanel = LAB_PANELS[selectedPanel];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700" dir={dir}>
      {/* Premium Hero Header */}
      <div className="relative rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/40 via-teal-700/40 to-slate-900/40 backdrop-blur-3xl" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <Microscope className="w-12 h-12 text-emerald-300" />
          </div>
          <div className="text-center md:text-start flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <Syringe className="w-3.5 h-3.5" />
              {isAr ? "الذكاء الاصطناعي السريري" : "Clinical AI"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-100">
              {isAr ? "مُفسِّر نتائج المختبر" : "Lab Results Interpreter"}
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed font-light">
              {isAr
                ? "أدخل قيم التحاليل المخبرية للحصول على تحليل سريري متعمق يشمل التنبيهات، التشخيص التفريقي، والمبادئ التوجيهية العالمية."
                : "Enter laboratory values for deep clinical interpretation, differential diagnosis, and evidence-based global guidelines."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Data Input */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Panel Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.entries(LAB_PANELS) as [PanelKey, typeof LAB_PANELS[PanelKey]][]).map(([pk, panel]) => (
              <button
                key={pk}
                onClick={() => setSelectedPanel(pk)}
                className={`relative overflow-hidden group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                  selectedPanel === pk
                    ? "bg-gradient-to-br " + panel.color + " border-transparent text-white shadow-lg shadow-" + panel.color.split("-")[1] + "-500/30 scale-100"
                    : "bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] scale-[0.98]"
                }`}
              >
                <div className={`transition-transform duration-300 ${selectedPanel === pk ? "scale-110" : "group-hover:scale-110"}`}>
                  {panel.icon}
                </div>
                <span className="text-xs font-bold text-center leading-tight">
                  {isAr ? panel.labelAr : panel.labelEn}
                </span>
              </button>
            ))}
          </div>

          {/* Dynamic Form Area */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary)] shadow-sm overflow-hidden flex flex-col">
              <div className={`bg-gradient-to-r ${currentPanel.color} p-1`} />
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${currentPanel.color} text-white`}>
                    {currentPanel.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {isAr ? currentPanel.labelAr : currentPanel.labelEn}
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {isAr ? "اترك الحقل فارغاً إذا لم يُطلب التحليل" : "Leave blank if not tested"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentPanel.fields.map(({ key, unit, normal }) => (
                    <div key={key} className="group">
                      <label className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1.5 px-1">
                        <span className="truncate pr-2 text-[var(--text-primary)] group-focus-within:text-emerald-500 transition-colors">{key}</span>
                        <span className="text-[var(--text-muted)] shrink-0">{unit}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={labValues[key] ?? ""}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          placeholder={normal}
                          className="w-full px-4 py-2.5 text-base md:text-sm font-medium rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Custom Entries Section */}
              <div className="px-6 pb-6 pt-2 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/50">
                <div className="flex items-center justify-between mb-4 mt-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? "إضافة تحاليل يدوية" : "Custom Tests"}
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomEntry}
                    className="p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {customEntries.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">
                    {isAr ? "لا توجد تحاليل إضافية." : "No custom tests added."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customEntries.map((entry, idx) => (
                      <div key={idx} className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
                        <input
                          type="text"
                          value={entry.key}
                          onChange={(e) => updateCustomEntry(idx, "key", e.target.value)}
                          placeholder={isAr ? "اسم التحليل" : "Test Name"}
                          className="w-1/3 px-3 py-2 text-base md:text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          value={entry.value}
                          onChange={(e) => updateCustomEntry(idx, "value", e.target.value)}
                          placeholder={isAr ? "القيمة" : "Value"}
                          className="w-1/3 px-3 py-2 text-base md:text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          value={entry.unit}
                          onChange={(e) => updateCustomEntry(idx, "unit", e.target.value)}
                          placeholder={isAr ? "الوحدة" : "Unit"}
                          className="w-1/4 px-3 py-2 text-base md:text-sm rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomEntry(idx)}
                          className="p-2 shrink-0 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Context */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm">
              <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {isAr ? "السياق السريري للمريض" : "Clinical Context"}
              </label>
              <textarea
                value={clinicalContext}
                onChange={(e) => setClinicalContext(e.target.value)}
                placeholder={isAr ? "مثال: مريض ذكر 55 عاماً، مصاب بالسكري، يشكو من التعب والغثيان... (يساعد السياق السريري الذكاء الاصطناعي في ربط النتائج ببعضها)" : "e.g., 55yo male with DM2, presenting with fatigue and nausea... (Context helps the AI correlate findings)"}
                rows={3}
                className="w-full px-4 py-3 text-base md:text-sm rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-[var(--text-primary)] resize-none transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 sticky bottom-4 z-20">
              <button
                type="button"
                onClick={clearAll}
                className="px-5 py-4 rounded-2xl font-bold bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center"
                aria-label="Clear All"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 border border-emerald-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="text-base tracking-wide">
                  {isAr ? "بدء التحليل السريري" : "Analyze Results"}
                </span>
              </button>
            </div>
            
            <p className="text-[10px] md:text-xs text-[var(--text-muted)] text-center px-4 leading-relaxed mt-2">
              {isAr
                ? "أداة مساعدة تعليمية ولا تحل محل الرأي الطبي. راجع المعايير المؤسسية للقرارات النهائية."
                : "Educational decision-support tool. Does not replace professional medical judgment."}
            </p>
          </form>
        </div>

        {/* Right Column: AI Analysis Output */}
        <div className="xl:col-span-7">
          <div className="bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-primary)] shadow-xl overflow-hidden flex flex-col h-[800px] xl:sticky xl:top-6 ring-1 ring-black/5 dark:ring-white/5">
            {/* Output Header */}
            <div className="px-6 py-5 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-inner">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[var(--text-primary)]">
                    {isAr ? "التقرير المخبري الذكي" : "Intelligent Lab Report"}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium">
                    {isAr ? "مدعوم بأحدث الإرشادات السريرية" : "Powered by latest clinical guidelines"}
                  </p>
                </div>
              </div>
              {isLoading && (
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {isAr ? "يتم التحليل..." : "Analyzing..."}
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gradient-to-b from-transparent to-[var(--bg-primary)]/30">
              {!result && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full" />
                    <Microscope className="w-24 h-24 text-[var(--text-muted)] relative z-10" />
                  </div>
                  <div className="max-w-sm">
                    <h3 className="text-lg font-bold text-[var(--text-secondary)] mb-2">
                      {isAr ? "في انتظار البيانات" : "Awaiting Data"}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {isAr
                        ? "قم بتعبئة القيم المخبرية في اللوحة المجاورة لبدء التحليل المدعوم بالذكاء الاصطناعي."
                        : "Fill in the laboratory values in the adjacent panel to begin AI-assisted analysis."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                  prose-h2:text-xl prose-h2:font-black prose-h2:text-emerald-600 dark:prose-h2:text-emerald-400 prose-h2:border-b prose-h2:border-[var(--border-primary)] prose-h2:pb-2 prose-h2:mt-8
                  prose-h3:text-lg prose-h3:font-bold prose-h3:text-[var(--text-primary)]
                  prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed
                  prose-ul:my-4 prose-li:my-1
                  prose-strong:text-[var(--text-primary)] prose-strong:font-bold
                  prose-table:w-full prose-table:text-sm prose-table:border-collapse prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-sm prose-table:border prose-table:border-[var(--border-primary)]
                  prose-thead:bg-[var(--bg-primary)] prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:text-[var(--text-secondary)] prose-th:border-b prose-th:border-[var(--border-primary)]
                  prose-td:p-3 prose-td:border-b prose-td:border-[var(--border-primary)] prose-td:text-[var(--text-secondary)]
                  [&_table_tr:last-child_td]:border-b-0
                  [&_td]:align-middle
                  "
                >
                  {result && (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  )}
                  {isLoading && (
                    <div className="mt-6 flex items-center justify-center p-8">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <span className="text-sm font-medium text-[var(--text-muted)] animate-pulse">
                          {isAr ? "توليد التقرير السريري..." : "Generating clinical report..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
