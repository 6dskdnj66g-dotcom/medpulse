"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Sparkles, Copy, Check, FileText } from "lucide-react";

interface Props {
  pmcId:    string;
  title:    string;
  abstract: string;
  ncbiUrl:  string;
}

export function ArticleTools({ pmcId, title, abstract, ncbiUrl }: Props) {
  const [bookmarked, setBookmarked]   = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = JSON.parse(localStorage.getItem("medpulse_bookmarks") ?? "[]") as string[];
    return saved.includes(pmcId);
  });
  const [aiSummary, setAiSummary]     = useState<string | null>(null);
  const [loadingAI, setLoadingAI]     = useState(false);
  const [copied, setCopied]           = useState(false);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem("medpulse_bookmarks") ?? "[]") as string[];
    const next  = bookmarked ? saved.filter(id => id !== pmcId) : [...saved, pmcId];
    localStorage.setItem("medpulse_bookmarks", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  const handleAISummary = async () => {
    if (aiSummary) { setAiSummary(null); return; }
    setLoadingAI(true);
    try {
      const res = await fetch("/api/medical-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Summarize this medical article for a medical student in 3-4 bullet points. Focus on clinical relevance.\n\nTitle: ${title}\n\nAbstract: ${abstract}`,
          }],
        }),
      });
      if (!res.body) throw new Error("No stream");
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAiSummary(text);
      }
    } catch {
      setAiSummary("Failed to generate summary.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCopyCitation = () => {
    const citation = `${title}. PubMed Central, ${pmcId}. ${ncbiUrl}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 pt-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Tools</p>

      <button onClick={toggleBookmark}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
          bookmarked
            ? "bg-amber-900/30 border-amber-700/50 text-amber-300"
            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-700/40 hover:text-amber-300"
        }`}>
        {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {bookmarked ? "Saved" : "Bookmark"}
      </button>

      <button onClick={handleAISummary} disabled={loadingAI}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
          aiSummary
            ? "bg-indigo-900/40 border-indigo-700/50 text-indigo-300"
            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-700/40 hover:text-indigo-300"
        } disabled:opacity-50`}>
        <Sparkles className={`w-4 h-4 ${loadingAI ? "animate-pulse" : ""}`} />
        {loadingAI ? "Summarizing…" : aiSummary ? "Hide Summary" : "AI Summary"}
      </button>

      <button onClick={handleCopyCitation}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 text-xs font-semibold transition">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Citation"}
      </button>

      <a href={ncbiUrl} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-700/40 hover:text-blue-300 text-xs font-semibold transition">
        <ExternalLink className="w-4 h-4" />
        View on NCBI
      </a>

      {/* AI Summary output */}
      {aiSummary && (
        <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl">
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AI Summary</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
