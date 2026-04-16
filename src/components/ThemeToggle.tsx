"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <button
        onClick={() => setTheme('light')}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          theme === 'light'
            ? "bg-white text-amber-500 shadow-sm"
            : "text-slate-400 hover:text-amber-500"
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          theme === 'dark'
            ? "bg-slate-700 text-indigo-400 shadow-sm"
            : "text-slate-500 hover:text-indigo-400"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
