"use client";

import { MedicalSource } from "@/types/medical";
import { useSourceReader } from "@/contexts/SourceReaderContext";

export default function SourceBadge({ source, index }: { source: MedicalSource; index: number }) {
  const { openSource } = useSourceReader();

  return (
    <div 
      onClick={() => openSource(source)}
      className="p-4 rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md hover:border-blue-300 cursor-pointer group dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSource(source);
        }
      }}
      aria-label={`View details for source: ${source.title}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-slate-800 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <span className="text-blue-600 dark:text-blue-400 mr-1">[{index}]</span> {source.title}
        </h4>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-gray-400">
        <span>{source.journal}</span>
        <span>&bull;</span>
        <span>{source.publicationYear}</span>
      </div>

      <p className="mt-2 text-xs text-slate-600 dark:text-gray-300 line-clamp-3 italic opacity-80">
        &quot;{source.summary}&quot;
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
          Read Summary & Details &rarr;
        </span>
        {source.evidenceLevel && (
             <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 rounded text-[10px] font-bold">
               {source.evidenceLevel}
             </span>
        )}
      </div>
    </div>
  );
}
