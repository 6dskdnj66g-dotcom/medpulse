// src/app/library/books/[bookId]/page.tsx
// Server component — NCBI Bookshelf internal reader

import { fetchBookContent, CURATED_BOOKS } from "@/lib/ncbi";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { BookTools } from "./BookTools";

export const revalidate = 86400;

interface Props {
  params: Promise<{ bookId: string }>;
}

export default async function BookReaderPage({ params }: Props) {
  const { bookId } = await params;
  const meta = CURATED_BOOKS.find(b => b.id === bookId);

  let book;
  try {
    book = await fetchBookContent(bookId);
  } catch {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-16 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Book Unavailable</h1>
        <p className="text-gray-400 mb-4">
          This book could not be retrieved from NCBI Bookshelf right now.
        </p>
        <a
          href={`https://www.ncbi.nlm.nih.gov/books/${bookId}/`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition mr-3"
        >
          Read on NCBI Bookshelf →
        </a>
        <Link href="/library" className="text-gray-400 hover:text-white text-sm underline">
          ← Library
        </Link>
      </div>
    );
  }

  const displayTitle    = book.title   || meta?.title    || bookId;
  const displaySubtitle = book.subtitle || meta?.subtitle || "";
  const hasSections     = book.sections.length > 0;

  return (
    <div className="grid grid-cols-12 min-h-screen bg-gray-950">

      {/* ── Left: ToC ────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex col-span-3 flex-col bg-gray-900/50 border-r border-gray-800 sticky top-0 h-screen overflow-y-auto p-6">
        <Link href="/library"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Library
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">NCBI Bookshelf</p>
            <h2 className="text-sm font-bold text-white leading-tight">{displayTitle}</h2>
          </div>
        </div>

        {hasSections && (
          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Contents</p>
            {book.abstract && (
              <a href="#overview" className="block py-1.5 px-3 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition">
                Overview
              </a>
            )}
            {book.sections.map((sec, i) => sec.title && (
              <a key={i} href={`#sec-${i}`}
                className="block py-1.5 px-3 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition truncate">
                {sec.title}
              </a>
            ))}
          </nav>
        )}

        {/* Quick nav to curated books */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Other Books</p>
          {CURATED_BOOKS.filter(b => b.id !== bookId).slice(0, 4).map(b => (
            <Link key={b.id} href={`/library/books/${b.id}`}
              className="flex items-center gap-2 py-2 text-xs text-gray-400 hover:text-white transition">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{b.title}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Center: Content ──────────────────────────────────────────────── */}
      <main className="col-span-12 lg:col-span-7 p-6 md:p-10 xl:p-12 overflow-y-auto">
        <Link href="/library"
          className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Library
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 bg-indigo-900/40 text-indigo-400 rounded-full text-xs font-bold border border-indigo-800/50">
              NCBI Bookshelf
            </span>
            <span className="px-2.5 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-bold border border-green-800/40">
              Free & Open Access
            </span>
            {meta?.specialty && (
              <span className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full text-xs font-bold border border-gray-700">
                {meta.specialty}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-gray-400 text-lg mb-4">{displaySubtitle}</p>
          )}

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            {book.authors.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {book.authors.slice(0, 3).join(", ")}
                {book.authors.length > 3 && ` +${book.authors.length - 3}`}
              </span>
            )}
            {book.year && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />{book.year}
              </span>
            )}
          </div>
        </header>

        {/* Overview / abstract */}
        {book.abstract && (
          <section id="overview" className="mb-10">
            <h2 className="text-lg font-bold text-indigo-400 mb-3 pb-2 border-b border-gray-800">
              Overview
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-gray-300 leading-relaxed text-sm">
              {book.abstract}
            </div>
          </section>
        )}

        {/* Sections */}
        {hasSections ? (
          book.sections.map((sec, i) => (
            <section key={i} id={`sec-${i}`} className="mb-10">
              {sec.title && (
                <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">
                  {sec.title}
                </h2>
              )}
              {sec.content.split("\n\n").map((para, j) => (
                <p key={j} className="text-gray-300 leading-relaxed mb-4 text-[15px]">
                  {para}
                </p>
              ))}
            </section>
          ))
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-2">
              Full text preview not available for this book
            </p>
            <p className="text-gray-500 text-sm mb-5">
              NCBI Bookshelf may require you to browse individual chapters.
              Click below to read it directly on NCBI.
            </p>
            <a
              href={`https://www.ncbi.nlm.nih.gov/books/${bookId}/`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition"
            >
              Open on NCBI Bookshelf →
            </a>
          </div>
        )}
      </main>

      {/* ── Right: Tools ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex col-span-2 flex-col bg-gray-900/50 border-l border-gray-800 sticky top-0 h-screen p-4 overflow-y-auto">
        <BookTools
          bookId={bookId}
          title={displayTitle}
          ncbiUrl={`https://www.ncbi.nlm.nih.gov/books/${bookId}/`}
        />
      </aside>
    </div>
  );
}
