"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Brain, ShieldCheck, AlertTriangle, Send, Loader2, BookMarked, UserCheck } from "lucide-react";

export default function MDTPage() {
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

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            setCurrentAgent(data.agent);

            if (data.status === 'typing') {
              if (data.agent === 'A') setAgentA(prev => prev + data.chunk);
              if (data.agent === 'B') setAgentB(prev => prev + data.chunk);
              if (data.agent === 'C') setAgentC(prev => prev + data.chunk);
            }
          } catch (e) {
            console.error("Parse error:", e);
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
    <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight flex items-center">
            <Brain className="mr-4 h-10 w-10 text-sky-500" />
            MDT Debate System
          </h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">Multi-Agent AI Debate for High-Complexity Medical Case Anomaly Research</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 text-sm font-bold shadow-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Clinical Grade Engine</span>
          </div>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 backdrop-blur-sm bg-white/70 relative overflow-hidden group">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Pathophysiology of Heart Failure Treatment Anomaly in the elderly'..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-semibold focus:ring-2 focus:ring-sky-500 transition-all placeholder-slate-400"
            />
          </div>
          <button 
            onClick={handleStartDebate}
            disabled={isDebating || !query.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-4 px-8 rounded-2xl flex items-center space-x-3 transition-all shadow-lg active:scale-95"
          >
            {isDebating ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
            <span>{isDebating ? 'Debating...' : 'Initialize Debate'}</span>
          </button>
        </div>
      </div>

      {/* The Debate Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Agent A - Research */}
        <div className={`flex flex-col bg-white rounded-3xl border ${currentAgent === 'A' ? 'border-sky-500 shadow-sky-100 shadow-2xl' : 'border-slate-200'} transition-all overflow-hidden relative`}>
          <div className="p-5 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800">Agent A: Clinical Researcher</h3>
            </div>
            {currentAgent === 'A' && <div className="text-xs font-bold text-sky-500 animate-pulse tracking-widest uppercase">Researching...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-slate-600 font-medium leading-relaxed font-mono text-sm bg-slate-50/20">
            {agentA || (isDebating && agentA.length === 0 && currentAgent === 'A' ? 'Fetching medical vectors...' : <span className="text-slate-300">Awaiting query...</span>)}
          </div>
        </div>

        {/* Agent B - Skeptic */}
        <div className={`flex flex-col bg-white rounded-3xl border ${currentAgent === 'B' ? 'border-amber-500 shadow-amber-100 shadow-2xl' : 'border-slate-200'} transition-all overflow-hidden relative`}>
          <div className="p-5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800">Agent B: MDT Reviewer</h3>
            </div>
            {currentAgent === 'B' && <div className="text-xs font-bold text-amber-500 animate-pulse tracking-widest uppercase">Cross-Examining...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-slate-600 font-medium leading-relaxed font-mono text-sm bg-slate-50/20">
            {agentB || (isDebating && agentB.length === 0 && currentAgent === 'B' ? 'Critiquing clinical research...' : <span className="text-slate-300">Awaiting debate process...</span>)}
          </div>
        </div>

        {/* Agent C - CMO Final */}
        <div className={`flex flex-col bg-white rounded-3xl border ${currentAgent === 'C' ? 'border-teal-500 shadow-teal-100 shadow-2xl' : 'border-slate-200'} transition-all overflow-hidden relative`}>
          <div className="p-5 border-b border-slate-100 bg-teal-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-800">Agent C: CMO Final Consensus</h3>
            </div>
            {currentAgent === 'C' && <div className="text-xs font-bold text-teal-500 animate-pulse tracking-widest uppercase">Synthesizing...</div>}
          </div>
          <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-slate-800 font-bold leading-relaxed font-sans text-sm bg-teal-50/5 border-2 border-teal-50 m-2 rounded-2xl shadow-inner">
            {agentC || (isDebating && agentC.length === 0 && currentAgent === 'C' ? 'Locking in consensus...' : <span className="text-slate-300">Awaiting final verdict...</span>)}
          </div>
        </div>

      </div>
    </div>
  );
}
