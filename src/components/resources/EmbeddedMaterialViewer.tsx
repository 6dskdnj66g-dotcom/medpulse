"use client";

/**
 * Native in-app viewer for Iraqi KB materials.
 *
 * Renders in a full-screen modal with a title bar + close button. Uses:
 *   - <iframe> for PDF and generic links (browser's built-in PDF viewer;
 *     works for any URL that serves the file with the correct Content-Type
 *     and permissive X-Frame-Options / CSP — which Supabase Storage does).
 *   - <video> for material type "video" when the URL is a direct media file.
 *
 * We deliberately avoid react-pdf / pdfjs-dist: the browser already renders
 * PDFs natively, and pulling in a 500 kB worker for the same result is waste.
 *
 * Escape closes the modal, backdrop click closes, body scroll is locked
 * while open.
 */

import { useEffect } from "react";
import { X, ExternalLink, Download, FileText, Video as VideoIcon, LinkIcon } from "lucide-react";
import type { IraqiMaterial } from "@/lib/kb/iraqi-kb-client";

interface EmbeddedMaterialViewerProps {
  material: IraqiMaterial | null;
  isAr?: boolean;
  onClose: () => void;
}

function isProbablyEmbeddableVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function EmbeddedMaterialViewer({ material, isAr = false, onClose }: EmbeddedMaterialViewerProps) {
  useEffect(() => {
    if (!material) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [material, onClose]);

  if (!material) return null;

  const title = isAr && material.title_ar ? material.title_ar : material.title;
  const description = isAr && material.description_ar ? material.description_ar : material.description;

  const TypeIcon = material.type === "pdf" ? FileText : material.type === "video" ? VideoIcon : LinkIcon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Backdrop click handler wrapping only the outer margins */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Framed viewer */}
      <div className="relative m-2 md:m-6 flex-1 flex flex-col bg-[var(--bg-1)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] animate-in zoom-in-95 duration-200">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/80 backdrop-blur-md flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-sm font-extrabold text-[var(--text-primary)] truncate">{title}</p>
            {description && (
              <p className="text-[10px] md:text-[11px] text-[var(--text-tertiary)] font-medium truncate">{description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={isAr ? "فتح في تبويب جديد" : "Open in new tab"}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              {isAr ? "تبويب جديد" : "New tab"}
            </a>
            {material.type === "pdf" && (
              <a
                href={material.file_url}
                download
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={isAr ? "تنزيل" : "Download"}
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                {isAr ? "تنزيل" : "Download"}
              </a>
            )}
            <button
              onClick={onClose}
              aria-label={isAr ? "إغلاق" : "Close viewer"}
              className="w-9 h-9 rounded-xl bg-[var(--bg-2)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Viewer body */}
        <div className="flex-1 min-h-0 bg-[var(--bg-0)]">
          {material.type === "pdf" && (
            <iframe
              src={material.file_url}
              title={title}
              className="w-full h-full border-0"
              // Allow the browser's PDF viewer + basic navigation. No script access.
              sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
            />
          )}

          {material.type === "video" && isProbablyEmbeddableVideo(material.file_url) && (
            <video
              controls
              className="w-full h-full bg-black"
              src={material.file_url}
              aria-label={title}
            >
              {isAr ? "متصفحك لا يدعم تشغيل الفيديو." : "Your browser does not support inline video."}
            </video>
          )}

          {material.type === "video" && !isProbablyEmbeddableVideo(material.file_url) && (
            <iframe
              src={material.file_url}
              title={title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
            />
          )}

          {material.type === "link" && (
            <iframe
              src={material.file_url}
              title={title}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-popups allow-forms allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
