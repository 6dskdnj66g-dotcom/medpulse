"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Brain, ShieldCheck, AlertTriangle, Send, Loader2, BookMarked, UserCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/components/LanguageContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";

export default function MDTPage() {
  const { loading } = useSupabaseAuth();
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

  if (loading) return null;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-100px)] flex flex-col space-y-6 md:space-y-8 overflow-hidden animate-in fade-in zoom-in-95 duration-700 perspective-1000" dir={dir}>
      <div className="flex justify-between items-start flex-wrap gap-4 px-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-4 mb-2 md:mb-3">
            <Brain className="h-10 w-10 md:h-12 md:w-12 text-[var(--color-vital-cyan)] flex-shrink-0 drop-shadow-md" />
            <span className="brand-gradient-text">{isAr ? "نظام مناظرات MDT" : "MDT Debate System"}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] md:text-lg font-bold max-w-3xl">
            {isAr
              ? "مناظرة ذكاء اصطناعي متعددة الوكلاء للحالات الطبية عالية التعقيد"
              : "Multi-Agent AI Debate for High-Complexity Medical Case Anomaly Research"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-vital-cyan)]/10 text-[var(--color-vital-cyan)] px-5 py-2.5 rounded-xl border border-[var(--color-vital-cyan)]/20 text-sm font-extrabold shadow-sm backdrop-blur-sm transition-all hover:scale-105 cursor-default mt-2 md:mt-0">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="uppercase tracking-wide">{isAr ? "محرك سريري متخصص" : "Clinical Grade Engine"}</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="glass level-2 p-3 md:p-4 rounded-3xl border border-[var(--border-subtle)] relative overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--color-vital-cyan)]/50 focus-within:shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <div className="flex-1 relative w-full">
            <Search className={`absolute ${dir === "rtl" ? "right-6" : "left-6"} top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] w-6 h-6 transition-colors`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
              placeholder={isAr ? "مثال: فشل القلب الاحتقاني في كبار السن..." : "e.g. 'Pathophysiology of Heart Failure Treatment Anomaly in the elderly'..."}
              className={`w-full ${dir === "rtl" ? "pr-16 pl-6" : "pl-16 pr-6"} py-5 bg-[var(--bg-0)] border-none rounded-[20px] text-[var(--text-primary)] text-base font-bold shadow-inner placeholder-[var(--text-tertiary)] focus:ring-0 outline-none transition-all`}
            />
          </div>
          <button
            onClick={handleStartDebate}
            disabled={isDebating || !query.trim()}
            className="w-full md:w-auto bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] disabled:bg-[var(--bg-3)] disabled:text-[var(--text-tertiary)] text-[var(--bg-0)] font-extrabold py-5 px-8 rounded-[20px] flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:shadow-none disabled:transform-none"
          >
            {isDebating ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className={`h-6 w-6 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />}
            <span className="text-base tracking-wide">{isDebating ? (isAr ? "جاري النقاش..." : "Debating...") : (isAr ? "بدء النقاش" : "Initialize Debate")}</span>
          </button>
        </div>
      </div>

      {/* The Debate Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 min-h-0 place-items-stretch">
        
        {/* Agent A - Research */}
        <div className={`w-full flex flex-col medpulse-card !rounded-[32px] overflow-hidden ${currentAgent === 'A' ? 'shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)] border-sky-500 scale-[1.02] z-10' : 'border border-[var(--border-subtle)] hover:shadow-lg'} transition-all duration-500 will-change-transform`}>
          <div className="p-5 border-b border-[var(--border-subtle)] bg-sky-500/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 transform -rotate-3">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Agent A:<br/><span className="text-sky-500 text-sm uppercase tracking-widest leading-tight">Clinical Researcher</span></h3>
            </div>
            {currentAgent === 'A' && <div className="text-xs font-bold text-sky-500 animate-pulse tracking-widest uppercase px-3 py-1 bg-sky-500/10 rounded-full">Researching...</div>}
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--bg-0)] custom-scrollbar">
            <div className="text-[15px] font-medium leading-relaxed prose prose-sm max-w-none text-[var(--text-secondary)] prose-a:text-sky-600 prose-strong:text-[var(--text-primary)]">
              {agentA ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentA}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] opacity-60 mt-10">
                  <BookMarked className="w-12 h-12 mb-4" />
                  <span className="font-bold tracking-wide">Awaiting query...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent B - Skeptic */}
        <div className={`w-full flex flex-col medpulse-card !rounded-[32px] overflow-hidden ${currentAgent === 'B' ? 'shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] border-amber-500 scale-[1.02] z-10' : 'border border-[var(--border-subtle)] hover:shadow-lg'} transition-all duration-500 will-change-transform`}>
          <div className="p-5 border-b border-[var(--border-subtle)] bg-amber-500/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 transform rotate-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Agent B:<br/><span className="text-amber-500 text-sm uppercase tracking-widest leading-tight">MDT Reviewer</span></h3>
            </div>
            {currentAgent === 'B' && <div className="text-xs font-bold text-amber-500 animate-pulse tracking-widest uppercase px-3 py-1 bg-amber-500/10 rounded-full">Cross-Examining...</div>}
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--bg-0)] custom-scrollbar">
            <div className="text-[15px] font-medium leading-relaxed prose prose-sm max-w-none text-[var(--text-secondary)] prose-a:text-amber-600 prose-strong:text-[var(--text-primary)]">
              {agentB ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentB}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] opacity-60 mt-10">
                  <AlertTriangle className="w-12 h-12 mb-4" />
                  <span className="font-bold tracking-wide">Awaiting debate process...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent C - CMO Final */}
        <div className={`w-full flex flex-col medpulse-card !rounded-[32px] overflow-hidden ${currentAgent === 'C' ? 'shadow-[0_20px_40px_-15px_rgba(20,184,166,0.3)] border-teal-500 scale-[1.02] z-10' : 'border border-[var(--border-subtle)] hover:shadow-lg'} transition-all duration-500 will-change-transform`}>
          <div className="p-5 border-b border-[var(--border-subtle)] bg-teal-500/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20 transform -rotate-2">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Agent C:<br/><span className="text-teal-500 text-sm uppercase tracking-widest leading-tight">CMO Consenus</span></h3>
            </div>
            {currentAgent === 'C' && <div className="text-xs font-bold text-teal-500 animate-pulse tracking-widest uppercase px-3 py-1 bg-teal-500/10 rounded-full">Synthesizing...</div>}
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--bg-0)] custom-scrollbar relative">
             <div className="absolute inset-0 bg-teal-500/5 mix-blend-overlay pointer-events-none" />
             <div className="text-[15.5px] font-bold leading-relaxed prose prose-sm max-w-none text-[var(--text-primary)] prose-a:text-teal-600 prose-strong:text-teal-700 dark:prose-strong:text-teal-400 z-10 relative">
              {agentC ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentC}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] opacity-60 mt-10">
                  <UserCheck className="w-12 h-12 mb-4" />
                  <span className="font-bold tracking-wide">Awaiting verdict...</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
