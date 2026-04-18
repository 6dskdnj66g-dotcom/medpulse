"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Stethoscope, HeartPulse, Send, RefreshCw, Loader2, Info, Mic, MicOff, Volume2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useAchievement } from "@/components/AchievementContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SimulatorWard() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; id: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { addXp } = useAchievement();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start ward if empty
  useEffect(() => {
    if (messages.length === 0) {
      startNewCase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsRecording(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev ? prev + " " + transcript : transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const startNewCase = async () => {
    if (messages.length > 0) {
      const userTurns = messages.filter(m => m.role === "user").length;
      const session = {
        date: new Date().toISOString(),
        module: "OSCE Simulator",
        score: Math.min(userTurns, 10),
        total: 10,
      };
      const stored = JSON.parse(localStorage.getItem("medpulse_sessions") || "[]");
      stored.unshift(session);
      localStorage.setItem("medpulse_sessions", JSON.stringify(stored.slice(0, 50)));
    }
    setMessages([]);
    setInput("");
    setIsLoading(true);

    const initMsg = { id: Date.now().toString(), role: "user" as const, content: "Start a new random clinical simulation case. Describe the patient, vitals, and setting." };
    
    const assistantMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" };
    setMessages([assistantMsg]);

    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [initMsg] }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + text } : m)
        );
      }
    } catch {
      setMessages([{ id: "err", role: "assistant", content: "Simulation failed to start. Please reset ward." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: input.trim() };
    const assistantMsg = { id: (Date.now() + 1).toString(), role: "assistant" as const, content: "" };
    
    const currentMsgs = [...messages];
    if (currentMsgs[0]?.role === "assistant") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentMsgs.unshift({ role: "user", content: "Start a new random clinical simulation. Describe patient passing..." } as any);
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...currentMsgs.map((m) => ({ role: m.role, content: m.content })),
            userMsg,
          ],
        }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + text } : m)
        );
      }
      addXp(10, "Clinical Diagnosis Practice");
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantMsg.id ? { ...m, content: "⚠️ Connection error." } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col animate-in fade-in zoom-in-95 duration-700 relative">
      {/* Background glow */}
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-[var(--color-medical-rose)]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <HeartPulse className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-rose-500 opacity-80" />
              <span className="text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--color-medical-rose)] bg-[var(--color-medical-rose)]/10 px-3 py-1 rounded-[8px] border border-[var(--color-medical-rose)]/20 shadow-sm">Interactive Case</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              OSCE Clinical Simulator
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px] md:text-sm font-medium mt-2">
              Interview the patient, order labs, and establish a diagnosis. AI grades your performance.
            </p>
          </div>
        </div>
        <button
          onClick={startNewCase}
          className="flex items-center space-x-2 bg-[var(--bg-0)] hover:bg-[var(--color-medical-rose)]/5 border border-[var(--border-subtle)] hover:border-[var(--color-medical-rose)]/30 text-[var(--text-primary)] px-5 py-3 rounded-[16px] text-[13px] font-extrabold uppercase tracking-widest transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
        >
          <RefreshCw className="w-4 h-4 text-[var(--color-medical-rose)] group-hover:rotate-180 transition-transform duration-500" />
          <span>New Patient Case</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative z-10">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="medpulse-card glass level-1 bg-slate-900 border-slate-700/50 text-white rounded-[24px] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--color-medical-rose)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h2 className="font-extrabold text-slate-100 text-[12px] uppercase tracking-widest flex items-center">
                <Activity className="w-4 h-4 mr-2 text-rose-400" /> Vitals Monitor
              </h2>
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="bg-slate-800/80 p-4 rounded-[16px] border border-slate-700 shadow-inner backdrop-blur-md">
                <span className="text-[11px] text-[var(--text-tertiary)]/70 font-bold uppercase tracking-widest block mb-2">Heart Rate (bpm)</span>
                <span className="text-3xl font-black text-rose-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">---</span>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-[16px] border border-slate-700 shadow-inner backdrop-blur-md">
                <span className="text-[11px] text-[var(--text-tertiary)]/70 font-bold uppercase tracking-widest block mb-2">Blood Pressure (mmHg)</span>
                <span className="text-3xl font-black text-sky-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">---/---</span>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-[16px] border border-slate-700 shadow-inner backdrop-blur-md">
                <span className="text-[11px] text-[var(--text-tertiary)]/70 font-bold uppercase tracking-widest block mb-2">SpO2 (%)</span>
                <span className="text-3xl font-black text-indigo-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(129,140,248,0.4)]">--%</span>
              </div>
            </div>
          </div>

          <div className="medpulse-card glass level-2 bg-[var(--color-vital-cyan)]/5 border border-[var(--color-vital-cyan)]/10 rounded-[24px] p-6 flex-1 overflow-y-auto">
            <h3 className="font-extrabold text-[var(--color-vital-cyan)] flex items-center mb-4 text-[13px] uppercase tracking-widest">
              <Info className="w-4 h-4 mr-2" />
              How to Play
            </h3>
            <ul className="text-[13px] text-[var(--text-secondary)] font-medium space-y-3 list-none">
              {['Ask the patient questions to gather history.', 'Order specific labs.', 'Perform physical exams.', 'Submit your final diagnosis.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="bg-[var(--color-vital-cyan)]/10 text-[var(--color-vital-cyan)] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black">{i + 1}</span>
                  <span className="mt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 medpulse-card glass level-1 bg-[var(--bg-0)] rounded-[24px] shadow-xl border border-[var(--border-subtle)] flex flex-col relative overflow-hidden">
          <div className="bg-[var(--bg-1)] bg-opacity-80 backdrop-blur-xl border-b border-[var(--border-subtle)] p-5 flex items-center shadow-sm z-20">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--color-medical-indigo)]/10 flex items-center justify-center border border-[var(--color-medical-indigo)]/20 mr-4">
              <Stethoscope className="w-5 h-5 text-[var(--color-medical-indigo)]" />
            </div>
            <div>
              <span className="font-extrabold text-[var(--text-primary)] text-[14px] md:text-[15px] block">Examination Room 1</span>
              <span className="text-[11px] text-[var(--color-medical-indigo)] font-bold uppercase tracking-widest">Active Session</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--bg-0)] z-10 scroll-smooth">
            {messages.map((msg, _idx) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 fade-in duration-500`}>
                <div className={`relative max-w-[85%] rounded-[20px] px-6 py-5 shadow-sm text-[14px] leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-[4px] shadow-lg shadow-indigo-500/20 font-medium" 
                    : "bg-[var(--bg-1)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-[4px]"
                }`}>
                  {msg.role === "assistant" && (
                    <button 
                      onClick={() => speakText(msg.content)}
                      className="absolute top-3 right-3 p-1.5 rounded-[8px] text-[var(--text-tertiary)] hover:text-[var(--color-medical-indigo)] hover:bg-[var(--color-medical-indigo)]/10 transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                  {msg.content ? (
                    <div className={msg.role === "assistant" ? "pr-6" : ""}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node: _node, ...props }) => <a className="text-[var(--color-medical-indigo)] font-extrabold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          p: ({ node: _node, ...props }) => <p className="mb-3 last:mb-0 font-medium" {...props} />,
                          ul: ({ node: _node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node: _node, ...props }) => <strong className="font-extrabold text-[var(--text-primary)]" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="flex items-center space-x-3 text-[var(--color-medical-indigo)] font-extrabold text-[12px] uppercase tracking-widest">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--color-medical-indigo)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[var(--color-medical-indigo)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[var(--color-medical-indigo)] rounded-full animate-bounce" />
                      </div>
                      <span>Thinking...</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 md:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-1)] bg-opacity-80 backdrop-blur-xl z-20">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleRecording}
                className={`p-3.5 rounded-[16px] transition-all border shadow-sm ${
                  isRecording 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse" 
                    : "bg-[var(--bg-0)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/40 hover:text-[var(--color-medical-indigo)]"
                }`}
                title={isRecording ? "Stop Recording" : "Start Voice Input"}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Talk to the patient, order a lab, or state your diagnosis..."
                className="flex-1 bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[16px] px-5 py-4 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-medical-indigo)] focus:ring-1 focus:ring-[var(--color-medical-indigo)] outline-none transition-all font-bold shadow-inner"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:from-[var(--bg-2)] disabled:to-[var(--bg-2)] disabled:text-[var(--text-tertiary)] disabled:shadow-none text-white rounded-[16px] h-[54px] w-[54px] flex items-center justify-center transition-all active:scale-95 shadow-[0_5px_15px_rgba(99,102,241,0.3)] disabled:border disabled:border-[var(--border-subtle)] group"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [loading, user, router]);

  if (loading || !user) return null;
  return <>{children}</>;
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <SimulatorWard />
      </AuthGuard>
    </ErrorBoundary>
  );
}
