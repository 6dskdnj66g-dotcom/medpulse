/* eslint-disable @typescript-eslint/no-explicit-any */
﻿"use client";

import React, { useEffect, useRef } from 'react';
import { useSourceReader } from '@/contexts/SourceReaderContext';

export function SourceReaderDrawer() {
  const { activeSource, closeSource } = useSourceReader();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSource();
    };
    if (activeSource) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSource, closeSource]);

  // Trap focus basic implementation
  useEffect(() => {
    if (activeSource && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [activeSource]);

  if (!activeSource) return null;

  // Placeholder for missing props - you might need to adjust based on exact MedicalSource type variations
  const isOA = (activeSource as any).isOpenAccess === true;
  const quality = (activeSource as any).qualityScore || 0;
  const studyType = (activeSource as any).studyType || 'N/A';
  const category = (activeSource as any).category || 'research';

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={closeSource}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="fixed top-0 bottom-0 right-0 z-50 w-full md:w-[720px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform rtl:right-auto rtl:left-0 rtl:translate-x-0 outline-none"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full uppercase tracking-wide">
                {category} &bull; {studyType}
              </span>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-emerald-500 text-[10px] font-bold text-emerald-600 bg-emerald-50">
                {typeof quality === 'number' ? quality.toFixed(1) : quality}
              </span>
            </div>
            <h2 id="drawer-title" className="text-lg font-bold leading-tight text-gray-900 dark:text-white mt-2">
              {activeSource.title}
            </h2>
          </div>
          <button 
            onClick={closeSource}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
          <div className="truncate flex-1 min-w-[200px] flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">{activeSource.journal}</span>
            <span>&bull;</span>
            <span>{activeSource.publicationYear || (activeSource as any).year}</span>
            <span>&bull;</span>
            <span className="truncate">{activeSource.authors}</span>
          </div>
          <div className="flex items-center shrink-0 gap-3">
            {activeSource.doi && (
              <button 
                onClick={() => navigator.clipboard.writeText(activeSource.doi)} 
                className="text-xs hover:text-blue-600 transition-colors flex items-center gap-1 group"
                title="Copy DOI"
              >
                <span>DOI: {activeSource.doi}</span>
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            )}
            <a 
              href={activeSource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
            >
              Open Original
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Abstract / Summary</h3>
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: activeSource.summary }} />
          </section>

          {isOA && (activeSource as any).fullText && (
            <section className="h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 m-0">Full Text Viewer</h3>
              <iframe 
                srcDoc={(activeSource as any).fullText} 
                sandbox="allow-same-origin"
                className="w-full flex-1 bg-white"
                title="Full text content"
              />
            </section>
          )}

          {category === 'drug' && (
             <section className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-800 dark:text-yellow-600 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                  Drug Safety Info
                </h3>
                <p className="text-sm text-yellow-900 dark:text-yellow-500">
                  This source provides clinical drug information. Please verify dosage and indications against local formularies before clinical use.
                </p>
             </section>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3 rtl:flex-row-reverse">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 transition">
            Share Citation
          </button>
          <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-4 focus:outline-none focus:ring-blue-100 transition">
            Save to Notes
          </button>
        </div>
      </div>
    </>
  );
}
