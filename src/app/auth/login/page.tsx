"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
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
    <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-clinical-violet)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(var(--color-medical-indigo-rgb),0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">مرحباً بعودتك</h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base mt-2 font-medium">سجّل دخولك إلى MedPulse AI</p>
        </div>

        <div className="medpulse-card glass level-2 p-8 shadow-2xl border-[var(--border-subtle)]">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
                التسجيل قيد الإعداد — أضف SUPABASE_URL إلى Vercel لتفعيله.{" "}
                <Link href="/auth/register" className="underline decoration-amber-500/30 hover:decoration-amber-500 transition-all font-extrabold">إنشاء حساب</Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  autoComplete="email"
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-5 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">كلمة المرور</label>
                <button type="button" className="text-[11px] text-[var(--color-medical-indigo)] font-extrabold hover:underline decoration-[var(--color-medical-indigo)]/30">نسيت كلمة المرور؟</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-12 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="text-[13px] text-rose-600 dark:text-rose-400 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] text-white font-extrabold py-4 md:py-5 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(var(--color-medical-indigo-rgb),0.4)] hover:shadow-[0_15px_35px_-5px_rgba(var(--color-medical-indigo-rgb),0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
            >
              {loading ? "جارٍ تسجيل الدخول..." : (
                <>
                  <span className="text-[15px] tracking-wide">تسجيل الدخول</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span className="text-[11px] tracking-widest uppercase text-[var(--text-tertiary)] font-extrabold">أو</span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            </div>

            {/* Continue as Guest */}
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] border-2 border-[var(--border-subtle)] text-[var(--text-secondary)] font-extrabold text-[14px] hover:bg-[var(--bg-1)] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              المتابعة كزائر (بدون حساب)
            </Link>

            <p className="text-center text-[13px] text-[var(--text-secondary)] mt-6 font-medium">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-[var(--color-medical-indigo)] font-extrabold hover:underline decoration-[var(--color-medical-indigo)]/30 transition-all">إنشاء حساب مجاني</Link>
            </p>
          </form>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {["🔒 آمن 100%", "📊 تتبع التقدم", "🌍 مصادر عالمية"].map(f => (
            <div key={f} className="glass level-1 border border-[var(--border-subtle)] rounded-2xl p-3 text-center shadow-sm">
              <p className="text-[11px] text-[var(--text-secondary)] font-extrabold tracking-wide">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
