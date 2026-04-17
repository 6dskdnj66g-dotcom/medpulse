"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Brain, ShieldCheck, AlertTriangle, Send, Loader2, BookMarked, UserCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/LanguageContext";

export default function MDTPage() {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [query, setQuery] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [agentA, setAgentA] = useState("");
  const [agentB, setAgentB] = useState("");
  const [agentC, setAgentC] = useState("");
  const [currentAgent, setCurrentAgent] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentA, agentB, agentC]);

  const handleStartDebate = async () => {
    if (!query.trim()) return;

    setIsDebating(true);
    setAgentA("");
    setAgentB("");
    setAgentC("");
    setCurrentAgent("");

    try {
      const response = await fetch("/api/mdt-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            setCurrentAgent(data.agent);

            if (data.status === 'typing') {
              if (data.agent === 'A') setAgentA(prev => prev + data.chunk);
              if (data.agent === 'B') setAgentB(prev => prev + data.chunk);
              if (data.agent === 'C') setAgentC(prev => prev + data.chunk);
            }
          } catch (e) {
            console.warn("Parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("MDT Stream error:", error);
    } finally {
      setIsDebating(false);
      setCurrentAgent("");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col space-y-6 overflow-hidden" dir={dir}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-4">
            <Brain className="h-10 w-10 text-sky-500 flex-shrink-0" />
            {isAr ? "نظام مناظرات MDT" : "MDT Debate System"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-2 font-medium">
            {isAr
              ? "مناظرة ذكاء اصطناعي متعددة الوكلاء للحالات الطبية عالية التعقيد"
              : "Multi-Agent AI Debate for High-Complexity Medical Case Anomaly Research"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800 text-sm font-bold shadow-sm">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>{isAr ? "محرك سريري متخصص" : "Clinical Grade Engine"}</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
              placeholder={isAr ? "مثال: فشل القلب الاحتقاني في كبار السن..." : "e.g. 'Pathophysiology of Heart Failure Treatment Anomaly in the elderly'..."}
              className={`w-full ${dir === "rtl" ? "pr-12 pl-4" : "pl-12 pr-4"} py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-sky-500 transition-all placeholder-slate-400`}
            />
          </div>
          <button
            onClick={handleStartDebate}
            disabled={isDebating || !query.trim()}
            className="bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition-all shadow-lg active:scale-95"
          >
            {isDebating ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
            <span>{isDebating ? (isAr ? "جاري النقاش..." : "Debating...") : (isAr ? "بدء النقاش" : "Initialize Debate")}</span>
          </button>
        </div>
      </div>

      {/* The Debate Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Agent A - Research */}
        <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border ${currentAgent === 'A' ? 'border-sky-500 shadow-sky-100 dark:shadow-sky-900/50 shadow-2xl' : 'border-slate-200 dark:border-slate-800'} transition-all overflow-hidden`}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-sky-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Agent A: Clinical Researcher</h3>
            </div>
            {currentAgent === 'A' && <div className="text-xs font-bold text-sky-500 animate-pulse tracking-widest uppercase">Researching...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm prose prose-sm max-w-none prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline">
            {agentA ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentA}</ReactMarkdown>
            ) : (
              <span className="text-slate-300 dark:text-slate-600">Awaiting query...</span>
            )}
          </div>
        </div>

        {/* Agent B - Skeptic */}
        <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border ${currentAgent === 'B' ? 'border-amber-500 shadow-amber-100 dark:shadow-amber-900/50 shadow-2xl' : 'border-slate-200 dark:border-slate-800'} transition-all overflow-hidden`}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Agent B: MDT Reviewer</h3>
            </div>
            {currentAgent === 'B' && <div className="text-xs font-bold text-amber-500 animate-pulse tracking-widest uppercase">Cross-Examining...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm prose prose-sm max-w-none prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
            {agentB ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentB}</ReactMarkdown>
            ) : (
              <span className="text-slate-300 dark:text-slate-600">Awaiting debate process...</span>
            )}
          </div>
        </div>

        {/* Agent C - CMO Final */}
        <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border ${currentAgent === 'C' ? 'border-teal-500 shadow-teal-100 dark:shadow-teal-900/50 shadow-2xl' : 'border-slate-200 dark:border-slate-800'} transition-all overflow-hidden`}>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Agent C: CMO Final Consensus</h3>
            </div>
            {currentAgent === 'C' && <div className="text-xs font-bold text-teal-500 animate-pulse tracking-widest uppercase">Synthesizing...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto text-slate-800 dark:text-teal-100 font-bold leading-relaxed text-sm bg-teal-50/5 dark:bg-teal-900/10 border-2 border-teal-50 dark:border-teal-900/30 m-2 rounded-2xl shadow-inner prose prose-sm max-w-none prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
            {agentC ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentC}</ReactMarkdown>
            ) : (
              <span className="text-slate-300 dark:text-slate-600">Awaiting final verdict...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
