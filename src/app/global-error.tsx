"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Critical System Error</h1>
            <p className="text-slate-500 mb-6">
              A catastrophic error occurred on the platform. Our self-healing monitors have been alerted.
            </p>
            <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left overflow-hidden">
              <code className="text-xs text-rose-600 font-mono break-words">
                {error.message || "Unknown Error"}
              </code>
            </div>
            <button
              onClick={() => reset()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Re-initialize System
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
