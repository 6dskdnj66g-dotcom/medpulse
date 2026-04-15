"use client";

import { useState, useRef, useEffect } from "react";
import { Activity, Stethoscope, HeartPulse, ShieldAlert, Send, RefreshCw, Loader2, Info, Mic, MicOff, Volume2 } from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useAchievement } from "@/components/AchievementContext";

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
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const chunk = JSON.parse(line.slice(2));
              setMessages((prev) =>
                prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m)
              );
            } catch {}
          }
        }
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
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const chunk = JSON.parse(line.slice(2));
              setMessages((prev) =>
                prev.map((m) => m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m)
              );
            } catch {}
          }
        }
      }
      addXp(10);
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantMsg.id ? { ...m, content: "⚠️ Connection error." } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center mb-1">
            <HeartPulse className="w-8 h-8 text-rose-500 mr-3" />
            OSCE Clinical Simulator
          </h1>
          <p className="text-slate-500 text-sm">
            Interview the patient, order labs, and establish a diagnosis. AI grades your performance.
          </p>
        </div>
        <button
          onClick={startNewCase}
          className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Patient Case</span>
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-80 flex flex-col space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Patient Monitor</h2>
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block mb-1">Heart Rate (bpm)</span>
                <span className="text-2xl font-mono text-emerald-400">---</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block mb-1">Blood Pressure (mmHg)</span>
                <span className="text-2xl font-mono text-sky-400">---/---</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <span className="text-xs text-slate-400 block mb-1">SpO2 (%)</span>
                <span className="text-2xl font-mono text-indigo-400">--%</span>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 flex-1 overflow-y-auto">
            <h3 className="font-bold text-sky-800 flex items-center mb-3">
              <Info className="w-4 h-4 mr-2" />
              How to Play
            </h3>
            <ul className="text-sm text-sky-700 space-y-3 list-disc list-inside">
              <li>Ask the patient questions to gather history.</li>
              <li>Order specific labs.</li>
              <li>Perform physical exams.</li>
              <li>Submit your final diagnosis to receive your grade.</li>
            </ul>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center shadow-sm z-10">
            <Stethoscope className="w-5 h-5 text-slate-400 mr-3" />
            <span className="font-bold text-slate-700">Examination Room 1</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" 
                    ? "bg-slate-800 text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm ring-1 ring-slate-900/5"
                }`}>
                  {msg.role === "assistant" && (
                    <button 
                      onClick={() => speakText(msg.content)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                  {msg.content || (
                    <span className="flex items-center space-x-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-xl transition-all ${isRecording ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Talk to the patient, order a lab, or state your diagnosis..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none transition-all font-medium"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl h-12 w-12 flex items-center justify-center transition-colors active:scale-95 shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <SimulatorWard />
    </ErrorBoundary>
  );
}
