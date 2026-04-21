"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Copy, Check } from "lucide-react";

interface Props {
  bookId:  string;
  title:   string;
  ncbiUrl: string;
}

export function BookTools({ bookId, title, ncbiUrl }: Props) {
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = JSON.parse(localStorage.getItem("medpulse_book_bookmarks") ?? "[]") as string[];
    return saved.includes(bookId);
  });
  const [copied, setCopied] = useState(false);

  const toggleBookmark = () => {
    const saved = JSON.parse(localStorage.getItem("medpulse_book_bookmarks") ?? "[]") as string[];
    const next  = bookmarked ? saved.filter(id => id !== bookId) : [...saved, bookId];
    localStorage.setItem("medpulse_book_bookmarks", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}. NCBI Bookshelf, ${bookId}. ${ncbiUrl}`);
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

      <button onClick={handleCopy}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 text-xs font-semibold transition">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Reference"}
      </button>

      <a href={ncbiUrl} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-700/40 hover:text-blue-300 text-xs font-semibold transition">
        <ExternalLink className="w-4 h-4" />
        NCBI Bookshelf
      </a>
    </div>
  );
}
