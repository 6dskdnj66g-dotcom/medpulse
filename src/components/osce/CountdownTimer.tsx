"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  totalSeconds: number;
  onExpire: () => void;
  paused?: boolean;
}

export function CountdownTimer({ totalSeconds, onExpire, paused = false }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onExpire, paused]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (remaining / totalSeconds) * 100;
  const urgent = pct < 25;
  const warning = pct < 50;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-sm tabular-nums transition-all ${
      urgent
        ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse"
        : warning
        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
        : "bg-[var(--bg-2)] border-[var(--border-subtle)] text-[var(--text-primary)]"
    }`}>
      <Clock className="w-4 h-4 flex-shrink-0" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
