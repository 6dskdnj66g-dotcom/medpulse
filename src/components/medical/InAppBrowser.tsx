"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ExternalLink, ShieldAlert, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useLanguage } from "@/core/i18n/LanguageContext";

interface InAppBrowserProps {
  url: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InAppBrowser({ url, title, isOpen, onClose }: InAppBrowserProps) {
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [currentUrl, setCurrentUrl] = useState(url);
  if (url !== currentUrl) {
    setCurrentUrl(url);
    setIsLoading(true);
  }

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      dir={dir}
    >
      <div 
        className={`bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? "w-full h-full rounded-none" : "w-[95vw] md:w-[85vw] max-w-6xl h-[90vh] rounded-3xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden flex-1 mr-4 rtl:mr-0 rtl:ml-4">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 shrink-0">
              <ExternalLink className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="truncate flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {title || (isAr ? "المصدر الطبي" : "Medical Source")}
              </h3>
              <p className="text-[10px] text-slate-500 truncate text-left" dir="ltr">{url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm shadow-indigo-500/20"
              title={isAr ? "فتح في علامة تبويب جديدة إذا لم يظهر الموقع" : "Open in new tab if site fails to load"}
            >
              <span className="hidden sm:inline">{isAr ? "فتح في المتصفح" : "Open in Browser"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 flex items-center gap-2 border-b border-amber-200 dark:border-amber-900/50">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
          <p className="text-[11px] font-medium text-amber-800 dark:text-amber-400">
            {isAr 
              ? "بعض المصادر قد تمنع العرض داخل التطبيق لأسباب أمنية. إذا ظهرت الشاشة فارغة، يرجى استخدام زر 'فتح في المتصفح'."
              : "Some sources prevent in-app viewing for security reasons. If the screen is blank, please use 'Open in Browser'."}
          </p>
        </div>

        {/* Iframe Content */}
        <div className="relative flex-1 bg-slate-50 dark:bg-slate-900">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-sm text-slate-500 font-medium">
                {isAr ? "جاري تحميل المصدر..." : "Loading source..."}
              </p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={url}
            className="w-full h-full border-none"
            title={title || "Medical Source"}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
