"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
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
      <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="medpulse-card glass level-2 max-w-md w-full p-10 text-center relative z-10 border-[var(--border-subtle)] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)] transform hover:scale-105 transition-transform duration-500">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">تم التسجيل!</h2>
          <p className="text-[var(--text-secondary)] mb-8 font-medium">تحقق من بريدك الإلكتروني لتفعيل حسابك.</p>
          <div className="w-full h-1.5 bg-[var(--bg-1)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-[grow_3s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-700">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-clinical-violet)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(var(--color-medical-indigo-rgb),0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">إنشاء حساب MedPulse</h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base mt-2 font-medium">انضم إلى أكاديمية الذكاء الاصطناعي الطبي</p>
        </div>

        <div className="medpulse-card glass level-2 p-6 md:p-8 shadow-2xl border-[var(--border-subtle)]">
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed">قاعدة البيانات قيد الإعداد. ستُفعَّل قريباً.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">الاسم الكامل</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => update("fullName", e.target.value)}
                  placeholder="د. محمد أحمد"
                  required
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-5 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-5 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">التخصص المهني</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => update("role", r.value)}
                    className={`p-3 md:p-4 rounded-[20px] border-2 text-center transition-all duration-300 ${
                      form.role === r.value
                        ? "bg-[var(--color-medical-indigo)]/10 border-[var(--color-medical-indigo)]/50 shadow-sm"
                        : "bg-[var(--bg-0)] border-[var(--border-subtle)] hover:border-[var(--color-medical-indigo)]/30 hover:bg-[var(--bg-1)] shadow-inner"
                    }`}
                  >
                    <div className="text-2xl mb-1.5 transition-transform duration-300 transform group-hover:scale-110">{r.icon}</div>
                    <div className={`text-[10px] md:text-[11px] font-extrabold leading-tight tracking-wide ${form.role === r.value ? "text-[var(--color-medical-indigo)]" : "text-[var(--text-secondary)]"}`}>{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-12 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">تأكيد كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-medical-indigo)] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={e => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-[20px] pl-12 pr-5 py-4 text-[15px] text-[var(--text-primary)] font-bold placeholder-[var(--text-tertiary)]/50 focus:ring-4 focus:ring-[var(--color-medical-indigo)]/10 focus:border-[var(--color-medical-indigo)]/30 outline-none transition-all shadow-inner"
                />
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
              className="w-full bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] text-white font-extrabold py-4 md:py-5 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(var(--color-medical-indigo-rgb),0.4)] hover:shadow-[0_15px_35px_-5px_rgba(var(--color-medical-indigo-rgb),0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 mt-4"
            >
              <span className="text-[15px] tracking-wide">{loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب مجاني"}</span>
            </button>

            <p className="text-center text-[13px] text-[var(--text-secondary)] mt-6 font-medium">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="text-[var(--color-medical-indigo)] font-extrabold hover:underline decoration-[var(--color-medical-indigo)]/30 transition-all">تسجيل الدخول</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
