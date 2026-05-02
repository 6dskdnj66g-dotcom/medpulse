"use client";

import { useState, useRef, useEffect } from "react";
import { useSupabaseAuth } from '@/core/auth/SupabaseAuthContext';
import {
  Bot, Lock, ShieldCheck, Send, X, Loader2,
  Brain, HeartPulse, Stethoscope, Microscope,
  Sparkles, ChevronRight
} from "lucide-react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/core/i18n/LanguageContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Professor {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  specialty: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  gradient: string;
  description: string;
  descriptionAr: string;
  corpus: string;
  restricted: boolean;
  starterQuestions: string[];
  starterQuestionsAr: string[];
}

const PROFESSORS: Professor[] = [
  {
    id: "dr-turing",
    name: "Dr. Turing",
    nameAr: "د. تورينج",
    title: "Internal Medicine Expert",
    titleAr: "خبير الطب الباطني",
    specialty: "internal-medicine",
    icon: Stethoscope,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
    borderClass: "border-indigo-200",
    textClass: "text-indigo-700",
    gradient: "from-indigo-400 to-sky-500",
    description: "General diagnostics, pathophysiology, and pharmacology within IM scope. Sourced from Harrison's Principles and active clinical guidelines.",
    descriptionAr: "التشخيص العام وعلم الفيزيولوجيا المرضية والصيدلانيات في نطاق الطب الباطني. مستند إلى مبادئ هاريسون والإرشادات السريرية الحالية.",
    corpus: "Harrison's Principles of Internal Medicine, 21st Edition + UpToDate 2024",
    restricted: false,
    starterQuestions: [
      "What are the diagnostic criteria for sepsis?",
      "Explain the pathophysiology of type 2 diabetes.",
      "What is the first-line treatment for community-acquired pneumonia?",
    ],
    starterQuestionsAr: [
      "ما هي المعايير التشخيصية للإنتان (Sepsis)؟",
      "اشرح الفيزيولوجيا المرضية لمرض السكري من النوع الثاني.",
      "ما هو العلاج الخط الأول لالتهاب الرئة المكتسب من المجتمع؟",
    ],
  },
  {
    id: "dr-fleming",
    name: "Dr. Fleming",
    nameAr: "د. فليمينج",
    title: "Surgical Pathology & Oncology",
    titleAr: "علم الأمراض الجراحي والأورام",
    specialty: "pathology",
    icon: Microscope,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    textClass: "text-rose-700",
    gradient: "from-rose-400 to-orange-500",
    description: "Deep-tissue analysis and experimental oncological treatment algorithms. Unrestricted complex case simulator for verified professors.",
    descriptionAr: "تحليل الأنسجة العميقة وخوارزميات علاج السرطان التجريبية. محاكي حالات معقدة غير مقيد للأساتذة المعتمدين.",
    corpus: "Robbins & Cotran Pathology + NCCN Oncology Guidelines 2024",
    restricted: true,
    starterQuestions: [
      "Describe the hallmarks of cancer.",
      "What is the Gleason scoring system?",
      "Explain the mechanism of targeted therapy in NSCLC.",
    ],
    starterQuestionsAr: [
      "صف السمات المميزة للسرطان (Hallmarks of Cancer).",
      "ما هو نظام تصنيف غليسون (Gleason) للسرطان البروستاتي؟",
      "اشرح آلية عمل العلاج الموجه في سرطان الرئة غير الصغير الخلايا.",
    ],
  },
  {
    id: "dr-charcot",
    name: "Dr. Charcot",
    nameAr: "د. شاركو",
    title: "Neurology & Neuroscience",
    titleAr: "طب الأعصاب وعلم الأعصاب",
    specialty: "neurology",
    icon: Brain,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
    textClass: "text-violet-700",
    gradient: "from-violet-400 to-purple-600",
    description: "Stroke protocols, movement disorders, epilepsy, dementia and neuromuscular diseases. Indexed from leading neurology references.",
    descriptionAr: "بروتوكولات السكتة الدماغية واضطرابات الحركة والصرع والخرف والأمراض العصبية العضلية. مستند إلى أبرز مراجع طب الأعصاب.",
    corpus: "Adams & Victor's Neurology + AHA Stroke Guidelines 2024",
    restricted: false,
    starterQuestions: [
      "What is the NIHSS scale used for?",
      "Explain the differences between Parkinson's and essential tremor.",
      "What are the triptans mechanism in migraine treatment?",
    ],
    starterQuestionsAr: [
      "ما استخدام مقياس NIHSS في السكتة الدماغية؟",
      "وضح الفروق بين مرض باركنسون والرعاش الأساسي.",
      "ما آلية عمل عقاقير التريبتان في علاج الصداع النصفي؟",
    ],
  },
  {
    id: "dr-harvey",
    name: "Dr. Harvey",
    nameAr: "د. هارفي",
    title: "Cardiology & Electrophysiology",
    titleAr: "أمراض القلب وفيزيولوجيا الكهرباء",
    specialty: "cardiology",
    icon: HeartPulse,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
    textClass: "text-sky-700",
    gradient: "from-sky-400 to-cyan-500",
    description: "ECG interpretation, heart failure, arrhythmias, and interventional cardiology based on ACC/AHA 2024 guidelines.",
    descriptionAr: "تفسير تخطيط القلب وفشل القلب وعدم انتظام ضربات القلب وطب القلب التداخلي استناداً لإرشادات ACC/AHA 2024.",
    corpus: "Braunwald's Heart Disease + ACC/AHA Clinical Guidelines 2024",
    restricted: false,
    starterQuestions: [
      "How do I interpret a 12-lead ECG systematically?",
      "What is the HFrEF treatment algorithm?",
      "Explain the mechanism of AF and its anticoagulation management.",
    ],
    starterQuestionsAr: [
      "كيف أفسر تخطيط القلب 12-lead بشكل منهجي؟",
      "ما خوارزمية علاج فشل القلب مع انخفاض EF (HFrEF)؟",
      "اشرح آلية الرجفان الأذيني وإدارة مضادات التخثر.",
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
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const displayName = isAr ? professor.nameAr : professor.name;
  const displayTitle = isAr ? professor.titleAr : professor.title;
  const questions = isAr ? professor.starterQuestionsAr : professor.starterQuestions;

  const welcomeMsg = isAr
    ? `مرحباً. أنا **${displayName}** — ${displayTitle}.\n\nتدربتُ حصراً على بيانات سريرية موثقة من: *${professor.corpus}*.\n\nجميع إجاباتي تتضمن اقتباسات الدليل العلمي. كيف يمكنني مساعدتك اليوم؟`
    : `Hello. I am **${professor.name}** — ${professor.title}.\n\nI am trained exclusively on verified clinical data from: *${professor.corpus}*.\n\nAll responses include Evidence Level citations. How can I assist you today?`;

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: welcomeMsg },
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    try {
      const professorId = Object.keys({cardiology:'',internal:'',neurology:'',emergency:'',pharmacology:'',pediatrics:''})
        .find(k => professor.specialty.toLowerCase().includes(k)) || undefined;

      const res = await fetch("/api/ai/professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId,
          lang,
          systemPrompt: professor.corpus ? `${professor.nameAr} - ${professor.titleAr}. Sources: ${professor.corpus}. Reply in formal medical Arabic.` : undefined,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: query },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const errorContent = isTimeout
        ? "⚠️ " + (isAr
            ? "انتهت مهلة الطلب (45 ثانية). خادم الذكاء الاصطناعي يستغرق وقتاً أطول من المعتاد. يرجى المحاولة مرة أخرى."
            : "Request timed out (45s). The AI is taking longer than expected. Please try again.")
        : "⚠️ " + (isAr
            ? "خط بيانات العيادة غير متاح مؤقتاً. يرجى المحاولة مرة أخرى."
            : "Clinical data pipeline temporarily unavailable. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: errorContent } : m
        )
      );
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end md:items-center justify-center sm:p-4 perspective-1000">
      <div className="w-full md:max-w-3xl h-[90vh] md:h-[85vh] rounded-t-[32px] md:rounded-[32px] flex flex-col overflow-hidden glass level-3 animate-in fade-in slide-in-from-bottom-8 duration-500 shadow-2xl" dir={dir}>
        {/* Header */}
        <div className={`p-4 md:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-1)]`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${professor.gradient} transform rotate-3`}>
              <professor.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-[var(--text-primary)] text-lg">{displayName}</h3>
              <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest">{displayTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[var(--bg-2)] hover:bg-[var(--bg-3)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--text-secondary)] transition-all active:scale-95 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[var(--bg-0)] custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${professor.gradient} flex items-center justify-center flex-shrink-0 mt-1 shadow-md z-10 ${dir === "rtl" ? "ml-3" : "mr-3"}`}>
                  <professor.icon className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${
                  msg.role === "user"
                    ? `bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] text-white ${dir === "rtl" ? "rounded-[20px] rounded-bl-[4px]" : "rounded-[20px] rounded-br-[4px]"} `
                    : `glass text-[var(--text-primary)] border border-[var(--border-subtle)] ${dir === "rtl" ? "rounded-[20px] rounded-br-[4px]" : "rounded-[20px] rounded-bl-[4px]"}`
                }`}
              >
                {msg.content ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node: _node, ...props }) => <a className="text-[var(--color-vital-cyan)] font-bold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      p: ({ node: _node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({ node: _node, ...props }) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                      ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                      li: ({ node: _node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node: _node, ...props }) => <strong className="font-extrabold" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex items-center gap-1.5 opacity-80">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-medical-indigo)] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-medical-indigo)] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-medical-indigo)] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="brand-gradient-text text-sm font-bold tracking-wide">
                      {isAr ? "MedPulse يحلل..." : "MedPulse is analyzing..."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Starter Questions */}
        {messages.length === 1 && (
          <div className="px-4 md:px-6 pb-6 space-y-2 bg-[var(--bg-0)]">
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-3 px-2">
              {isAr ? "أسئلة مقترحة" : "Suggested questions"}
            </p>
            <div className="flex flex-col gap-2">
              {questions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className={`w-full text-left text-sm px-4 py-3 rounded-2xl border border-[var(--border-subtle)] ${professor.bgClass} ${professor.textClass} bg-opacity-30 dark:bg-opacity-10 font-medium hover:scale-[1.01] transition-all duration-300 flex items-center justify-between group shadow-sm hover:shadow-md`}
                >
                  <span>{q}</span>
                  <ChevronRight className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 ${dir === "rtl" ? "mr-3 rotate-180" : "ml-3"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 md:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-1)] glass">
          <div className="flex items-center gap-3 md:gap-4 max-w-4xl mx-auto w-full">
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={isAr ? `اسأل ${displayName} سؤالاً سريرياً...` : `Ask ${professor.name} a clinical question...`}
                className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 text-[15px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--color-medical-indigo)] focus:border-transparent outline-none transition-all shadow-inner"
                disabled={isLoading}
                dir={dir}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={`w-14 h-14 bg-gradient-to-r flex-shrink-0 ${professor.gradient} disabled:from-[var(--bg-3)] disabled:to-[var(--bg-3)] disabled:text-[var(--text-tertiary)] text-white rounded-2xl flex items-center justify-center shadow-lg disabled:shadow-none transition-all duration-300 hover:shadow-xl active:scale-95`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={`w-5 h-5 ${dir === "rtl" ? "-scale-x-100" : ""}`} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfessorsInterface() {
  const { loading: isLoading } = useSupabaseAuth();
  const { dir, lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeSession, setActiveSession] = useState<Professor | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3 text-[var(--text-secondary)]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{isAr ? "جارٍ التحقق من الجلسة الآمنة..." : "Authenticating secure session..."}</span>
      </div>
    );
  }

  const canAccessRestricted = true;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full" dir={dir}>
      {activeSession && (
        <ChatModal professor={activeSession} onClose={() => setActiveSession(null)} />
      )}

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-3 flex items-center gap-3">
            <Bot className="h-10 w-10 text-[var(--color-medical-indigo)] flex-shrink-0" />
            <span className="brand-gradient-text">{isAr ? "شبكة الأساتذة الذكاء" : "AI Professor Network"}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-3xl leading-relaxed">
            {isAr
              ? "تفاعل مع وكلاء سريريين متخصصين مدعومين بتقنية RAG. كل أستاذ مُدرَّب حصراً على مجموعة بيانات طبية محددة لمنع الهلوسة بين التخصصات."
              : "Engage with specialized RAG-powered clinical agents. Each Professor is strictly fine-tuned on a dedicated medical corpus to prevent cross-domain hallucination."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 px-5 py-2.5 rounded-xl text-[var(--color-medical-indigo)] text-sm font-bold shadow-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>{isAr ? "خط RAG نشط" : "RAG Pipeline Active"}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {PROFESSORS.map((professor) => {
          const isRestricted = professor.restricted && !canAccessRestricted;
          return (
            <div
              key={professor.id}
              className="medpulse-card overflow-hidden flex flex-col relative group"
            >
              {/* Restricted overlay */}
              {isRestricted && (
                <div className="absolute inset-0 bg-[var(--bg-0)]/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center rtl:space-x-reverse rounded-3xl">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-[var(--border-subtle)]">
                    <Lock className="w-8 h-8 text-[var(--text-tertiary)]" />
                  </div>
                  <h4 className="font-extrabold text-[var(--text-primary)] text-xl mb-2">
                    {isAr ? "مطلوب صلاحية أستاذ" : "Professor Access Required"}
                  </h4>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 max-w-sm">
                    {isAr
                      ? "بدّل إلى دور الأستاذ باستخدام مبدّل الدور للوصول إلى النماذج التجريبية المتخصصة."
                      : "Switch to Professor view using the role toggle to access specialized experimental models."}
                  </p>
                  <button className="text-sm bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-0)] px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95">
                    {isAr ? "طلب الوصول" : "Request Access"}
                  </button>
                </div>
              )}

              {/* Header Banner */}
              <div className={`h-36 bg-gradient-to-br ${professor.gradient} relative overflow-hidden flex items-center justify-center border-b border-[var(--border-subtle)]`}>
                <div className="absolute inset-0 opacity-[0.15] group-hover:opacity-30 mix-blend-overlay transition-opacity duration-500">
                  <professor.icon className="w-48 h-48 text-white absolute -right-8 -top-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
                </div>
                <div className="relative z-10 text-center transform group-hover:-translate-y-1 transition-transform duration-500">
                  <div className="w-16 h-16 glass rounded-[20px] flex items-center justify-center mx-auto shadow-xl border border-white/20">
                    <professor.icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col bg-[var(--bg-0)]">
                <div className="mb-2">
                  <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{isAr ? professor.nameAr : professor.name}</h3>
                  <p className={`text-sm font-bold opacity-90 mt-1 uppercase tracking-wide ${professor.colorClass} ${professor.textClass}`}>
                    {isAr ? professor.titleAr : professor.title}
                  </p>
                </div>
                <p className="text-[var(--text-secondary)] text-sm md:text-[15px] font-medium leading-relaxed mb-6 flex-1">
                  {isAr ? professor.descriptionAr : professor.description}
                </p>
                <div className="flex items-start gap-3 text-xs md:text-sm font-semibold text-[var(--text-tertiary)] bg-[var(--bg-1)] border border-[var(--border-subtle)] rounded-xl p-3 md:p-4 mb-6 shadow-sm">
                  <Sparkles className={`w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0 ${professor.colorClass} ${professor.textClass}`} />
                  <span className="leading-snug">{professor.corpus}</span>
                </div>
                <button
                  onClick={() => !isRestricted && setActiveSession(professor)}
                  className={`w-full py-4 px-6 rounded-xl font-extrabold text-[15px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-sm ${
                    isRestricted
                      ? "bg-[var(--bg-2)] text-[var(--text-tertiary)] cursor-not-allowed border border-[var(--border-subtle)]"
                      : `${professor.bgClass} ${professor.textClass} hover:shadow-md border ${professor.borderClass} hover:opacity-90`
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span>{isAr ? "بدء الجلسة المُخصصة" : "Initialize Session"}</span>
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

