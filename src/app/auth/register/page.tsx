"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Brain,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

const ROLES = [
  { value: "student", label: "Medical Student", icon: "🎓" },
  { value: "doctor", label: "Doctor / Physician", icon: "👨‍⚕️" },
  { value: "professor", label: "Professor / Instructor", icon: "🏫" },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isSupabaseConfigured } = useSupabaseAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError("Sign-up is currently being configured. Please try again shortly.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      form.email,
      form.password,
      form.fullName,
      form.role,
    );
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/"), 3000);
  }

  // ── Success screen ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
            className="inline-flex w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl items-center justify-center mb-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.7)]"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-emerald-200 mb-3">
            Account created
          </h2>
          <p className="text-slate-400 mb-8 font-medium">
            Check your email to verify your account. Redirecting you home...
          </p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex items-center justify-center p-6">
      {/* Deep gradient backdrop + ambient glows (matches login) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo + heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="inline-flex w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-3xl items-center justify-center mb-5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-blue-100">
            Create your account
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 font-medium">
            Join the MedPulse AI clinical academy
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        >
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 rounded-2xl flex gap-3 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-200 font-semibold leading-relaxed">
                Sign-up is being provisioned. It will be enabled shortly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Dr. Mohamed Ahmed"
                  required
                  autoComplete="name"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[15px] text-white font-medium placeholder-slate-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[15px] text-white font-medium placeholder-slate-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((r) => {
                  const selected = form.role === r.value;
                  return (
                    <motion.button
                      key={r.value}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => update("role", r.value)}
                      className={`p-3 md:p-4 rounded-2xl text-center transition-all duration-200 backdrop-blur-md border ${
                        selected
                          ? "bg-blue-500/15 border-blue-400/50 shadow-[0_0_24px_-8px_rgba(99,102,241,0.6)]"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-1.5 leading-none">{r.icon}</div>
                      <div
                        className={`text-[10px] md:text-[11px] font-bold leading-tight tracking-wide ${
                          selected ? "text-blue-300" : "text-slate-300"
                        }`}
                      >
                        {r.label}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-[15px] text-white font-medium placeholder-slate-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all duration-200 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Confirm Password
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[15px] text-white font-medium placeholder-slate-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  role="alert"
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-rose-200 font-semibold leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-300 flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-[15px]">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="text-[15px] tracking-wide">Create free account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </motion.button>

            <p className="text-center text-[13px] text-slate-400 mt-6 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-400 font-bold hover:text-blue-300 hover:underline decoration-blue-400/40"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
