"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { Mail, Lock, Eye, EyeOff, Brain, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isSupabaseConfigured } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError("قاعدة البيانات غير مُفعّلة بعد. يرجى الانتظار.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(
        error.includes("Invalid login") ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : error.includes("Email not confirmed") ? "يرجى تفعيل بريدك الإلكتروني أولاً"
        : error
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">مرحباً بعودتك</h1>
          <p className="text-slate-400 text-sm mt-1">سجّل دخولك إلى MedPulse AI</p>
        </div>

        <div className="premium-card p-8">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400 font-bold">
                التسجيل قيد الإعداد — أضف SUPABASE_URL إلى Vercel لتفعيله.{" "}
                <Link href="/auth/register" className="underline">إنشاء حساب</Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  autoComplete="email"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">كلمة المرور</label>
                <button type="button" className="text-xs text-indigo-500 font-black hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-12 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-xs text-rose-400 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 group"
            >
              {loading ? "جارٍ تسجيل الدخول..." : (
                <>
                  تسجيل الدخول
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 font-bold">أو</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Continue as Guest */}
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              المتابعة كزائر (بدون حساب)
            </Link>

            <p className="text-center text-xs text-slate-500 mt-4">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-indigo-500 font-black hover:underline">إنشاء حساب مجاني</Link>
            </p>
          </form>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {["🔒 آمن 100%", "📊 تتبع التقدم", "🌍 مصادر عالمية"].map(f => (
            <div key={f} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
              <p className="text-xs text-slate-400 font-bold">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
