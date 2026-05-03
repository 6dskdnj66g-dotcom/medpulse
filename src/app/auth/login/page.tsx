"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Brain,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
      setError("Sign-in is currently being configured. Please try again shortly.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError(
        error.includes("Invalid login")
          ? "Incorrect email or password."
          : error.includes("Email not confirmed")
            ? "Please verify your email to continue."
            : error,
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex items-center justify-center p-6">
      {/* Deep gradient backdrop + ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
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
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 font-medium">
            Sign in to your MedPulse AI account
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        >
          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 rounded-2xl flex gap-3 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-200 font-semibold leading-relaxed">
                Sign-in is being provisioned. You can{" "}
                <Link
                  href="/auth/register"
                  className="underline decoration-amber-400/50 hover:decoration-amber-300 font-bold"
                >
                  create an account
                </Link>{" "}
                in the meantime.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-[15px] text-white font-medium placeholder-slate-500 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all duration-200 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] text-blue-400 font-bold hover:text-blue-300 hover:underline decoration-blue-400/40"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(99,102,241,0.8)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-300 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-[15px]">Signing in...</span>
                </>
              ) : (
                <>
                  <span className="text-[15px] tracking-wide">Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] tracking-widest uppercase text-slate-500 font-bold">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Continue as guest */}
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/10 bg-white/[0.02] text-slate-300 font-bold text-[14px] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200"
            >
              Continue as guest
            </Link>

            <p className="text-center text-[13px] text-slate-400 mt-6 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-400 font-bold hover:text-blue-300 hover:underline decoration-blue-400/40"
              >
                Create one free
              </Link>
            </p>
          </form>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {["100% Secure", "Track Progress", "Global Sources"].map((f) => (
            <div
              key={f}
              className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center"
            >
              <p className="text-[11px] text-slate-300 font-bold tracking-wide">{f}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
