"use client";

/**
 * Launcher + responsive host for IraqiMedicalSidebar.
 *
 * Renders a small "Resources" trigger button. On desktop (>= lg) it opens a
 * right-side slide-in panel. On mobile it opens a bottom-sheet drawer. Both
 * share the same IraqiMedicalSidebar content, so we don't duplicate markup.
 */

import { useEffect, useState } from "react";
import { BookMarked, X } from "lucide-react";
import { IraqiMedicalSidebar } from "./IraqiMedicalSidebar";

interface IraqiResourcesLauncherProps {
  stationId?: string;
  isAr?: boolean;
  /** Optional class applied to the trigger button so callers can theme it. */
  triggerClassName?: string;
  /** Optional label override for the trigger. */
  triggerLabel?: string;
}

export function IraqiResourcesLauncher({
  stationId,
  isAr = false,
  triggerClassName,
  triggerLabel,
}: IraqiResourcesLauncherProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const defaultLabel = isAr ? "المراجع" : "Resources";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={isAr ? "فتح مراجع الطلبة العراقيين" : "Open Iraqi medical resources"}
        className={
          triggerClassName ??
          "flex items-center gap-1.5 text-[10px] font-black text-[var(--color-medical-indigo)] hover:opacity-80 uppercase tracking-widest transition-opacity"
        }
      >
        <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
        {triggerLabel ?? defaultLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? "مراجع الطلبة العراقيين" : "Iraqi medical resources"}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Mobile: bottom sheet */}
          <div
            className="lg:hidden absolute inset-x-0 bottom-0 max-h-[88dvh] bg-[var(--bg-1)] border-t border-[var(--border-subtle)] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                  {isAr ? "المراجع الطبية العراقية" : "Iraqi Medical Resources"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={isAr ? "إغلاق" : "Close"}
                className="w-9 h-9 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <IraqiMedicalSidebar stationId={stationId} isAr={isAr} />
            </div>
          </div>

          {/* Desktop: right slide-in panel */}
          <div className="hidden lg:flex absolute inset-y-0 right-0 w-[420px] max-w-[92vw] bg-[var(--bg-1)] border-l border-[var(--border-subtle)] shadow-2xl flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
                <p className="text-[12px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                  {isAr ? "المراجع الطبية العراقية" : "Iraqi Medical Resources"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={isAr ? "إغلاق" : "Close"}
                className="w-9 h-9 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <IraqiMedicalSidebar stationId={stationId} isAr={isAr} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
