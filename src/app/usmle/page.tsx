"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Clock, CheckCircle, X, ChevronRight, RotateCcw, Award, BookOpen, Brain, Play, BarChart3, Settings, Languages, Highlighter, Edit3, BookmarkPlus } from "lucide-react";
import { useAchievement } from "@/components/AchievementContext";

type Question = {
  id: string;
  step: string;
  specialty: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  reference: string;
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
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Highlighter, Notes, Flashcards state
  const [highlightMode, setHighlightMode] = useState(false);
  const stemRef = useRef<HTMLParagraphElement>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({});
  const [savedFlashcards, setSavedFlashcards] = useState<string[]>([]);

  useEffect(() => {
    const savedN = localStorage.getItem("usmle_notes");
    if (savedN) setPersonalNotes(JSON.parse(savedN));
    const savedF = localStorage.getItem("usmle_flashcards");
    if (savedF) setSavedFlashcards(JSON.parse(savedF));
  }, []);

  const handleSaveNote = (id: string, text: string) => {
    const newNotes = { ...personalNotes, [id]: text };
    setPersonalNotes(newNotes);
    localStorage.setItem("usmle_notes", JSON.stringify(newNotes));
  };

  const handleSaveFlashcard = (q: Question) => {
    const targetId = q.id || `stem_${currentQ}`;
    if (savedFlashcards.includes(targetId)) return;
    const newCards = [...savedFlashcards, targetId];
    setSavedFlashcards(newCards);
    localStorage.setItem("usmle_flashcards", JSON.stringify(newCards));
    alert("Saved to Flashcards!");
  };

  const applyHighlight = () => {
    if (!highlightMode) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().length < 2) return;
    
    // Simplistic visual highlight, works temporarily before component rerenders
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = "rgba(250, 204, 21, 0.4)"; // yellow-400 low opacity
    span.style.color = "#fef08a"; // yellow-200
    span.style.borderRadius = "2px";
    span.style.padding = "0 2px";
    try {
      range.surroundContents(span);
    } catch(_e) {} // Ignore cross-element highlight errors for simplicity
    selection.removeAllRanges();
  };

  // Translation state
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalAttempted: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    specialties: {} as Record<string, { attempted: number; correct: number }>
  });

  const updateStats = useCallback((isCorrect: boolean, specialty?: string) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      if (!newStats.specialties) newStats.specialties = {};
      
      newStats.totalAttempted += 1;
      
      // Update specialty stats
      if (specialty) {
        if (!newStats.specialties[specialty]) {
          newStats.specialties[specialty] = { attempted: 0, correct: 0 };
        }
        newStats.specialties[specialty].attempted += 1;
        if (isCorrect) {
          newStats.specialties[specialty].correct += 1;
        }
      }

      if (isCorrect) {
        newStats.correct += 1;
        newStats.streak += 1;
        if (newStats.streak > newStats.bestStreak) {
          newStats.bestStreak = newStats.streak;
        }
      } else {
        newStats.streak = 0;
      }
      localStorage.setItem("usmle_stats", JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem("usmle_stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (_e) {}
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "quiz" && isTimed && timeLeft > 0 && !showAnswer) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (mode === "quiz" && isTimed && timeLeft === 0 && !showAnswer) {
      // Auto-submit if time runs out
      setShowAnswer(true);
      const isCorrect = false; // timed out, assume wrong or handle differently
      updateStats(isCorrect, questions[currentQ]?.specialty);
    }
    return () => clearTimeout(timer);
  }, [mode, isTimed, timeLeft, showAnswer, currentQ, questions, updateStats]);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const qs = new URLSearchParams({
        step: stepPref,
        specialty: specialtyPref,
        difficulty: difficultyPref,
        limit: questionCountPref.toString()
      });
      const res = await fetch(`/api/usmle/questions?${qs.toString()}`);
      const data = await res.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQ(0);
        setSelectedOption(null);
        setShowAnswer(false);
        setScore(0);
        if (isTimed) setTimeLeft(data.questions.length * 60); // 1 minute per question
        setMode("quiz");
      } else {
        alert("No questions found matching criteria.");
      }
    } catch (_e) {
      alert("Error loading questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (text: string, id: string) => {
    if (translations[id]) return; // already translated
    
    // Check cache
    const cacheKey = `usmle_trans_${id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslations(prev => ({ ...prev, [id]: cached }));
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/mdt/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [{ 
            role: "user", 
            content: `Translate the following medical text to Arabic accurately, maintaining medical terminology where appropriate: \n\n${text}` 
          }] 
        })
      });
      const data = await res.json();
      if (data.reply) {
        setTranslations(prev => ({ ...prev, [id]: data.reply }));
        localStorage.setItem(cacheKey, data.reply);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCheckAnswer = (forcedOption: number | null = selectedOption) => {
    if (forcedOption === null && !isTimed) return;
    
    setShowAnswer(true);
    const q = questions[currentQ];
    const isCorrect = forcedOption === q.answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
      addXp(20, "USMLE Question Correct");
    }
    
    updateStats(isCorrect, q.specialty);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      setMode("results");
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (mode === "select") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between mt-10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">USMLE Question Bank</h1>
            <p className="text-gray-400">Master Step 1 and Step 2 CK with over 3000+ realistic board-style questions.</p>
          </div>
          <button onClick={() => setMode("analytics")} className="p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="hidden sm:inline font-medium text-white">Dashboard</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-400" /> 
              Exam Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Exam Step</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "step1", "step2ck"] as StepPref[]).map(step => (
                    <button key={step} onClick={() => setStepPref(step)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${stepPref === step ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      {step === "all" ? "Mixed" : step === "step1" ? "Step 1" : "Step 2 CK"}
                    </button>
                  ))}
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject / System (UWorld Style)</label>
                <div className="relative">
                  <select 
                    value={specialtyPref} 
                    onChange={(e) => setSpecialtyPref(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer border border-gray-600 font-medium"
                  >
                    <option value="all">All Systems (Mixed Block)</option>
                    <option value="Cardiovascular">Cardiology / Cardiovascular</option>
                    <option value="Pulmonology">Pulmonology / Respiratory</option>
                    <option value="Gastroenterology">Gastroenterology / GI</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Hematology">Hematology / Oncology</option>
                    <option value="Nephrology">Nephrology / Renal</option>
                    <option value="Infectious Disease">Infectious Disease</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Rheumatology">Rheumatology / Musculoskeletal</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Reproductive">Reproductive / ObGyn</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Pharmacology">General Pharmacology</option>
                    <option value="Microbiology">General Microbiology</option>
                    <option value="Biochemistry">Biochemistry & Genetics</option>
                    <option value="Pathology">General Pathology</option>
                    <option value="Behavioral Science">Behavioral Science / Ethics</option>
                    <option value="Public Health">Public Health / Epidemiology</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["all", "Easy", "Medium", "Hard"] as DifficultyPref[]).map(diff => (
                    <button key={diff} onClick={() => setDifficultyPref(diff)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${difficultyPref === diff ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                      {diff === "all" ? "All" : diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Number of Questions</label>
                <input type="range" min="5" max="40" step="5" value={questionCountPref} onChange={(e) => setQuestionCountPref(parseInt(e.target.value))} className="w-full accent-blue-500" />
                <div className="text-right text-sm text-gray-400 mt-1">{questionCountPref} questions</div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={isTutor} onChange={(e) => setIsTutor(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700" />
                  <span className="text-white font-medium text-sm">Tutor Mode (Show answers immediately)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isTimed} onChange={(e) => setIsTimed(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700" />
                  <span className="text-white font-medium text-sm">Timed Mode (60s per block)</span>
                </label>
              </div>

              <button onClick={startQuiz} disabled={isLoading}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
                {isLoading ? "Loading..." : <><Play className="w-5 h-5 fill-current" /> Start Block</>}
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-full bg-blue-900/40 flex items-center justify-center mb-4">
               <Brain className="w-12 h-12 text-blue-400" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">Your Progress</h3>
             <div className="grid grid-cols-2 gap-4 w-full mt-4">
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
                 <div className="text-gray-400 text-sm mb-1">Current Streak</div>
                 <div className="text-3xl font-bold text-amber-500 flex items-center justify-center gap-1">
                   {stats.streak} <Award className="w-5 h-5 cursor-pointer" />
                 </div>
               </div>
               <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                 <div className="text-gray-400 text-sm mb-1">Best Streak</div>
                 <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-1">
                   {stats.bestStreak} <Trophy className="w-5 h-5 cursor-pointer" />
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "analytics") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 mt-10 space-y-6">
        <button onClick={() => setMode("select")} className="text-gray-400 hover:text-white flex items-center gap-2 mb-6">
          <RotateCcw className="w-4 h-4 cursor-pointer" /> Back to Setup
        </button>
        <h1 className="text-3xl font-bold text-white mb-6">Performance Dashboard</h1>
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="text-blue-400 w-5 h-5"/> Performance by Specialty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {!stats.specialties || Object.keys(stats.specialties).length === 0 ? (
              <p className="text-gray-400 italic col-span-full">No specialty data yet. Take some quizzes to track your weak areas!</p>
            ) : (
              Object.entries(stats.specialties).map(([spec, sStats]) => {
                if (sStats.attempted === 0) return null;
                const acc = Math.round((sStats.correct / sStats.attempted) * 100);
                return (
                  <div key={spec} className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex flex-col gap-2 transition hover:bg-gray-700">
                    <div className="text-gray-300 font-bold whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-wider text-xs" title={spec}>{spec}</div>
                    <div className="flex justify-between items-end">
                      <div className="text-2xl font-bold text-white">{acc}%</div>
                      <div className="text-sm text-gray-400 font-medium">{sStats.correct} / {sStats.attempted}</div>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${acc < 50 ? 'bg-red-500' : acc < 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${acc}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Trophy className="text-yellow-400 w-5 h-5"/> Global Accuracy</h2>
          <p className="text-gray-300">Detailed analytics are saved locally. Keep studying to see weak topics!</p>
          <div className="mt-4 flex gap-4">
            <div className="flex flex-col"><span className="text-sm text-gray-500">Global Accuracy</span><span className="text-2xl font-bold text-white">{stats.totalAttempted > 0 ? Math.round((stats.correct / stats.totalAttempted) * 100) : 0}%</span></div>
            <div className="flex flex-col"><span className="text-sm text-gray-500">Questions Done</span><span className="text-2xl font-bold text-white">{stats.totalAttempted}</span></div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0 || mode === "results") {
    if (mode === "results") {
        return (
          <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-3xl max-w-lg w-full border border-gray-700 shadow-2xl text-center">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">Block Complete!</h2>
              <p className="text-gray-400 mb-8">You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)</p>
              
              <button 
                onClick={() => setMode("select")}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )
    }
    return <div>Loading...</div>;
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 font-medium">Question {currentQ + 1} of {questions.length}</span>
          <span className="hidden sm:inline px-2 py-1 bg-blue-900/50 text-blue-400 rounded-md text-xs font-bold border border-blue-800/50 uppercase tracking-wider">{q.specialty}</span>
          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
            q.difficulty === "Easy" ? "bg-green-900/50 text-green-400 border border-green-800/50" : 
            q.difficulty === "Medium" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-800/50" : 
            "bg-red-900/50 text-red-400 border border-red-800/50"
          }`}>{q.difficulty}</span>
        </div>
        
        {isTimed && (
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-3 py-1.5 rounded-lg ${
            timeLeft < 60 ? "bg-red-900/30 text-red-400 animate-pulse" : "bg-gray-900 text-gray-300"
          }`}>
            <Clock className="w-5 h-5 cursor-pointer" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
        <div className="flex justify-between flex-col md:flex-row items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/50">
              <button 
                onClick={() => setHighlightMode(!highlightMode)}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${highlightMode ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50" : "bg-gray-700 text-gray-400 hover:text-gray-200"}`}
                title="Toggle text highlighting"
              >
                <Highlighter className="w-4 h-4" /> 
                {highlightMode ? "Highlighter ON" : "Highlighter OFF"}
              </button>
            </div>
            <p 
              ref={stemRef}
              onMouseUp={applyHighlight}
              className={`text-lg text-white leading-relaxed ${highlightMode ? "cursor-text selection:bg-yellow-500/30 selection:text-yellow-200" : ""}`}
            >
              {q.stem}
            </p>
          </div>
          <div className="flex justify-end w-full md:w-auto mt-4 md:mt-0">
             <button 
               onClick={() => handleTranslate(q.stem, q.id || `stem_${currentQ}`)}
               disabled={isTranslating}
               className="md:ml-4 p-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-blue-400 shrink-0 transition flex items-center justify-center gap-2"
               title="Translate to Arabic"
             >
               <Languages className="w-5 h-5 cursor-pointer" />
               <span className="text-sm font-semibold">{isTranslating ? "Translating..." : "عربي"}</span>
             </button>
          </div>
        </div>

        {translations[q.id || `stem_${currentQ}`] && (
          <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600 border-l-4 border-l-blue-500" dir="rtl">
            <p className="text-gray-300 font-arabic text-lg leading-loose">{translations[q.id || `stem_${currentQ}`]}</p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.answer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border transition flex items-center gap-3 ";
            
            if (!showAnswer) {
              btnClass += isSelected 
                ? "border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                : "border-gray-700 bg-gray-800/80 hover:bg-gray-700 hover:border-gray-500 text-gray-300";
            } else {
              if (isCorrect) {
                btnClass += "border-green-500 bg-green-900/20 text-white";
              } else if (isSelected && !isCorrect) {
                btnClass += "border-red-500 bg-red-900/20 text-white";
              } else {
                btnClass += "border-gray-700 bg-gray-800/50 text-gray-500 opacity-60";
              }
            }

            return (
              <div key={idx} className="flex flex-col gap-2">
                  <button 
                    onClick={() => !showAnswer && setSelectedOption(idx)}
                    disabled={showAnswer}
                    className={btnClass}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded flex items-center justify-center border text-xs font-bold
                      ${showAnswer && isCorrect ? "bg-green-500 border-green-500 text-white" : 
                        showAnswer && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" : 
                        isSelected ? "bg-blue-500 border-blue-500 text-white" : 
                        "border-gray-600 text-gray-400"}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 cursor-pointer" />}
                    {showAnswer && isSelected && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0 cursor-pointer" />}
                  </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Area */}
      {!showAnswer ? (
        <button 
          onClick={() => handleCheckAnswer()}
          disabled={selectedOption === null}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
        >
          {isTutor ? "Check Answer" : "Submit Question"}
        </button>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom flex flex-col h-full">
          {/* Explanation */}
          <div className={`p-6 rounded-2xl border ${selectedOption === q.answer ? "bg-green-900/10 border-green-800/30" : "bg-red-900/10 border-red-800/30"}`}>
            <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${selectedOption === q.answer ? "text-green-400" : "text-red-400"}`}>
              {selectedOption === q.answer ? <><CheckCircle className="w-6 h-6 cursor-pointer"/> Correct!</> : <><X className="w-6 h-6 cursor-pointer"/> Incorrect</>}
            </h3>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg pb-4 border-b border-gray-700">{q.explanation}</p>
              
              <div className="mt-4 flex items-start gap-3 bg-gray-900/50 p-4 rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-400 mt-1 shrink-0 cursor-pointer" />
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Key Concept</h4>
                  <p className="text-gray-300 text-base">{q.reference}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
                 <button 
                   onClick={() => handleTranslate(q.explanation, `expl_${q.id || currentQ}`)}
                   disabled={isTranslating}
                   className="p-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-blue-400 shrink-0 transition flex items-center justify-center gap-2 border border-gray-700"
                   title="Translate Explanation to Arabic"
                 >
                   <Languages className="w-4 h-4 cursor-pointer" />
                   <span className="text-xs font-semibold">{isTranslating ? "Translating..." : "ترجمة الشرح"}</span>
                 </button>
            </div>
            {translations[`expl_${q.id || currentQ}`] && (
              <div className="mt-4 p-4 bg-gray-800/80 rounded-xl border border-gray-700 border-r-4 border-r-blue-500" dir="rtl">
                <p className="text-gray-300 font-arabic text-md leading-loose">{translations[`expl_${q.id || currentQ}`]}</p>
              </div>
            )}
            
          </div>
          
          {showNotes && (
              <div className="mt-4 p-4 mb-4 bg-gray-800 rounded-xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Personal Notes for this topic</label>
                <textarea 
                  className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Type your notes here... (Saved automatically)"
                  value={personalNotes[q.id || `stem_${currentQ}`] || ""}
                  onChange={(e) => handleSaveNote(q.id || `stem_${currentQ}`, e.target.value)}
                />
              </div>
            )}
          {showNotes && (
              <div className="mt-4 p-4 mb-4 bg-gray-800 rounded-xl border border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Personal Notes for this topic</label>
                <textarea 
                  className="w-full h-24 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Type your notes here... (Saved automatically)"
                  value={personalNotes[q.id || `stem_${currentQ}`] || ""}
                  onChange={(e) => handleSaveNote(q.id || `stem_${currentQ}`, e.target.value)}
                />
              </div>
            )}
          <button 
            onClick={nextQuestion}
            className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-lg"
          >
            {currentQ < questions.length - 1 ? "Next Question" : "Finish Block"} <ChevronRight className="w-5 h-5 cursor-pointer" />
          </button>
        </div>
      )}
    </div>
  );
}