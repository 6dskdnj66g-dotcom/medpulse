"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="text-center max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          {error.message && error.message !== "An error occurred in the Server Components render."
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <div className="bg-gray-800 rounded-xl p-3 mb-5 text-left">
            <code className="text-xs text-gray-500 font-mono">Error ID: {error.digest}</code>
          </div>
        )}
        <button
          onClick={reset}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
