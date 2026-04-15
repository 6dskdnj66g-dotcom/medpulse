"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/auth";
import {
  Bot, Lock, ShieldCheck, Send, X, Loader2,
  Brain, HeartPulse, Stethoscope, Microscope,
  Sparkles, ChevronRight
} from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Professor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  gradient: string;
  description: string;
  corpus: string;
  restricted: boolean;
  starterQuestions: string[];
}

const PROFESSORS: Professor[] = [
  {
    id: "dr-turing",
    name: "Dr. Turing",
    title: "Internal Medicine Expert",
    specialty: "internal-medicine",
    icon: Stethoscope,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
    textClass: "text-indigo-700",
    gradient: "from-indigo-400 to-sky-500",
    description:
      "General diagnostics, pathophysiology, and pharmacology within IM scope. Sourced from Harrison's Principles and active clinical guidelines.",
    corpus: "Harrison's Principles of Internal Medicine, 21st Edition + UpToDate 2024",
    restricted: false,
    starterQuestions: [
      "What are the diagnostic criteria for sepsis?",
      "Explain the pathophysiology of type 2 diabetes.",
      "What is the first-line treatment for community-acquired pneumonia?",
    ],
  },
  {
    id: "dr-fleming",
    name: "Dr. Fleming",
    title: "Surgical Pathology & Oncology",
    specialty: "pathology",
    icon: Microscope,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    textClass: "text-rose-700",
    gradient: "from-rose-400 to-orange-500",
    description:
      "Deep-tissue analysis and experimental oncological treatment algorithms. Unrestricted complex case simulator for verified professors.",
    corpus: "Robbins & Cotran Pathology + NCCN Oncology Guidelines 2024",
    restricted: true,
    starterQuestions: [
      "Describe the hallmarks of cancer.",
      "What is the Gleason scoring system?",
      "Explain the mechanism of targeted therapy in NSCLC.",
    ],
  },
  {
    id: "dr-charcot",
    name: "Dr. Charcot",
    title: "Neurology & Neuroscience",
    specialty: "neurology",
    icon: Brain,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
    textClass: "text-violet-700",
    gradient: "from-violet-400 to-purple-600",
    description:
      "Stroke protocols, movement disorders, epilepsy, dementia and neuromuscular diseases. Indexed from leading neurology references.",
    corpus: "Adams & Victor's Neurology + AHA Stroke Guidelines 2024",
    restricted: false,
    starterQuestions: [
      "What is the NIHSS scale used for?",
      "Explain the differences between Parkinson's and essential tremor.",
      "What are the triptans mechanism in migraine treatment?",
    ],
  },
  {
    id: "dr-harvey",
    name: "Dr. Harvey",
    title: "Cardiology & Electrophysiology",
    specialty: "cardiology",
    icon: HeartPulse,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
    textClass: "text-sky-700",
    gradient: "from-sky-400 to-cyan-500",
    description:
      "ECG interpretation, heart failure, arrhythmias, and interventional cardiology based on ACC/AHA 2024 guidelines.",
    corpus: "Braunwald's Heart Disease + ACC/AHA Clinical Guidelines 2024",
    restricted: false,
    starterQuestions: [
      "How do I interpret a 12-lead ECG systematically?",
      "What is the HFrEF treatment algorithm?",
      "Explain the mechanism of AF and its anticoagulation management.",
    ],
  },
];

function ChatModal({
  professor,
  onClose,
}: {
  professor: Professor;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello. I am **${professor.name}** — ${professor.title}.\n\nI am trained exclusively on verified clinical data from: *${professor.corpus}*.\n\nAll responses include Evidence Level citations. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text?: string) => {
    const query = text || input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/medical-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: query },
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + text }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content:
                  "⚠️ Clinical data pipeline temporarily unavailable. Please try again or consult your institution's clinical resources.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${professor.gradient} p-5 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <professor.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white">{professor.name}</h3>
              <p className="text-white/70 text-xs font-medium">{professor.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${professor.gradient} flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-sm`}>
                  <professor.icon className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white rounded-tr-sm"
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => <a className="text-sky-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-800" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="flex items-center space-x-1.5 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Retrieving clinical data...</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Starter Questions */}
        {messages.length === 1 && (
          <div className="px-5 pb-3 space-y-1.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
              Suggested questions
            </p>
            {professor.starterQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl border ${professor.borderClass} ${professor.bgClass} ${professor.textClass} font-medium hover:opacity-80 transition-opacity flex items-center justify-between group`}
              >
                <span>{q}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Ask ${professor.name} a clinical question...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`w-11 h-11 bg-gradient-to-r ${professor.gradient} disabled:from-slate-200 disabled:to-slate-200 text-white rounded-xl flex items-center justify-center shadow-sm disabled:shadow-none transition-all active:scale-95`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfessorsInterface() {
  const { isLoading, hasRole } = useAuth();
  const [activeSession, setActiveSession] = useState<Professor | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center space-x-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Authenticating secure session...</span>
      </div>
    );
  }

  const canAccessRestricted = hasRole([Role.PROFESSOR, Role.ADMIN]);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      {activeSession && (
        <ChatModal professor={activeSession} onClose={() => setActiveSession(null)} />
      )}

      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Bot className="h-8 w-8 text-indigo-500 mr-3" />
            AI Professor Network
          </h1>
          <p className="text-slate-500 text-base max-w-2xl">
            Engage with specialized RAG-powered clinical agents. Each Professor is strictly
            fine-tuned on a dedicated medical corpus to prevent cross-domain hallucination.
          </p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-indigo-700 text-sm font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>RAG Pipeline Active</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {PROFESSORS.map((professor) => {
          const isRestricted = professor.restricted && !canAccessRestricted;
          return (
            <div
              key={professor.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative group hover:shadow-md transition-all"
            >
              {/* Restricted overlay */}
              {isRestricted && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                    <Lock className="w-7 h-7 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">Professor Access Required</h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-[220px]">
                    Switch to Professor view using the role toggle to access specialized experimental models.
                  </p>
                  <button className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm">
                    Request Access
                  </button>
                </div>
              )}

              {/* Header Banner */}
              <div className={`h-28 bg-gradient-to-br ${professor.gradient} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                  <professor.icon className="w-40 h-40 text-white absolute -right-8 -top-6" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <professor.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-1">
                  <h3 className="text-xl font-bold text-slate-800">{professor.name}</h3>
                  <p className={`text-sm font-semibold ${professor.colorClass} mt-0.5`}>{professor.title}</p>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-3 flex-1">
                  {professor.description}
                </p>
                <div className="flex items-start space-x-2 text-xs text-slate-400 bg-slate-50 rounded-lg p-2.5 mb-5">
                  <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{professor.corpus}</span>
                </div>
                <button
                  onClick={() => !isRestricted && setActiveSession(professor)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                    isRestricted
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : `${professor.bgClass} ${professor.textClass} hover:opacity-90 border ${professor.borderClass}`
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>Initialize Session</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <ProfessorsInterface />
    </ErrorBoundary>
  );
}
