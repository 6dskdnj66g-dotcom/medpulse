"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { Mail, Lock, User, Eye, EyeOff, Brain, AlertCircle, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "student", label: "Medical Student", icon: "🎓" },
  { value: "doctor", label: "Doctor / Physician", icon: "👨‍⚕️" },
  { value: "professor", label: "Professor / Instructor", icon: "🏫" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isSupabaseConfigured } = useSupabaseAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError("قاعدة البيانات غير مُفعّلة بعد. يرجى الانتظار حتى إعداد Supabase.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName, form.role);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/"), 3000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="premium-card max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">تم التسجيل!</h2>
          <p className="text-slate-500 mb-6">تحقق من بريدك الإلكتروني لتفعيل حسابك.</p>
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full animate-[grow_3s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">إنشاء حساب MedPulse</h1>
          <p className="text-slate-400 text-sm mt-1">انضم إلى أكاديمية الذكاء الاصطناعي الطبي</p>
        </div>

        <div className="premium-card p-8">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400 font-bold">قاعدة البيانات قيد الإعداد. ستُفعَّل قريباً.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  placeholder="د. محمد أحمد"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">التخصص المهني</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update("role", r.value)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      form.role === r.value
                        ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    <div className="text-xl mb-1">{r.icon}</div>
                    <div className="text-[10px] font-black leading-tight">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-12 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 dark:text-white font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                />
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
              className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب مجاني"}
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="text-indigo-500 font-black hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
