"use client";

import { useState, useTransition } from "react";
import { processClinicalQuery } from "@/app/actions/medical-query";
import SourceBadge from "@/components/medical/SourceBadge";
import { ValidatedResponse } from "@/types/medical";

export default function ClinicalChat() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ValidatedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await processClinicalQuery(query);
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected system error occurred.");
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">MedPulse Clinical Query</h1>
        <p className="mt-1 text-sm text-slate-500">
          Evidence-based answers synthesized from MEDLINE-indexed literature. Not a diagnostic tool.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. First-line treatment for hypertension in CKD"
          disabled={isPending}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Searching…" : "Search Evidence"}
        </button>
      </form>

      {isPending && (
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Querying MEDLINE and synthesizing evidence…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span className="font-semibold">Error: </span>
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
              Clinical Summary
            </p>
            <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {result.content}
            </p>
          </div>

          {result.sources.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Evidence Sources ({result.sources.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.sources.map((source, i) => (
                  <SourceBadge key={source.id} source={source} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          <p className="border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            This output is generated from indexed abstracts and is not a substitute for clinical judgement.
          </p>
        </div>
      )}
    </div>
  );
}
