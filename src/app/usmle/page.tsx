"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Trophy, Clock, CheckCircle, X, ChevronRight, RotateCcw, Award,
  BookOpen, Brain, Play, BarChart3, Settings, Languages, Highlighter,
  Sparkles, Flag, Download, Upload, AlertCircle,
} from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";

type Question = {
  id: string;
  step: string;
  specialty: string;
  difficulty: "Easy" | "Medium" | "Hard";
  vignette: string;
  options: string[];
  answer: number;
  explanation: string;
  educationalObjective: string;
};

type AttemptRecord = {
  questionId: string;
  correct: boolean;
  specialty: string;
  timeSpent: number;
  selectedAnswer: number;
};

type Mode = "select" | "quiz" | "results" | "analytics";
type DifficultyPref = "all" | "Easy" | "Medium" | "Hard";
type StepPref = "all" | "step1" | "step2ck";

export default function USMLEPage() {
  const { addXp } = useAchievement();
  const [mode, setMode] = useState<Mode>("select");

  // Quiz config
  const [stepPref, setStepPref] = useState<StepPref>("all");
  const [specialtyPref, setSpecialtyPref] = useState<string>("all");
  const [difficultyPref, setDifficultyPref] = useState<DifficultyPref>("all");
  const [questionCountPref, setQuestionCountPref] = useState<number>(10);
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [isTutor, setIsTutor] = useState<boolean>(true);

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const questionStartRef = useRef<number>(Date.now());

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [blockStartTime, setBlockStartTime] = useState<number>(0);

  // Highlighter & Notes
  const [highlightMode, setHighlightMode] = useState(false);
  const stemRef = useRef<HTMLParagraphElement>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({});
  const [savedFlashcards, setSavedFlashcards] = useState<unknown[]>([]);

  useEffect(() => {
    const savedN = localStorage.getItem("usmle_notes");
    if (savedN) setPersonalNotes(JSON.parse(savedN));
    const savedF = localStorage.getItem("usmle_flashcards");
    if (savedF) {
      try { setSavedFlashcards(JSON.parse(savedF)); } catch { setSavedFlashcards([]); }
    }
  }, []);

  const handleSaveNote = (id: string, text: string) => {
    const next = { ...personalNotes, [id]: text };
    setPersonalNotes(next);
    localStorage.setItem("usmle_notes", JSON.stringify(next));
  };

  const applyHighlight = () => {
    if (!highlightMode) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().length < 2) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = "rgba(250,204,21,0.35)";
    span.style.borderRadius = "2px";
    span.style.padding = "0 1px";
    try { range.surroundContents(span); } catch { /* ignore cross-element */ }
    selection.removeAllRanges();
  };

  // Translation state
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // AI Explanation state
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Stats (persisted)
  const [stats, setStats] = useState({
    totalAttempted: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    specialties: {} as Record<string, { attempted: number; correct: number }>,
  });

  const updateStats = useCallback((isCorrect: boolean, specialty?: string) => {
    setStats(prev => {
      const next = { ...prev, specialties: { ...prev.specialties } };
      next.totalAttempted += 1;
      if (specialty) {
        if (!next.specialties[specialty]) next.specialties[specialty] = { attempted: 0, correct: 0 };
        next.specialties[specialty] = { ...next.specialties[specialty] };
        next.specialties[specialty].attempted += 1;
        if (isCorrect) next.specialties[specialty].correct += 1;
      }
      if (isCorrect) {
        next.correct += 1;
        next.streak += 1;
        if (next.streak > next.bestStreak) next.bestStreak = next.streak;
      } else {
        next.streak = 0;
      }
      localStorage.setItem("usmle_stats", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("usmle_stats");
    if (saved) { try { setStats(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (mode === "quiz" && isTimed && timeLeft > 0 && !showAnswer) {
      timer = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    } else if (mode === "quiz" && isTimed && timeLeft === 0 && !showAnswer && questions.length > 0) {
      setShowAnswer(true);
      updateStats(false, questions[currentQ]?.specialty);
    }
    return () => clearTimeout(timer);
  }, [mode, isTimed, timeLeft, showAnswer, currentQ, questions, updateStats]);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({
        step: stepPref, specialty: specialtyPref,
        difficulty: difficultyPref, limit: questionCountPref.toString(),
      });
      const res = await fetch(`/api/usmle/questions?${qs}`);
      const data = await res.json();
      if (data.questions?.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setSelectedOption(null);
        setShowAnswer(false);
        setScore(0);
        setAttempts([]);
        setMarkedForReview(new Set());
        const now = Date.now();
        setBlockStartTime(now);
        questionStartRef.current = now;
        if (isTimed) setTimeLeft(data.questions.length * 90);
        setMode("quiz");
      } else {
        alert("No questions found for these filters. Try broader settings.");
      }
    } catch {
      alert("Error loading questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (text: string, id: string) => {
    if (translations[id]) return;
    const cacheKey = `usmle_trans_${id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) { setTranslations(p => ({ ...p, [id]: cached })); return; }
    setIsTranslating(true);
    try {
      const res = await fetch("/api/mdt/process", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: `Translate to Arabic (medical): ${text}` }] }),
      });
      const d = await res.json();
      if (d.reply) {
        setTranslations(p => ({ ...p, [id]: d.reply }));
        localStorage.setItem(cacheKey, d.reply);
      }
    } catch { /* ignore */ } finally { setIsTranslating(false); }
  };

  const handleCheckAnswer = (forced: number | null = selectedOption) => {
    if (forced === null && !isTimed) return;
    setShowAnswer(true);
    const q = questions[currentQ];
    const isCorrect = forced === q.answer;
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    setAttempts(p => [...p, { questionId: q.id, correct: isCorrect, specialty: q.specialty, timeSpent, selectedAnswer: forced ?? -1 }]);
    if (isCorrect) { setScore(s => s + 1); addXp(20, "USMLE Question Correct"); }
    updateStats(isCorrect, q.specialty);
  };

  const handleExplainDeeper = async () => {
    const q = questions[currentQ];
    if (!q || selectedOption === null) return;
    setIsGeneratingAi(true);
    setAiExplanation(null);
    try {
      const res = await fetch("/api/usmle/explain", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vignette: q.vignette, options: q.options, correctAnswer: q.answer, selectedAnswer: selectedOption }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation ?? data.error ?? "Failed to generate explanation.");
    } catch {
      setAiExplanation("Failed to fetch explanation. Please try again.");
    } finally { setIsGeneratingAi(false); }
  };

  const nextQuestion = () => {
    setAiExplanation(null);
    setIsGeneratingAi(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(p => p + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setHighlightMode(false);
      questionStartRef.current = Date.now();
    } else {
      setMode("results");
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleExport = () => {
    const data = { stats, notes: personalNotes, flashcards: savedFlashcards, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "medpulse-usmle-backup.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string);
        if (d.stats) { setStats(d.stats); localStorage.setItem("usmle_stats", JSON.stringify(d.stats)); }
        if (d.notes) { setPersonalNotes(d.notes); localStorage.setItem("usmle_notes", JSON.stringify(d.notes)); }
        if (d.flashcards) { setSavedFlashcards(d.flashcards); localStorage.setItem("usmle_flashcards", JSON.stringify(d.flashcards)); }
        alert("Data imported successfully.");
      } catch { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── SELECT SCREEN ─────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between mt-10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
              USMLE Question Bank
            </h1>
            <p className="text-gray-400">
              {questions.length > 0 ? `${questions.length} questions loaded` : "5,300+ Step 1 & Step 2 CK board-style questions"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMode("analytics")}
              className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="hidden sm:inline font-medium text-white">Dashboard</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Config panel */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-400" /> Exam Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Exam Step</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "step1", "step2ck"] as StepPref[]).map(s => (
                    <button key={s} onClick={() => setStepPref(s)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${stepPref === s ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      {s === "all" ? "Mixed" : s === "step1" ? "Step 1" : "Step 2 CK"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject / System</label>
                <div className="relative">
                  <select value={specialtyPref} onChange={e => setSpecialtyPref(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer border border-gray-600 font-medium">
                    <option value="all">All Systems (Mixed Block)</option>
                    <option value="Cardiology">Cardiology / Cardiovascular</option>
                    <option value="Pulmonology">Pulmonology / Respiratory</option>
                    <option value="GI">Gastroenterology / GI</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Hematology">Hematology / Oncology</option>
                    <option value="Nephrology">Nephrology / Renal</option>
                    <option value="ID">Infectious Disease</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Rheumatology">Rheumatology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="OB/GYN">OB/GYN</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Emergency">Emergency Medicine</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Biostatistics">Biostatistics / Ethics</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["all", "Easy", "Medium", "Hard"] as DifficultyPref[]).map(d => (
                    <button key={d} onClick={() => setDifficultyPref(d)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${difficultyPref === d ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      {d === "all" ? "All" : d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number of Questions: <span className="text-white font-bold">{questionCountPref}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[10, 20, 40].map(n => (
                    <button key={n} onClick={() => setQuestionCountPref(n)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${questionCountPref === n ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      {n}
                    </button>
                  ))}
                  <input type="range" min="5" max="40" step="5" value={questionCountPref}
                    onChange={e => setQuestionCountPref(parseInt(e.target.value))}
                    className="flex-1 min-w-[80px] accent-blue-500 self-center" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isTutor} onChange={e => setIsTutor(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 bg-gray-700" />
                  <span className="text-white font-medium text-sm">Tutor Mode — show answers immediately</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isTimed} onChange={e => setIsTimed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 bg-gray-700" />
                  <span className="text-white font-medium text-sm">Timed Mode — 90s per question</span>
                </label>
              </div>

              <button onClick={startQuiz} disabled={isLoading}
                className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 text-lg shadow-lg">
                {isLoading ? "Loading questions…" : <><Play className="w-5 h-5 fill-current" /> Start Block</>}
              </button>

              {/* Export / Import */}
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button onClick={handleExport}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                  <Download className="w-3.5 h-3.5" /> Export Data
                </button>
                <label className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Import Data
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
              </div>
            </div>
          </div>

          {/* Progress panel */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-900/40 flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Your Progress</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <div className="text-gray-400 text-sm mb-1">Attempted</div>
                <div className="text-3xl font-bold text-white">{stats.totalAttempted}</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <div className="text-gray-400 text-sm mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-blue-400">
                  {stats.totalAttempted > 0 ? Math.round((stats.correct / stats.totalAttempted) * 100) : 0}%
                </div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <div className="text-gray-400 text-sm mb-1">Streak</div>
                <div className="text-3xl font-bold text-amber-500 flex items-center justify-center gap-1">
                  {stats.streak} <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <div className="text-gray-400 text-sm mb-1">Best Streak</div>
                <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-1">
                  {stats.bestStreak} <Trophy className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ANALYTICS SCREEN ──────────────────────────────────────────────────────
  if (mode === "analytics") {
    const specEntries = Object.entries(stats.specialties).filter(([, s]) => s.attempted > 0);
    const weakAreas = specEntries.filter(([, s]) => Math.round((s.correct / s.attempted) * 100) < 60);

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 mt-10 space-y-6">
        <button onClick={() => setMode("select")} className="text-gray-400 hover:text-white flex items-center gap-2 mb-6">
          <RotateCcw className="w-4 h-4" /> Back to Setup
        </button>
        <h1 className="text-3xl font-bold text-white mb-6">Performance Dashboard</h1>

        {/* Global stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Attempted", value: stats.totalAttempted, color: "text-white" },
            { label: "Correct", value: stats.correct, color: "text-green-400" },
            { label: "Accuracy", value: `${stats.totalAttempted > 0 ? Math.round((stats.correct / stats.totalAttempted) * 100) : 0}%`, color: "text-blue-400" },
            { label: "Best Streak", value: stats.bestStreak, color: "text-amber-400" },
          ].map(item => (
            <div key={item.label} className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
              <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">{item.label}</div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Weak areas */}
        {weakAreas.length > 0 && (
          <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-4">
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Areas Needing Attention (&lt;60% accuracy)
            </h3>
            <div className="flex flex-wrap gap-2">
              {weakAreas.map(([spec, s]) => (
                <span key={spec} className="px-3 py-1 bg-red-900/30 border border-red-800/50 rounded-full text-red-300 text-xs font-semibold">
                  {spec} — {Math.round((s.correct / s.attempted) * 100)}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specialty breakdown */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-400 w-5 h-5" /> Performance by Specialty
          </h2>
          {specEntries.length === 0 ? (
            <p className="text-gray-400 italic">No data yet. Take some quizzes to see your analytics!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specEntries.sort((a, b) => {
                const accA = (a[1].correct / a[1].attempted);
                const accB = (b[1].correct / b[1].attempted);
                return accA - accB;
              }).map(([spec, s]) => {
                const acc = Math.round((s.correct / s.attempted) * 100);
                return (
                  <div key={spec} className="bg-gray-700/50 p-3 rounded-xl border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-semibold text-sm">{spec}</span>
                      <span className={`text-sm font-bold ${acc >= 75 ? "text-green-400" : acc >= 60 ? "text-yellow-400" : "text-red-400"}`}>{acc}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{s.correct} correct / {s.attempted} total</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${acc >= 75 ? "bg-green-500" : acc >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${acc}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ────────────────────────────────────────────────────────
  if (mode === "results") {
    const totalTime = Math.round((Date.now() - blockStartTime) / 1000);
    const avgTime = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.timeSpent, 0) / attempts.length) : 0;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;

    // Specialty breakdown from this block
    const blockSpecialties: Record<string, { correct: number; total: number }> = {};
    for (const a of attempts) {
      if (!blockSpecialties[a.specialty]) blockSpecialties[a.specialty] = { correct: 0, total: 0 };
      blockSpecialties[a.specialty].total += 1;
      if (a.correct) blockSpecialties[a.specialty].correct += 1;
    }
    const weakThisBlock = Object.entries(blockSpecialties).filter(([, s]) => s.total > 0 && Math.round((s.correct / s.total) * 100) < 60);

    return (
      <div className="min-h-screen bg-gray-950 flex items-start justify-center p-4 pt-16">
        <div className="bg-gray-800 rounded-3xl max-w-2xl w-full border border-gray-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${passed ? "bg-green-900/20" : "bg-red-900/10"}`}>
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? "text-yellow-500" : "text-gray-500"}`} />
            <h2 className="text-3xl font-bold text-white mb-1">Block Complete!</h2>
            <p className="text-gray-400 text-sm">
              {isTimed ? "Timed Mode" : "Tutor Mode"} · {questions[0]?.step ?? "Mixed"}
            </p>
          </div>

          {/* Score */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className={`text-6xl font-black mb-1 ${passed ? "text-green-400" : "text-red-400"}`}>{pct}%</div>
                <div className="text-gray-400 text-sm">{score} / {questions.length} correct</div>
              </div>
              <div className="h-16 w-px bg-gray-700" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="text-gray-400">Total time</div>
                <div className="text-white font-semibold">{formatTime(totalTime)}</div>
                <div className="text-gray-400">Avg / question</div>
                <div className="text-white font-semibold">{avgTime}s</div>
              </div>
            </div>
          </div>

          {/* Specialty breakdown */}
          {Object.keys(blockSpecialties).length > 0 && (
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">This Block — by Specialty</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(blockSpecialties).map(([spec, s]) => {
                  const acc = Math.round((s.correct / s.total) * 100);
                  return (
                    <div key={spec} className="flex items-center justify-between bg-gray-700/40 rounded-lg px-3 py-2">
                      <span className="text-gray-300 text-xs font-medium truncate">{spec}</span>
                      <span className={`text-xs font-bold ml-2 shrink-0 ${acc >= 75 ? "text-green-400" : acc >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {s.correct}/{s.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weak areas */}
          {weakThisBlock.length > 0 && (
            <div className="px-6 py-4 bg-amber-900/10 border-b border-amber-800/20">
              <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Focus areas for next session
              </p>
              <div className="flex flex-wrap gap-1.5">
                {weakThisBlock.map(([spec]) => (
                  <span key={spec} className="px-2 py-0.5 bg-amber-900/30 border border-amber-800/50 rounded-full text-amber-300 text-xs">{spec}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 space-y-3">
            <button onClick={() => { setMode("select"); setQuestions([]); }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition">
              Start New Block
            </button>
            <button onClick={() => setMode("analytics")}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl transition flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" /> View Full Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading…</div>;

  const q = questions[currentQ];

  // ─── QUIZ SCREEN ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-10 space-y-4">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-gray-800 p-3 px-4 rounded-xl shadow border border-gray-700">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm font-medium">
            {currentQ + 1} <span className="text-gray-600">/</span> {questions.length}
          </span>
          <span className="hidden sm:inline px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded-md text-xs font-bold border border-blue-800/50 uppercase">{q.specialty}</span>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
            q.difficulty === "Easy" ? "bg-green-900/50 text-green-400 border border-green-800/50" :
            q.difficulty === "Medium" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-800/50" :
            "bg-red-900/50 text-red-400 border border-red-800/50"
          }`}>{q.difficulty}</span>
          {markedForReview.has(currentQ) && (
            <span className="px-2 py-0.5 bg-orange-900/50 text-orange-400 rounded-md text-xs font-bold border border-orange-800/50 uppercase flex items-center gap-1">
              <Flag className="w-3 h-3" /> Flagged
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMarkedForReview(p => { const s = new Set(p); if (s.has(currentQ)) s.delete(currentQ); else s.add(currentQ); return s; })}
            className={`p-2 rounded-lg transition ${markedForReview.has(currentQ) ? "bg-orange-900/50 text-orange-400" : "bg-gray-700 text-gray-400 hover:text-orange-400"}`}
            title="Flag for review">
            <Flag className="w-4 h-4" />
          </button>
          {isTimed && (
            <div className={`flex items-center gap-1.5 font-mono text-lg font-bold px-3 py-1 rounded-lg ${
              timeLeft < 30 ? "bg-red-900/30 text-red-400 animate-pulse" : "bg-gray-900 text-gray-300"
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Vignette */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700/50">
          <button onClick={() => setHighlightMode(p => !p)}
            className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${highlightMode ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50" : "bg-gray-700 text-gray-400 hover:text-gray-200"}`}>
            <Highlighter className="w-4 h-4" />
            {highlightMode ? "Highlighter ON" : "Highlight"}
          </button>
          <button
            onClick={() => handleTranslate(q.vignette, q.id || `stem_${currentQ}`)}
            disabled={isTranslating}
            className="p-1.5 px-2.5 bg-gray-700 hover:bg-gray-600 rounded-md text-blue-400 transition flex items-center gap-1.5 text-xs font-semibold">
            <Languages className="w-4 h-4" />
            {isTranslating ? "…" : "عربي"}
          </button>
        </div>

        <p ref={stemRef} onMouseUp={applyHighlight}
          className={`text-base md:text-lg text-white leading-relaxed ${highlightMode ? "cursor-text selection:bg-yellow-500/30" : ""}`}>
          {q.vignette}
        </p>

        {translations[q.id || `stem_${currentQ}`] && (
          <div className="mt-4 p-4 bg-gray-700/30 rounded-xl border-l-4 border-l-blue-500" dir="rtl">
            <p className="text-gray-300 text-base leading-loose">{translations[q.id || `stem_${currentQ}`]}</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl space-y-3">
        {q.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === q.answer;
          let cls = "w-full text-left p-4 rounded-xl border transition flex items-center gap-3 ";
          if (!showAnswer) {
            cls += isSelected
              ? "border-blue-500 bg-blue-900/20 shadow-[0_0_12px_rgba(59,130,246,0.15)] text-white"
              : "border-gray-700 bg-gray-800/80 hover:bg-gray-700 hover:border-gray-500 text-gray-300";
          } else {
            if (isCorrect) cls += "border-green-500 bg-green-900/20 text-white";
            else if (isSelected && !isCorrect) cls += "border-red-500 bg-red-900/20 text-white";
            else cls += "border-gray-700 bg-gray-800/50 text-gray-500 opacity-60";
          }
          return (
            <button key={idx} onClick={() => !showAnswer && setSelectedOption(idx)} disabled={showAnswer} className={cls}>
              <div className={`w-6 h-6 shrink-0 rounded flex items-center justify-center border text-xs font-bold ${
                showAnswer && isCorrect ? "bg-green-500 border-green-500 text-white" :
                showAnswer && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                isSelected ? "bg-blue-500 border-blue-500 text-white" : "border-gray-600 text-gray-400"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1">{opt}</span>
              {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
              {showAnswer && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Action area */}
      {!showAnswer ? (
        <div className="flex gap-3">
          <button onClick={() => handleCheckAnswer()} disabled={selectedOption === null}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg">
            {isTutor ? "Check Answer" : "Submit"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Explanation */}
          <div className={`p-6 rounded-2xl border ${selectedOption === q.answer ? "bg-green-900/10 border-green-800/30" : "bg-red-900/10 border-red-800/30"}`}>
            <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${selectedOption === q.answer ? "text-green-400" : "text-red-400"}`}>
              {selectedOption === q.answer
                ? <><CheckCircle className="w-6 h-6" /> Correct!</>
                : <><X className="w-6 h-6" /> Incorrect</>}
            </h3>

            <p className="text-gray-300 leading-relaxed text-base pb-4 border-b border-gray-700">{q.explanation}</p>

            <div className="mt-4 flex items-start gap-3 bg-gray-900/50 p-4 rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Educational Objective</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{q.educationalObjective}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handleExplainDeeper} disabled={isGeneratingAi}
                className="px-3 py-2 bg-indigo-900/50 hover:bg-indigo-800/80 rounded-lg text-indigo-300 transition flex items-center gap-1.5 border border-indigo-700/50 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingAi ? "Thinking…" : "AI Deep Dive"}
              </button>
              <button onClick={() => handleTranslate(q.explanation, `expl_${q.id || currentQ}`)} disabled={isTranslating}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-blue-400 transition flex items-center gap-1.5 border border-gray-700 text-xs font-semibold">
                <Languages className="w-3.5 h-3.5" />
                {isTranslating ? "…" : "ترجمة الشرح"}
              </button>
              <button onClick={() => setShowNotes(p => !p)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 transition flex items-center gap-1.5 border border-gray-700 text-xs font-semibold">
                📝 {showNotes ? "Hide Notes" : "Add Note"}
              </button>
            </div>

            {/* AI explanation */}
            {isGeneratingAi && (
              <div className="mt-4 p-4 bg-indigo-950/30 rounded-xl border border-indigo-800/50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-indigo-300 text-sm">Generating deep explanation…</span>
              </div>
            )}
            {aiExplanation && !isGeneratingAi && (
              <div className="mt-4 p-5 bg-indigo-950/30 rounded-xl border border-indigo-800/50 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-3 border-b border-indigo-800/50 pb-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-indigo-300 font-bold text-sm">AI Deep Dive</h4>
                </div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiExplanation}</div>
              </div>
            )}

            {/* Arabic translation of explanation */}
            {translations[`expl_${q.id || currentQ}`] && (
              <div className="mt-4 p-4 bg-gray-800/80 rounded-xl border-r-4 border-r-blue-500 border border-gray-700" dir="rtl">
                <p className="text-gray-300 text-sm leading-loose">{translations[`expl_${q.id || currentQ}`]}</p>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Personal Notes</label>
                <textarea
                  className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none text-sm"
                  placeholder="Notes saved automatically…"
                  value={personalNotes[q.id || `stem_${currentQ}`] || ""}
                  onChange={e => handleSaveNote(q.id || `stem_${currentQ}`, e.target.value)}
                />
              </div>
            )}
          </div>

          <button onClick={nextQuestion}
            className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-lg">
            {currentQ < questions.length - 1 ? "Next Question" : "Finish Block"} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
