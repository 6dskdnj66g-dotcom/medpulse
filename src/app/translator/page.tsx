"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Languages, ArrowLeftRight, Loader2, Copy, CheckCircle,
  Save, ShieldCheck
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

export default function MedicalTranslatorPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState("auto");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  const translate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setResult("");
    setSaved(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResult(prev => prev + chunk);
      }
    } catch {
      setResult("⚠️ فشلت عملية الترجمة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToRecords = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("clinical_records").insert({
        user_id: user.id,
        type: "translator_output",
        title: `Translation: ${text.substring(0, 30)}...`,
        content: { original: text, translation: result },
      });
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 w-full page-transition">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <Languages className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white font-arabic">المترجم الطبي الاحترافي</h1>
            <p className="text-slate-500 text-sm mt-1">ترجمة المصطلحات الطبية المعقدة مع سياق سريري دقيق (عربي/إنجليزي)</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Input Card */}
        <div className="premium-card flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">الإدخال</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDirection(direction === "ar-en" ? "en-ar" : "ar-en")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 transition-all hover:bg-indigo-50"
              >
                {direction === "ar-en" ? "عربي ← إنجليزي" : direction === "en-ar" ? "إنجليزي ← عربي" : "كشف تلقائي"}
                <ArrowLeftRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص الطبي، التشخيص، أو المصطلح هنا..."
            className="flex-1 p-6 bg-transparent text-lg font-bold text-slate-800 dark:text-white placeholder-slate-300 outline-none resize-none min-h-[300px]"
          />
          <div className="p-6 pt-0">
            <button
              onClick={translate}
              disabled={isLoading || !text.trim()}
              className="w-full btn-premium bg-gradient-to-r from-indigo-600 to-teal-500 text-white shadow-xl shadow-indigo-500/20 h-14"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> جاري الترجمة...</>
              ) : (
                <><Languages className="w-5 h-5" /> ترجم الآن</>
              )}
            </button>
          </div>
        </div>

        {/* Output Card */}
        <div className="premium-card flex flex-col bg-slate-50/30 dark:bg-slate-900/10 border-indigo-500/10">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              النتيجة السريرية
            </span>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <button onClick={copy} className="p-2 rounded-lg hover:bg-white text-slate-400 transition-all" title="Copy">
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {user && (
                    <button onClick={saveToRecords} className="p-2 rounded-lg hover:bg-white text-slate-400 transition-all" title="Save">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : saved ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
            {result ? (
              <div className="prose prose-indigo dark:prose-invert max-w-none prose-headings:font-black prose-strong:text-indigo-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                <Languages className="w-16 h-16 mb-4" />
                <p className="font-black text-xl">بانتظار الإدخال</p>
                <p className="text-xs mt-2">سيظهر السياق والترجمة الطبية هنا فوراً</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white/50 dark:bg-black/5 rounded-b-3xl">
            <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <p className="text-[10px] font-bold text-emerald-700 leading-tight">مدعوم بقاعدة بيانات المصطلحات الموحدة (Union Medical Dictionary) ومعايير 2026.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
