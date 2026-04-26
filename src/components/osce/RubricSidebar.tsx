"use client";

import { useState } from "react";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Target, AlertCircle } from "lucide-react";
import type { OSCERubric, RubricItemProgress } from "@/lib/osce/types";

interface RubricSidebarProps {
  rubric: OSCERubric;
  progress: Record<string, RubricItemProgress>;
  scores: {
    dataGathering: { earned: number; max: number; percentage: number };
    clinicalManagement: { earned: number; max: number; percentage: number };
    interpersonalSkills: { earned: number; max: number; percentage: number };
    total: number;
  };
}

const DOMAIN_LABELS = {
  dataGathering: "Data Gathering",
  clinicalManagement: "Clinical Management",
  interpersonalSkills: "Interpersonal Skills",
};

const QUALITY_COLORS = {
  excellent: "text-emerald-500",
  good: "text-teal-500",
  adequate: "text-amber-500",
  poor: "text-rose-500",
};

interface DomainSectionProps {
  label: string;
  items: { id: string; criterion: string; weight: number; required: boolean }[];
  score: { earned: number; max: number; percentage: number };
  progress: Record<string, RubricItemProgress>;
  defaultOpen?: boolean;
}

function DomainSection({ label, items, score, progress, defaultOpen = false }: DomainSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = score.percentage;
  const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-3)] transition-colors"
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[11px] font-black text-[var(--text-primary)] truncate">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-3)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-black tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {score.earned.toFixed(1)}/{score.max}
            </span>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          {items.map(item => {
            const prog = progress[item.id];
            const triggered = prog?.triggered ?? false;
            const quality = prog?.quality;

            return (
              <div
                key={item.id}
                className={`flex items-start gap-2 p-2 rounded-lg transition-all ${
                  triggered ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-[var(--bg-3)]"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {triggered ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${item.required ? "text-rose-400" : "text-[var(--text-tertiary)]"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold leading-tight ${triggered ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--text-secondary)]"}`}>
                    {item.criterion}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{item.weight} pts</span>
                    {item.required && !triggered && (
                      <span className="text-[8px] font-black text-rose-500 flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />REQUIRED
                      </span>
                    )}
                    {quality && (
                      <span className={`text-[9px] font-black uppercase ${QUALITY_COLORS[quality] ?? ""}`}>
                        {quality}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RubricSidebar({ rubric, progress, scores }: RubricSidebarProps) {
  const totalMax = rubric.totalMaxScore;
  const totalEarned = scores.total;
  const passing = totalEarned >= rubric.passingScore;
  const overallPct = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Score summary */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[var(--color-medical-indigo)]" />
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Live Score</p>
        </div>

        {/* Score ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-3)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke={passing ? "#10b981" : overallPct >= 50 ? "#f59e0b" : "#ef4444"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(overallPct / 100) * 163} 163`}
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-[var(--text-primary)]">{Math.round(overallPct)}%</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-[var(--text-primary)]">{totalEarned.toFixed(1)}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium">/ {totalMax} points</p>
            <p className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${passing ? "text-emerald-500" : "text-rose-500"}`}>
              {passing ? "PASSING" : `need ${rubric.passingScore}`}
            </p>
          </div>
        </div>
      </div>

      {/* Domains */}
      <div className="flex-1 overflow-y-auto">
        <DomainSection
          label={DOMAIN_LABELS.dataGathering}
          items={rubric.domains.dataGathering}
          score={scores.dataGathering}
          progress={progress}
          defaultOpen={true}
        />
        <DomainSection
          label={DOMAIN_LABELS.clinicalManagement}
          items={rubric.domains.clinicalManagement}
          score={scores.clinicalManagement}
          progress={progress}
        />
        <DomainSection
          label={DOMAIN_LABELS.interpersonalSkills}
          items={rubric.domains.interpersonalSkills}
          score={scores.interpersonalSkills}
          progress={progress}
        />
      </div>
    </div>
  );
}
