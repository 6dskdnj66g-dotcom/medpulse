"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-1)] hover:bg-[var(--bg-2)] transition-all duration-300 shadow-sm active:scale-95"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: currentTheme === 'dark' ? 180 : 0,
          scale: currentTheme === 'dark' ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`absolute inset-0 flex items-center justify-center ${currentTheme === 'dark' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 text-amber-500`}
      >
        <Sun className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: currentTheme === 'dark' ? 0 : -180,
          scale: currentTheme === 'dark' ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`absolute inset-0 flex items-center justify-center ${currentTheme === 'dark' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 text-indigo-400`}
      >
        <Moon className="h-5 w-5" />
      </motion.div>
      <div className="w-5 h-5 opacity-0" /> {/* Spacer */}
    </button>
  );
}
