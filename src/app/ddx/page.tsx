"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/core/i18n/LanguageContext";
import { Stethoscope, AlertTriangle, Send, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function DDxPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [demographics, setDemographics] = useState("");

  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    const patientCase = `Demographics: ${demographics}\nHistory: ${history}\nSymptoms: ${symptoms}`;
    const userMessage = { role: "user", content: patientCase };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/ddx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || "";
                text += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = text;
                  return updated;
                });
              } catch {
                // Ignore parse errors from chunk fragmentation
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Stream error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const clearForm = () => {
    setSymptoms("");
    setHistory("");
    setDemographics("");
    setMessages([]);
    stop();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8" dir={dir}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-medical-teal)] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-3">
              <Stethoscope className="w-10 h-10 md:w-14 md:h-14" />
              {isAr ? "المُشخِّص التفريقي الذكي (DDx)" : "AI Differential Diagnosis (DDx)"}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
              {isAr 
                ? "أدخل الأعراض، التاريخ المرضي، والسمات الديموغرافية للحصول على قائمة تفصيلية بالتشخيصات المحتملة مدعومة بأحدث الأدلة الطبية." 
                : "Enter symptoms, patient history, and demographics to generate a prioritized, evidence-based list of potential diagnoses."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 border border-[var(--border-primary)] shadow-md">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] flex items-center justify-center font-bold">1</span>
              {isAr ? "تفاصيل الحالة" : "Patient Case Details"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  {isAr ? "السمات الديموغرافية (العمر، الجنس، إلخ)" : "Demographics (Age, Gender, etc.)"}
                </label>
                <input
                  type="text"
                  value={demographics}
                  onChange={(e) => setDemographics(e.target.value)}
                  placeholder={isAr ? "مثال: ذكر، 45 عاماً" : "e.g., 45yo Male"}
                  className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--color-medical-indigo)] focus:ring-1 focus:ring-[var(--color-medical-indigo)] transition-all outline-none text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  {isAr ? "التاريخ المرضي" : "Past Medical History"}
                </label>
                <textarea
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder={isAr ? "مثال: ارتفاع ضغط الدم، سكري النوع الثاني..." : "e.g., Hypertension, Type 2 Diabetes..."}
                  className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--color-medical-indigo)] focus:ring-1 focus:ring-[var(--color-medical-indigo)] transition-all outline-none text-[var(--text-primary)] h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  {isAr ? "الأعراض الحالية (مطلوب)" : "Presenting Symptoms (Required)"}
                  <span className="text-red-500 mx-1">*</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={isAr ? "مثال: ألم شديد ومفاجئ في الصدر يمتد للذراع..." : "e.g., Sudden onset severe chest pain radiating to left arm..."}
                  className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] focus:border-[var(--color-medical-indigo)] focus:ring-1 focus:ring-[var(--color-medical-indigo)] transition-all outline-none text-[var(--text-primary)] h-32 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex-1 px-4 py-3 rounded-xl font-bold border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isAr ? "مسح" : "Clear"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !symptoms.trim()}
                  className="flex-[2] bg-[var(--color-medical-indigo)] text-white px-4 py-3 rounded-xl font-bold hover:bg-[var(--color-medical-indigo-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isAr ? "تحليل التشخيص التفريقي" : "Generate DDx"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-3xl p-5 border border-orange-200 dark:border-orange-900 shadow-sm flex gap-4 items-start">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-500 shrink-0 mt-1" />
            <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
              {isAr 
                ? "تنبيه: هذه الأداة مخصصة لمساعدة الأطباء ولا تغني عن التقييم السريري الشامل أو القرار الطبي النهائي."
                : "Disclaimer: This tool is designed to augment clinical decision-making. It does not replace comprehensive clinical evaluation."}
            </p>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 md:p-8 border border-[var(--border-primary)] shadow-md min-h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2 border-b border-[var(--border-primary)] pb-4">
              <span className="w-8 h-8 rounded-full bg-[var(--color-medical-teal)]/10 text-[var(--color-medical-teal)] flex items-center justify-center font-bold">2</span>
              {isAr ? "تقرير التشخيص التفريقي" : "Differential Diagnosis Report"}
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] p-8 text-center space-y-4">
                  <Stethoscope className="w-16 h-16 opacity-20" />
                  <p className="text-lg">
                    {isAr 
                      ? "قم بإدخال تفاصيل الحالة في النموذج واضغط على 'تحليل' للحصول على التشخيص."
                      : "Enter the patient case details and click 'Generate DDx' to see results here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.filter(m => m.role !== 'user').map((m, index) => (
                    <div key={index} className="prose prose-lg dark:prose-invert max-w-none text-[var(--text-primary)] prose-headings:text-[var(--text-primary)] prose-a:text-[var(--color-medical-indigo)]">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-3 text-[var(--color-medical-teal)] font-medium p-4 bg-[var(--color-medical-teal)]/5 rounded-xl border border-[var(--color-medical-teal)]/10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isAr ? "جاري تحليل البيانات الطبية..." : "Analyzing medical data..."}</span>
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

