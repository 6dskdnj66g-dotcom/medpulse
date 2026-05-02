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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LAB_PANELS = {
  cbc: {
    labelAr: "CBC — صورة الدم الكاملة",
    labelEn: "CBC — Complete Blood Count",
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
    labelAr: "BMP — الكيمياء الحيوية الأساسية",
    labelEn: "BMP — Basic Metabolic Panel",
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
    labelAr: "LFT — وظائف الكبد",
    labelEn: "LFT — Liver Function Tests",
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
    labelAr: "TFT — وظائف الغدة الدرقية",
    labelEn: "TFT — Thyroid Function Tests",
    fields: [
      { key: "TSH", unit: "mIU/L", normal: "0.4–4.0" },
      { key: "Free T4 (fT4)", unit: "ng/dL", normal: "0.8–1.8" },
      { key: "Free T3 (fT3)", unit: "pg/mL", normal: "2.3–4.2" },
      { key: "Anti-TPO", unit: "IU/mL", normal: "<35" },
    ],
  },
  lipids: {
    labelAr: "Lipid Profile — الدهون",
    labelEn: "Lipid Profile",
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
  const [expandedPanel, setExpandedPanel] = useState<PanelKey | null>("bmp");

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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500" dir={dir}>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FlaskConical className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black">
                {isAr ? "مُفسِّر نتائج المختبر الذكي" : "AI Lab Results Interpreter"}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {isAr ? "تحليل سريري متعمق لنتائج التحاليل المخبرية" : "Deep clinical interpretation of laboratory findings"}
              </p>
            </div>
          </div>
          <p className="text-white/90 text-base max-w-3xl leading-relaxed">
            {isAr
              ? "أدخل قيم التحاليل واحصل على تفسير سريري متكامل يشمل تحديد الشذوذات، التشخيصات المحتملة، والخطوات التالية المقترحة وفق أحدث الإرشادات الطبية."
              : "Enter lab values to receive a comprehensive clinical interpretation including abnormality flagging, differential diagnoses, and evidence-based next steps."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Input */}
        <div className="xl:col-span-5 space-y-5">
          {/* Panel Selector */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm">
            <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              {isAr ? "اختر لوحة التحاليل" : "Select Lab Panel"}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(LAB_PANELS) as PanelKey[]).map((pk) => (
                <button
                  key={pk}
                  onClick={() => { setSelectedPanel(pk); setExpandedPanel(pk); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedPanel === pk
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-emerald-500 hover:text-emerald-600"
                  }`}
                >
                  {isAr ? LAB_PANELS[pk].labelAr.split("—")[0].trim() : pk.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Lab Values Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 text-[var(--text-primary)] font-bold hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => setExpandedPanel(expandedPanel === selectedPanel ? null : selectedPanel)}
              >
                <span className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-500" />
                  {isAr ? currentPanel.labelAr : currentPanel.labelEn}
                </span>
                {expandedPanel === selectedPanel ? (
                  <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </button>

              {expandedPanel === selectedPanel && (
                <div className="px-5 pb-5 space-y-3 border-t border-[var(--border-primary)]">
                  <p className="text-xs text-[var(--text-muted)] pt-3">
                    {isAr ? "اترك الحقل فارغاً إذا لم يُطلب التحليل" : "Leave blank if not tested"}
                  </p>
                  {currentPanel.fields.map(({ key, unit, normal }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 truncate">
                          {key}
                          <span className="text-[var(--text-muted)] font-normal mx-1">({unit})</span>
                        </label>
                        <input
                          type="text"
                          value={labValues[key] ?? ""}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          placeholder={normal}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Entries */}
            {customEntries.length > 0 && (
              <div className="mt-4 bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-primary)] space-y-3">
                <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {isAr ? "تحاليل إضافية" : "Additional Tests"}
                </h3>
                {customEntries.map((entry, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={entry.key}
                      onChange={(e) => updateCustomEntry(idx, "key", e.target.value)}
                      placeholder={isAr ? "اسم التحليل" : "Test name"}
                      className="flex-[2] px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={entry.value}
                      onChange={(e) => updateCustomEntry(idx, "value", e.target.value)}
                      placeholder={isAr ? "القيمة" : "Value"}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none text-[var(--text-primary)]"
                    />
                    <input
                      type="text"
                      value={entry.unit}
                      onChange={(e) => updateCustomEntry(idx, "unit", e.target.value)}
                      placeholder={isAr ? "الوحدة" : "Unit"}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 outline-none text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomEntry(idx)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addCustomEntry}
              className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-emerald-600 border border-dashed border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAr ? "إضافة تحليل آخر" : "Add another test"}
            </button>

            {/* Clinical Context */}
            <div className="mt-4 bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-primary)]">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                {isAr ? "السياق السريري (اختياري)" : "Clinical Context (Optional)"}
              </label>
              <textarea
                value={clinicalContext}
                onChange={(e) => setClinicalContext(e.target.value)}
                placeholder={isAr ? "مثال: مريض ذكر 55 عاماً، مصاب بالسكري، يشكو من التعب والغثيان..." : "e.g., 55yo male with DM2, presenting with fatigue and nausea..."}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-[var(--text-primary)] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 py-3 rounded-xl font-bold border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {isAr ? "مسح الكل" : "Clear All"}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[2] py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isAr ? "تفسير النتائج" : "Interpret Results"}
              </button>
            </div>
          </form>

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              {isAr
                ? "هذه الأداة مساعدة تعليمية وسريرية ولا تُغني عن تقييم الطبيب المعالج. القرار النهائي دائماً للطبيب."
                : "This is an educational and clinical support tool. It does not replace physician evaluation. Final clinical decisions rest with the treating physician."}
            </p>
          </div>
        </div>

        {/* Right: Output */}
        <div className="xl:col-span-7">
          <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 md:p-8 border border-[var(--border-primary)] shadow-md min-h-[600px] flex flex-col sticky top-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm">
                Rx
              </span>
              {isAr ? "التفسير السريري" : "Clinical Interpretation"}
            </h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!result && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] p-8 text-center space-y-4">
                  <FlaskConical className="w-16 h-16 opacity-15" />
                  <p className="text-base">
                    {isAr
                      ? "أدخل قيم التحاليل واضغط على 'تفسير النتائج' لرؤية التحليل الطبي هنا."
                      : "Enter lab values and click 'Interpret Results' to see the clinical analysis here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ node: _n, ...props }) => <h2 className="text-lg font-bold mt-4 mb-1 text-[var(--text-primary)]" {...props} />,
                        h3: ({ node: _n, ...props }) => <h3 className="text-base font-semibold mt-3 mb-1 text-[var(--text-primary)]" {...props} />,
                        ul: ({ node: _n, ...props }) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                        ol: ({ node: _n, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                        li: ({ node: _n, ...props }) => <li className="text-sm leading-relaxed" {...props} />,
                        p:  ({ node: _n, ...props }) => <p className="text-sm leading-relaxed my-1" {...props} />,
                        strong: ({ node: _n, ...props }) => <strong className="font-bold text-[var(--text-primary)]" {...props} />,
                        table: ({ node: _n, ...props }) => <div className="overflow-x-auto my-3"><table className="w-full text-sm border-collapse" {...props} /></div>,
                        th: ({ node: _n, ...props }) => <th className="text-left font-semibold border border-[var(--border-primary)] px-2 py-1 bg-[var(--bg-primary)]" {...props} />,
                        td: ({ node: _n, ...props }) => <td className="border border-[var(--border-primary)] px-2 py-1" {...props} />,
                      }}
                    >
                      {result}
                    </ReactMarkdown>
                  )}
                  {isLoading && (
                    <div className="flex items-center gap-3 text-emerald-600 font-medium p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 mt-2">
                      <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                      <span>{isAr ? "جاري تحليل نتائج التحاليل..." : "Analyzing lab results..."}</span>
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
