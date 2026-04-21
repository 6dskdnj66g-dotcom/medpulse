// src/app/library/articles/[pmcId]/page.tsx
// Server component — full PMC open-access article reader

import { fetchPMCArticle } from "@/features/library/services/ncbi";
import { ArticleTools } from "./ArticleTools";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, Tag, BookOpen, AlertCircle } from "lucide-react";

export const revalidate = 86400; // ISR: refresh every 24 h

interface Props {
  params: Promise<{ pmcId: string }>;
}

export default async function ArticleReaderPage({ params }: Props) {
  const { pmcId } = await params;

  let article;
  try {
    article = await fetchPMCArticle(pmcId);
  } catch {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-16 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Article Unavailable</h1>
        <p className="text-gray-400 mb-6">
          This article could not be retrieved from PubMed Central. It may be restricted,
          not yet indexed, or the PMC ID is invalid.
        </p>
        <Link href="/library/search" className="text-blue-400 underline">← Back to search</Link>
      </div>
    );
  }

  const hasContent = article.sections.length > 0;

  return (
    <div className="grid grid-cols-12 min-h-screen bg-gray-950">

      {/* ── Left: Table of Contents ───────────────────────────────────────── */}
      <aside className="hidden lg:flex col-span-3 flex-col bg-gray-900/50 border-r border-gray-800 sticky top-0 h-screen overflow-y-auto p-6">
        <Link href="/library/search"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Library
        </Link>

        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            {article.journal || "PubMed Central"}
          </span>
          <h2 className="text-sm font-bold text-white mt-2 leading-snug line-clamp-6">
            {article.title}
          </h2>
        </div>

        {article.sections.length > 0 && (
          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Contents
            </p>
            {article.abstract && (
              <a href="#abstract"
                className="block py-1.5 px-3 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition">
                Abstract
              </a>
            )}
            {article.sections.map((sec, i) => sec.title && (
              <a key={i} href={`#sec-${i}`}
                className="block py-1.5 px-3 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition truncate">
                {sec.title}
              </a>
            ))}
          </nav>
        )}
      </aside>

      {/* ── Center: Article Content ───────────────────────────────────────── */}
      <main className="col-span-12 lg:col-span-7 p-6 md:p-10 xl:p-12 max-w-none overflow-y-auto">
        {/* Mobile back */}
        <Link href="/library/search"
          className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Library
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-1 bg-blue-900/40 text-blue-400 rounded-full text-xs font-bold border border-blue-800/50">
              PMC Open Access
            </span>
            <span className="px-2.5 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-bold border border-green-800/40">
              {article.pmcId}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-5">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            {article.authors.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {article.authors.slice(0, 4).join(", ")}
                {article.authors.length > 4 && ` +${article.authors.length - 4}`}
              </span>
            )}
            {article.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {article.year}
              </span>
            )}
            {article.journal && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {article.journal}
              </span>
            )}
          </div>

          {article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              <Tag className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
              {article.keywords.slice(0, 8).map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md text-xs border border-gray-700">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Abstract */}
        {article.abstract && (
          <section id="abstract" className="mb-10">
            <h2 className="text-lg font-bold text-blue-400 mb-3 pb-2 border-b border-gray-800">
              Abstract
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-gray-300 leading-relaxed text-sm">
              {article.abstract}
            </div>
          </section>
        )}

        {/* Body sections */}
        {hasContent ? (
          article.sections.map((sec, i) => (
            <section key={i} id={`sec-${i}`} className="mb-10">
              {sec.title && (
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">
                  {sec.title}
                </h2>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                {sec.content.split("\n\n").map((para, j) => (
                  <p key={j} className="text-gray-300 leading-relaxed mb-4 text-[15px]">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="bg-amber-900/10 border border-amber-800/30 rounded-xl p-6 text-center">
            <p className="text-amber-400 font-semibold mb-2">Full text not available</p>
            <p className="text-gray-400 text-sm mb-4">
              This article&apos;s full text could not be extracted. You can read it directly on PubMed Central.
            </p>
            <a
              href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcId}/`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
            >
              Read on PubMed Central →
            </a>
          </div>
        )}
      </main>

      {/* ── Right: Tools panel ───────────────────────────────────────────── */}
      <aside className="hidden lg:flex col-span-2 flex-col bg-gray-900/50 border-l border-gray-800 sticky top-0 h-screen p-4 overflow-y-auto">
        <ArticleTools
          pmcId={article.pmcId}
          title={article.title}
          abstract={article.abstract}
          ncbiUrl={`https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcId}/`}
        />
      </aside>
    </div>
  );
}
