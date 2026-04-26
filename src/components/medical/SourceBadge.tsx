"use client";

import { MedicalSource } from "@/types/medical";

export default function SourceBadge({ source, index }: { source: MedicalSource; index: number }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2">
          <span className="text-blue-600 mr-1">[{index}]</span> {source.title}
        </h4>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
        <span>{source.journal}</span>
        <span>•</span>
        <span>{source.publicationYear}</span>
      </div>

      <p className="mt-2 text-xs text-slate-600 line-clamp-3 italic">
        &quot;{source.summary}&quot;
      </p>

      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
      >
        Verify Source →
      </a>
    </div>
  );
}
