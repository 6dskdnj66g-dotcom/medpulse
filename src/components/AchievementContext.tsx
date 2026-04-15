"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AchievementContextType {
  xp: number;
  addXp: (amount: number, reason: string) => void;
  recentAchievement: { amount: number; reason: string } | null;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState(0);
  const [recentAchievement, setRecentAchievement] = useState<{ amount: number; reason: string } | null>(null);

  useEffect(() => {
    const storedXp = localStorage.getItem("medpulse_xp");
    if (storedXp) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setXp(parseInt(storedXp, 10));
    }
  }, []);

  const addXp = (amount: number, reason: string) => {
    setXp((prev) => {
      const newXp = prev + amount;
      localStorage.setItem("medpulse_xp", newXp.toString());
      return newXp;
    });

    setRecentAchievement({ amount, reason });
    // Clear recent achievement after animation
    setTimeout(() => {
      setRecentAchievement(null);
    }, 4000);
  };

  return (
    <AchievementContext.Provider value={{ xp, addXp, recentAchievement }}>
      {children}
      {/* Toast Notification for XP */}
      {recentAchievement && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 shadow-2xl shadow-amber-500/20 rounded-2xl p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center animate-clinical-pulse">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{recentAchievement.reason}</p>
              <p className="text-amber-600 dark:text-amber-400 font-extrabold text-lg">+{recentAchievement.amount} XP</p>
            </div>
          </div>
        </div>
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error("useAchievement must be used within an AchievementProvider");
  }
  return context;
}
