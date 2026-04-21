"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface Flashcard {
  q: string;
  a: string;
}

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150); // wait for flip animation duration if needed, or just switch immediately since it skips
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-indigo-100 rounded-2xl shadow-lg flex flex-col p-6 items-center justify-center text-center">
            <span className="absolute top-4 right-5 text-xs font-bold text-indigo-300 uppercase tracking-widest">Question</span>
            <p className="text-xl font-bold text-slate-800 leading-relaxed">
              {currentCard.q}
            </p>
            <div className="absolute bottom-4 flex items-center text-indigo-400 text-xs font-semibold group-hover:text-indigo-600 transition-colors">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Click to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl shadow-lg flex flex-col p-6 items-center justify-center text-center border-2 border-indigo-400">
            <span className="absolute top-4 right-5 text-xs font-bold text-indigo-100 uppercase tracking-widest">Answer</span>
            <p className="text-xl font-bold text-white leading-relaxed">
              {currentCard.a}
            </p>
          </div>

        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-slate-400">
          {currentIndex + 1} / {cards.length}
        </span>
        <button 
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
