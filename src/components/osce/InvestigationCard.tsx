"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Microscope, Activity, FileImage, Beaker } from "lucide-react";
import type { Investigation, InvestigationResult } from "@/lib/osce/types";

interface InvestigationCardProps {
  investigation: Investigation;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  "blood-test": Beaker,
  "urinalysis": Beaker,
  "ecg": Activity,
  "imaging-xray": FileImage,
  "imaging-ct": FileImage,
  "imaging-mri": FileImage,
  "imaging-ultrasound": FileImage,
};

function LabResult({ result }: { result: InvestigationResult }) {
  return (
    <div className="space-y-1">
      {result.text && (
        <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium">{result.text}</p>
      )}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="text-left py-1 pr-3 font-black text-[var(--text-tertiary)] uppercase tracking-wider text-[9px]">Test</th>
            <th className="text-right py-1 pr-3 font-black text-[var(--text-tertiary)] uppercase tracking-wider text-[9px]">Result</th>
            <th className="text-right py-1 font-black text-[var(--text-tertiary)] uppercase tracking-wider text-[9px]">Reference</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(result.values).map(([name, lv]) => (
            <tr key={name} className="border-b border-[var(--border-subtle)]/50 last:border-0">
              <td className="py-1.5 pr-3 text-[var(--text-secondary)] font-medium">{name}</td>
              <td className={`py-1.5 pr-3 text-right font-black tabular-nums ${
                lv.flag === "H" ? "text-rose-500" :
                lv.flag === "L" ? "text-blue-500" :
                lv.flag === "C" ? "text-amber-500" :
                "text-[var(--text-primary)]"
              }`}>
                {lv.value} {lv.unit} {lv.flag && <span className="text-[9px] ml-0.5">{lv.flag}</span>}
              </td>
              <td className="py-1.5 text-right text-[var(--text-tertiary)] font-medium">{lv.range ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvestigationCard({ investigation }: InvestigationCardProps) {
  const [showInterpretation, setShowInterpretation] = useState(false);
  const Icon = TYPE_ICONS[investigation.type] ?? Microscope;

  const urgencyColors = {
    stat: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    urgent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    routine: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--bg-2)", borderColor: "var(--border-default)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-medical-indigo)]/10 flex items-center justify-center border border-[var(--color-medical-indigo)]/20">
            <Icon className="w-3.5 h-3.5 text-[var(--color-medical-indigo)]" />
          </div>
          <div>
            <p className="text-[11px] font-black text-[var(--text-primary)]">{investigation.name}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{investigation.type}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-full border uppercase tracking-wider ${urgencyColors[investigation.urgency]}`}>
          {investigation.urgency}
        </span>
      </div>

      {/* Result */}
      <div className="p-4">
        {typeof investigation.result === "string" ? (
          <>
            {investigation.imageUrl && (
              <div className="mb-3 rounded-xl overflow-hidden bg-black/10 border border-[var(--border-subtle)] flex items-center justify-center h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={investigation.imageUrl}
                  alt={investigation.name}
                  className="max-h-full max-w-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">{investigation.result}</p>
          </>
        ) : (
          <LabResult result={investigation.result} />
        )}
      </div>

      {/* Interpretation toggle */}
      <button
        onClick={() => setShowInterpretation(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2 border-t text-[11px] font-black uppercase tracking-wider transition-colors hover:bg-[var(--bg-3)]"
        style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
      >
        <span>Interpretation</span>
        {showInterpretation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showInterpretation && (
        <div className="px-4 pb-4 pt-2 bg-[var(--color-medical-indigo)]/5 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-xs font-medium text-[var(--color-medical-indigo)] leading-relaxed">
            {investigation.interpretation}
          </p>
        </div>
      )}
    </div>
  );
}
