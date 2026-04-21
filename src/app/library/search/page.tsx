"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, BookOpen, FileText, Loader2, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";

interface Summary {
  title:   string;
  authors: string[];
  year:    string;
  journal: string;
  abstract: string;
}

interface SearchResults {
  ids:       string[];
  total:     number;
  summaries: Record<string, Summary>;
}

type Tab = "pmc" | "books";

let debounceTimer: ReturnType<typeof setTimeout>;

export default function LibrarySearchPage() {
  const [query,      setQuery]      = useState("");
  const [activeTab,  setActiveTab]  = useState<Tab>("pmc");
  const [pmcResults, setPmcResults] = useState<SearchResults | null>(null);
  const [bookResults,setBookResults]= useState<SearchResults | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) return;
    setLoading(true);
    setError(null);

    try {
      const [pmcRes, bookRes] = await Promise.all([
        fetch(`/api/library/ncbi?action=search&db=pmc&q=${encodeURIComponent(q)}&retmax=15`).then(r => r.json()),
        fetch(`/api/library/ncbi?action=search&db=books&q=${encodeURIComponent(q)}&retmax=10`).then(r => r.json()),
      ]);
      if (pmcRes.error) throw new Error(pmcRes.error);
      setPmcResults(pmcRes);
      setBookResults(bookRes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceTimer);
    if (val.trim().length >= 3) {
      debounceTimer = setTimeout(() => doSearch(val), 600);
    }
  };

  const hasResults = pmcResults || bookResults;
  const pmcCount   = pmcResults?.ids.length ?? 0;
  const bookCount  = bookResults?.ids.length ?? 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 mt-8">
      <div className="mb-8">
        <Link href="/library" className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 mb-4 transition w-fit">
          ← Medical Library
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Search Medical Literature</h1>
        <p className="text-gray-400 text-sm">Search PubMed Central open-access articles and NCBI Bookshelf books</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch(query)}
          placeholder="e.g. myocardial infarction, sepsis management, COPD guidelines…"
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-800/40 rounded-xl p-4 mb-6 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error === "Too many requests" ? "Rate limit reached — please wait a moment." : error}
        </div>
      )}

      {/* Tabs */}
      {hasResults && !loading && (
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
          {([
            { id: "pmc" as Tab,   label: "Articles",  icon: FileText, count: pmcCount  },
            { id: "books" as Tab, label: "Books",     icon: BookOpen, count: bookCount },
          ] as const).map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? "bg-blue-500" : "bg-gray-700 text-gray-400"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results: PMC Articles */}
      {activeTab === "pmc" && pmcResults && !loading && (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            {pmcResults.total.toLocaleString()} open-access articles found
          </p>
          {pmcResults.ids.map(id => {
            const s = pmcResults.summaries[id];
            if (!s) return null;
            return (
              <div key={id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-blue-700/40 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs text-blue-400 font-semibold">{s.journal}</span>
                      {s.year && <span className="text-xs text-gray-500">{s.year}</span>}
                      <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full border border-green-800/40">PMC{id}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-snug mb-2">{s.title}</h3>
                    {s.authors.length > 0 && (
                      <p className="text-gray-500 text-xs mb-2">{s.authors.slice(0, 3).join(", ")}{s.authors.length > 3 ? " et al." : ""}</p>
                    )}
                    {s.abstract && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{s.abstract}</p>
                    )}
                  </div>
                  <Link href={`/library/articles/PMC${id}`}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition whitespace-nowrap">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
          {pmcResults.total > pmcResults.ids.length && (
            <p className="text-center text-gray-500 text-sm py-4">
              Showing {pmcResults.ids.length} of {pmcResults.total.toLocaleString()} results
            </p>
          )}
        </div>
      )}

      {/* Results: Books */}
      {activeTab === "books" && bookResults && !loading && (
        <div className="space-y-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
            {bookResults.total.toLocaleString()} books found on NCBI Bookshelf
          </p>
          {bookResults.ids.map(id => {
            const s = bookResults.summaries[id];
            if (!s) return null;
            return (
              <div key={id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-indigo-700/40 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-indigo-900/40 text-indigo-400 rounded-full border border-indigo-800/50">{id}</span>
                      {s.year && <span className="text-xs text-gray-500">{s.year}</span>}
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-snug mb-2">{s.title}</h3>
                    {s.authors.length > 0 && (
                      <p className="text-gray-500 text-xs">{s.authors.slice(0, 3).join(", ")}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/library/books/${id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition">
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a href={`https://www.ncbi.nlm.nih.gov/books/${id}/`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-xs font-semibold transition">
                      NCBI <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !loading && query.length >= 3 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No results for &quot;{query}&quot;</p>
        </div>
      )}

      {!hasResults && !loading && query.length < 3 && (
        <div className="text-center py-16">
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">PubMed Central</p>
              <p className="text-gray-500 text-xs">Millions of open-access articles</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">NCBI Bookshelf</p>
              <p className="text-gray-500 text-xs">9,000+ free medical books</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">Type at least 3 characters to search</p>
        </div>
      )}
    </div>
  );
}
