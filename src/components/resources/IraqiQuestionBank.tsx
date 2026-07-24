"use client";

/**
 * Interactive past-paper MCQ bank for the Iraqi Knowledge Base.
 *
 * Fetches from public.iraqi_mcqs via Supabase (RLS: readable by all).
 * UI mirrors the OSCE simulator's palette — clean cards, indigo accents,
 * clear correct/incorrect feedback, explanation reveal on submit.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Loader2, Info,
  BookOpen, Award, AlertCircle, GraduationCap,
} from "lucide-react";
import { fetchMcqs, type IraqiMcq } from "@/lib/kb/iraqi-kb-client";

interface IraqiQuestionBankProps {
  isAr?: boolean;
  /** Optional: pre-filter to one source college */
  sourceCollege?: string;
  /** Optional: pre-filter to one specialty */
  specialty?: string;
  /** Maximum questions to load in one session */
  limit?: number;
}

interface AttemptState {
  selected: Record<string, string>;   // mcqId → selected label
  submitted: Record<string, boolean>; // mcqId → answer revealed
}

export function IraqiQuestionBank({ isAr = false, sourceCollege, specialty, limit = 50 }: IraqiQuestionBankProps) {
  const [mcqs, setMcqs] = useState<IraqiMcq[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState<AttemptState>({ selected: {}, submitted: {} });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await fetchMcqs({ sourceCollege, specialty, limit });
    setMcqs(data);
    setLoadError(error);
    setLoading(false);
    setIndex(0);
    setAttempt({ selected: {}, submitted: {} });
  }, [sourceCollege, specialty, limit]);

  // Legitimate initial fetch — the effect exists so React can trigger it once on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const total = mcqs.length;
  const current = mcqs[index];

  const stats = useMemo(() => {
    let correct = 0;
    let answered = 0;
    for (const mcq of mcqs) {
      if (attempt.submitted[mcq.id]) {
        answered += 1;
        if (attempt.selected[mcq.id] === mcq.correct_answer) correct += 1;
      }
    }
    return {
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  }, [mcqs, attempt]);

  function selectOption(mcqId: string, label: string) {
    if (attempt.submitted[mcqId]) return;
    setAttempt((prev) => ({ ...prev, selected: { ...prev.selected, [mcqId]: label } }));
  }

  function submit(mcqId: string) {
    if (!attempt.selected[mcqId]) return;
    setAttempt((prev) => ({ ...prev, submitted: { ...prev.submitted, [mcqId]: true } }));
  }

  function goNext() { setIndex((i) => Math.min(i + 1, total - 1)); }
  function goPrev() { setIndex((i) => Math.max(i - 1, 0)); }

  // ── Loading / empty / error states ─────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-[var(--color-medical-indigo)] animate-spin mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {isAr ? "جارٍ تحميل بنك الأسئلة..." : "Loading question bank..."}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-[13px] font-extrabold text-rose-600 dark:text-rose-400 mb-1">
            {isAr ? "تعذّر تحميل الأسئلة" : "Couldn't load questions"}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
            {loadError}
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)] font-medium leading-relaxed mt-2">
            {isAr
              ? "تحقق من تشغيل migration الخاص بقاعدة البيانات في Supabase وأن لديك اتصال بالإنترنت."
              : "Make sure the Iraqi knowledge base migration has been run in Supabase and that you have a network connection."}
          </p>
          <button
            onClick={() => void load()}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-medical-indigo)]/10 text-[var(--color-medical-indigo)] text-[10px] font-black uppercase tracking-widest"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (total === 0 || !current) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-2)] p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-medical-indigo)]/10 flex items-center justify-center mx-auto mb-4 border border-[var(--color-medical-indigo)]/20">
          <BookOpen className="w-6 h-6 text-[var(--color-medical-indigo)]" aria-hidden="true" />
        </div>
        <p className="text-[13px] font-extrabold text-[var(--text-primary)] mb-2">
          {isAr ? "لا توجد أسئلة بعد" : "No questions yet"}
        </p>
        <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-sm mx-auto">
          {isAr
            ? "لم يُضف بعد أي سؤال إلى بنك الأسئلة العراقي. يمكن للمشرف إضافة أسئلة من /admin/knowledge-base."
            : "The Iraqi past-paper bank is empty. Admins can add questions from /admin/knowledge-base."}
        </p>
      </div>
    );
  }

  const questionText = isAr && current.question_text_ar ? current.question_text_ar : current.question_text;
  const explanation = isAr && current.explanation_ar ? current.explanation_ar : current.explanation;
  const isSubmitted = Boolean(attempt.submitted[current.id]);
  const selectedLabel = attempt.selected[current.id];
  const isCorrect = isSubmitted && selectedLabel === current.correct_answer;

  return (
    <div className="space-y-4">
      {/* Progress + stats header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
          {isAr ? `سؤال ${index + 1} من ${total}` : `Question ${index + 1} of ${total}`}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
            <Award className="w-3 h-3" aria-hidden="true" />
            {stats.correct}/{stats.answered}
            {stats.answered > 0 && <span className="text-[9px] opacity-70">· {stats.accuracy}%</span>}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-5 md:p-6 shadow-sm">
        {/* Metadata line */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {current.specialty && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {current.specialty}
            </span>
          )}
          {current.source_college && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1">
              <GraduationCap className="w-3 h-3" aria-hidden="true" />
              {current.source_college}
            </span>
          )}
          {current.year && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {current.year}
            </span>
          )}
          {current.difficulty && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
              current.difficulty === "easy"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                : current.difficulty === "hard"
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/25"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/25"
            }`}>
              {current.difficulty}
            </span>
          )}
        </div>

        {/* Question text */}
        <p className="text-sm md:text-[15px] font-semibold text-[var(--text-primary)] leading-relaxed mb-4">
          {questionText}
        </p>

        {/* Options */}
        <div className="space-y-2">
          {current.options.map((opt) => {
            const optText = isAr && opt.text_ar ? opt.text_ar : opt.text;
            const chosen = selectedLabel === opt.label;
            const isCorrectAnswer = opt.label === current.correct_answer;

            let style = "border-[var(--border-subtle)] bg-[var(--bg-1)] hover:border-[var(--color-medical-indigo)]/40";
            if (isSubmitted) {
              if (isCorrectAnswer)      style = "border-emerald-500/40 bg-emerald-500/5";
              else if (chosen)          style = "border-rose-500/40 bg-rose-500/5";
              else                      style = "border-[var(--border-subtle)] bg-[var(--bg-1)] opacity-60";
            } else if (chosen) {
              style = "border-[var(--color-medical-indigo)]/40 bg-[var(--color-medical-indigo)]/10";
            }

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => selectOption(current.id, opt.label)}
                disabled={isSubmitted}
                aria-pressed={chosen}
                className={`w-full text-left flex items-start gap-3 p-3 md:p-4 rounded-2xl border transition-all ${style} ${
                  isSubmitted ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                  isSubmitted && isCorrectAnswer
                    ? "bg-emerald-500 text-white"
                    : isSubmitted && chosen
                      ? "bg-rose-500 text-white"
                      : chosen
                        ? "bg-[var(--color-medical-indigo)] text-white"
                        : "bg-[var(--bg-3)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}>
                  {opt.label}
                </span>
                <span className="flex-1 text-[13px] font-medium text-[var(--text-primary)] leading-relaxed">
                  {optText}
                </span>
                {isSubmitted && isCorrectAnswer && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" aria-hidden="true" />
                )}
                {isSubmitted && chosen && !isCorrectAnswer && (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-1" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / explanation */}
        {isSubmitted && (
          <div className={`mt-4 rounded-2xl border p-4 flex items-start gap-3 ${
            isCorrect ? "border-emerald-500/25 bg-emerald-500/5" : "border-rose-500/25 bg-rose-500/5"
          }`}>
            {isCorrect
              ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              : <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            }
            <div className="flex-1">
              <p className={`text-[12px] font-black uppercase tracking-widest mb-1 ${
                isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {isCorrect
                  ? (isAr ? "إجابة صحيحة" : "Correct")
                  : (isAr ? `الإجابة الصحيحة: ${current.correct_answer}` : `Correct answer: ${current.correct_answer}`)}
              </p>
              {explanation && (
                <p className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">
                  {explanation}
                </p>
              )}
              {!explanation && (
                <p className="text-[11px] text-[var(--text-tertiary)] font-medium leading-relaxed flex items-center gap-1">
                  <Info className="w-3 h-3" aria-hidden="true" />
                  {isAr ? "لم يُضف شرح لهذا السؤال." : "No explanation was provided for this question."}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit + nav */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            aria-label={isAr ? "السؤال السابق" : "Previous question"}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {isAr ? "السابق" : "Previous"}
          </button>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => submit(current.id)}
              disabled={!selectedLabel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-medical-indigo)] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isAr ? "تحقق من الإجابة" : "Check answer"}
            </button>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
              {isAr ? "تم التقييم" : "Reviewed"}
            </span>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={index >= total - 1}
            aria-label={isAr ? "السؤال التالي" : "Next question"}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-3)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAr ? "التالي" : "Next"}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Restart */}
      {stats.answered > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {isAr ? "إعادة الجلسة" : "Restart session"}
          </button>
        </div>
      )}
    </div>
  );
}
