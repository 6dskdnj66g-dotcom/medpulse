import Link from "next/link";
import { Metadata } from "next";
import { HeartPulse, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | MedPulse AI",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">

        {/* Icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="w-32 h-32 border-4 border-indigo-500/10 border-t-indigo-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HeartPulse className="w-14 h-14 text-indigo-500" />
          </div>
        </div>

        {/* Error code */}
        <div>
          <p className="text-[120px] font-black leading-none text-slate-100 dark:text-slate-800 select-none">
            404
          </p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white -mt-4">
            Page Not Found
          </h1>
          <p className="text-slate-500 mt-3 text-base leading-relaxed">
            The clinical resource you are looking for does not exist or has been moved.
            <br />
            <span className="text-sm text-slate-400 mt-1 block" dir="rtl">
              الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link href="/encyclopedia"
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black px-8 py-4 rounded-2xl hover:border-indigo-500 transition-all">
            <Search className="w-4 h-4" />
            Search Encyclopedia
          </Link>
        </div>

        {/* Back link */}
        <p className="text-sm text-slate-400">
          Or use your browser&apos;s back button to return.
        </p>

      </div>
    </div>
  );
}
