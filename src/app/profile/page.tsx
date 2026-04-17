"use client";

import { useState } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { useAchievement } from "@/components/AchievementContext";
import Link from "next/link";
import {
  User, Award, TrendingUp, BookOpen, Brain, Activity,
  Edit3, Save, Shield, Calendar, Star, Flame, Target,
  LogOut, CheckCircle, Globe, Stethoscope
} from "lucide-react";

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Medical Student", xpRequired: 0 },
  { level: 2, title: "Clinical Clerk", xpRequired: 100 },
  { level: 3, title: "House Officer", xpRequired: 300 },
  { level: 4, title: "Registrar", xpRequired: 600 },
  { level: 5, title: "Senior Registrar", xpRequired: 1000 },
  { level: 6, title: "Consultant (MRCP)", xpRequired: 2000 },
  { level: 7, title: "Board Certified", xpRequired: 4000 },
  { level: 8, title: "Professor of Medicine", xpRequired: 8000 },
];

const SPECIALTIES = [
  "Internal Medicine", "Cardiology", "Neurology", "Oncology", "Surgery",
  "Pediatrics", "OB/GYN", "Emergency Medicine", "Critical Care",
  "Nephrology", "Gastroenterology", "Endocrinology", "Pulmonology",
  "Rheumatology", "Infectious Disease", "Psychiatry", "Radiology",
  "Ophthalmology", "Orthopedics", "Dermatology", "Urology",
  "Pharmacology", "Pathology", "Family Medicine",
];

const COUNTRIES = [
  "المملكة العربية السعودية", "الإمارات", "الكويت", "قطر", "البحرين",
  "سلطنة عُمان", "الأردن", "العراق", "مصر", "سوريا", "لبنان",
  "فلسطين", "اليمن", "ليبيا", "تونس", "الجزائر", "المغرب", "السودان",
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
];

function StatBadge({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    indigo:  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  };
  return (
    <div className={`premium-card p-5 border ${colors[color]}`}>
      <Icon className="w-5 h-5 mb-3" />
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut, loading } = useSupabaseAuth();
  const { xp } = useAchievement();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    specialty: profile?.specialty || "",
    institution: profile?.institution || "",
    country: profile?.country || "",
    bio: profile?.bio || "",
  });

  const effectiveXp = profile?.xp || xp;
  let currentLevel = LEVEL_THRESHOLDS[0];
  for (const lvl of LEVEL_THRESHOLDS) {
    if (effectiveXp >= lvl.xpRequired) currentLevel = lvl;
  }
  const nextLvlIdx = LEVEL_THRESHOLDS.indexOf(currentLevel) + 1;
  const nextLevel = LEVEL_THRESHOLDS[nextLvlIdx] || null;
  const progress = nextLevel
    ? ((effectiveXp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function handleSave() {
    setSaving(true);
    await updateProfile(form as Parameters<typeof updateProfile>[0]);
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">سجّل دخولك</h2>
        <p className="text-slate-500 mb-6">قم بتسجيل الدخول لعرض ملفك الشخصي وتتبع تقدمك</p>
        <div className="flex gap-3">
          <Link href="/auth/login" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl text-center hover:bg-indigo-700 transition-all">
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black rounded-2xl text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 w-full page-transition">

      {/* ── Header ── */}
      <div className="premium-card p-8 mb-8 bg-gradient-to-br from-indigo-500/5 via-transparent to-teal-500/5">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/30">
              {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.full_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-slate-500 text-sm font-bold">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase tracking-wider">
                    {profile?.role || "student"}
                  </span>
                  {profile?.specialty && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
                      {profile.specialty}
                    </span>
                  )}
                  {profile?.country && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      🌍 {profile.country}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    editing ? "bg-slate-100 dark:bg-slate-800 text-slate-500" : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editing ? "إلغاء" : "تعديل"}
                </button>
                <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-black hover:bg-rose-500/20 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {profile?.bio && !editing && (
              <p className="text-sm text-slate-500 mt-3 font-bold">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between text-xs font-black text-slate-400 mb-2">
            <span>🏆 {currentLevel.title}</span>
            {nextLevel && <span>التالي: {nextLevel.title} ({nextLevel.xpRequired - effectiveXp} XP)</span>}
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-black text-slate-400 mt-2">
            <span>{effectiveXp} XP</span>
            {nextLevel && <span>{nextLevel.xpRequired} XP</span>}
          </div>
        </div>
      </div>

      {/* Saved notification */}
      {saved && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex gap-3 items-center animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">تم حفظ الملف الشخصي بنجاح ✅</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <StatBadge icon={Star} label="إجمالي XP" value={effectiveXp} color="amber" />
            <StatBadge icon={Flame} label="سلسلة أيام" value={`${profile?.streak_days || 0}d`} color="rose" />
            <StatBadge icon={Award} label="المستوى" value={LEVEL_THRESHOLDS.indexOf(currentLevel) + 1} color="indigo" />
            <StatBadge icon={Calendar} label="تاريخ الانضمام" value={profile?.created_at ? new Date(profile.created_at).getFullYear() : "—"} color="sky" />
          </div>

          {/* Quick Actions */}
          <div className="premium-card p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              {[
                { href: "/usmle",      icon: Brain,        label: "USMLE Mode",         color: "indigo" },
                { href: "/calculators", icon: Target,      label: "Clinical Calculators", color: "sky" },
                { href: "/library",    icon: BookOpen,     label: "مكتبة المصادر",       color: "teal" },
                { href: "/progress",   icon: TrendingUp,   label: "تتبع التقدم",         color: "amber" },
                { href: "/ecg",        icon: Activity,     label: "ECG Interpreter",     color: "rose" },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                    <Icon className={`w-4 h-4 text-${link.color}-500`} />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Edit Form or Details */}
        <div className="md:col-span-2">
          <div className="premium-card p-8">
            <h2 className="text-base font-black uppercase tracking-widest text-slate-500 mb-6">
              {editing ? "✏️ تعديل الملف الشخصي" : "📋 بيانات الحساب"}
            </h2>

            {editing ? (
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.full_name}
                      onChange={e => update("full_name", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                      placeholder="د. محمد أحمد"
                    />
                  </div>
                </div>
                {/* Specialty */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">التخصص</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={form.specialty}
                      onChange={e => update("specialty", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none appearance-none"
                    >
                      <option value="">اختر تخصصك</option>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {/* Institution */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">المستشفى / الجامعة</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={form.institution}
                      onChange={e => update("institution", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none"
                      placeholder="مستشفى الملك فيصل التخصصي"
                    />
                  </div>
                </div>
                {/* Country */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">الدولة</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={form.country}
                      onChange={e => update("country", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none appearance-none"
                    >
                      <option value="">اختر دولتك</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Bio */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">نبذة شخصية</label>
                  <textarea
                    value={form.bio}
                    onChange={e => update("bio", e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none"
                    placeholder="اكتب نبذة مختصرة عنك..."
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.01] transition-all disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "الاسم الكامل",    value: profile?.full_name || "—",     icon: User },
                  { label: "التخصص",           value: profile?.specialty || "—",     icon: Stethoscope },
                  { label: "المؤسسة",          value: profile?.institution || "—",   icon: Shield },
                  { label: "الدولة",           value: profile?.country || "—",       icon: Globe },
                  { label: "آخر نشاط",         value: profile?.last_active || "—",   icon: Calendar },
                  { label: "نوع الحساب",       value: profile?.role || "student",    icon: Award },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
                {profile?.bio && (
                  <div className="pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">نبذة شخصية</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{profile.bio}</p>
                  </div>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all mt-4"
                >
                  + تعديل بياناتك
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
