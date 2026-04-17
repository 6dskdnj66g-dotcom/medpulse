"use client";

import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import {
  Users, Activity, Globe, BookOpen, TrendingUp, Award,
  Eye, Smartphone, Monitor, RefreshCw, Database, Zap,
  ChevronUp, ChevronDown, Shield, AlertCircle, BarChart2,
  Star
} from "lucide-react";
import Link from "next/link";

interface Stats {
  total_registered_users: number;
  active_today: number;
  new_this_week: number;
  visits_today: number;
  visits_this_week: number;
  guest_visits_this_week: number;
  total_medical_sources: number;
  total_sessions_completed: number;
  total_xp_awarded: number;
  avg_accuracy_pct: number;
}

interface VisitorData {
  stats: Stats;
  recentVisits: Array<{ page: string; country: string; device_type: string; browser: string; is_registered: boolean; created_at: string }>;
  pageBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
    sky: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500/20" },
    teal: { bg: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/20" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
    orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className={`premium-card p-6 border ${c.border} hover:scale-[1.02] transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-black ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {trend >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Bar Chart (pure CSS) ────────────────────────────────────────────────────
function BarChart({ data, title }: { data: Record<string, number>; title: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="premium-card p-6">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5">{title}</h3>
      <div className="space-y-3">
        {entries.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 w-24 truncate text-right">{label}</span>
            <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-xl flex items-center justify-end pr-3 transition-all duration-1000"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              >
                <span className="text-[10px] font-black text-white">{count}</span>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات بعد</p>
        )}
      </div>
    </div>
  );
}

// ── Live Feed Row ────────────────────────────────────────────────────────────
function LiveFeedRow({ visit }: { visit: { page: string; country: string; device_type: string; browser: string; is_registered: boolean; created_at: string } }) {
  const deviceIcon = visit.device_type === "mobile" ? "📱" : "🖥️";
  const when = new Date(visit.created_at);
  // eslint-disable-next-line react-hooks/purity
  const timeAgo = Math.round((Date.now() - when.getTime()) / 60000);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${visit.is_registered ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{visit.page}</p>
        <p className="text-xs text-slate-400">{visit.country || "—"} · {deviceIcon} {visit.browser}</p>
      </div>
      <div className="text-right">
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${visit.is_registered ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
          {visit.is_registered ? "مسجل" : "زائر"}
        </span>
        <p className="text-[10px] text-slate-400 mt-1">{timeAgo}m ago</p>
      </div>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { profile, loading } = useSupabaseAuth();
  const [data, setData] = useState<VisitorData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "visitors" | "sources">("overview");
  const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR'));

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      // Allow access in dev mode
    }
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/visitors/log");
      if (res.ok) setData(await res.json());
    } catch { /* silent */ } finally {
      setFetching(false);
    }
  }

  async function handleSeedSources() {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/admin/seed-sources", { method: "POST" });
      const json = await res.json();
      setSeedResult(json.success ? `✅ تم! ${json.total} مصدر في قاعدة البيانات` : `❌ خطأ: ${json.error}`);
    } catch {
      setSeedResult("❌ فشل الاتصال بقاعدة البيانات");
    } finally {
      setSeeding(false);
    }
  }

  const stats = data?.stats;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 w-full page-transition">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">لوحة تحكم الأدمن</h1>
            <p className="text-slate-500 text-sm mt-1">MedPulse AI — إحصائيات المنصة في الوقت الفعلي</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black hover:bg-slate-200 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
            تحديث
          </button>
          <div className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            مباشر
          </div>
        </div>
      </div>

      {/* ── Not Configured Warning ── */}
      {!isConfigured && (
        <div className="mb-8 p-5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-700 dark:text-amber-300 mb-2">⚠️ Supabase غير مُفعّل — البيانات المعروضة تجريبية</p>
            <ol className="text-sm text-amber-600 dark:text-amber-400 space-y-1 font-bold list-decimal ml-4">
              <li>أنشئ مشروع مجاني على <strong>supabase.com</strong></li>
              <li>نفّذ ملف <code className="bg-amber-500/20 px-1 rounded">supabase/schema.sql</code> في SQL Editor</li>
              <li>أضف <code className="bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> و <code className="bg-amber-500/20 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> إلى Vercel</li>
              <li>أعِد النشر وافتح هذه الصفحة مرة أخرى</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "overview", label: "نظرة عامة", icon: BarChart2 },
          { id: "visitors", label: "الزوار", icon: Globe },
          { id: "sources", label: "إدارة المصادر", icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ════════ TAB: OVERVIEW ════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="إجمالي المستخدمين" value={stats?.total_registered_users ?? "—"}
              sub="مستخدم مسجل" icon={Users} color="indigo" trend={12}
            />
            <MetricCard
              label="نشطون اليوم" value={stats?.active_today ?? "—"}
              sub="جلسات نشطة" icon={Zap} color="emerald" trend={5}
            />
            <MetricCard
              label="زيارات اليوم" value={stats?.visits_today ?? "—"}
              sub="مسجلون + ضيوف" icon={Eye} color="sky" trend={8}
            />
            <MetricCard
              label="جلسات مكتملة" value={stats?.total_sessions_completed ?? "—"}
              sub="عبر جميع الوحدات" icon={Award} color="amber" trend={23}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="جدد هذا الأسبوع" value={stats?.new_this_week ?? "—"}
              sub="مستخدمون جدد" icon={TrendingUp} color="violet" trend={18}
            />
            <MetricCard
              label="زيارات الأسبوع" value={stats?.visits_this_week ?? "—"}
              sub="إجمالي الأسبوع" icon={Activity} color="teal" trend={3}
            />
            <MetricCard
              label="ضيوف هذا الأسبوع" value={stats?.guest_visits_this_week ?? "—"}
              sub="زوار غير مسجلين" icon={Globe} color="orange"
            />
            <MetricCard
              label="متوسط الدقة" value={stats?.avg_accuracy_pct ? `${Math.round(stats.avg_accuracy_pct)}%` : "—"}
              sub="عبر جميع الاختبارات" icon={Star} color="rose"
            />
          </div>

          {/* Sources + XP summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="premium-card p-8 md:col-span-1 text-center bg-gradient-to-br from-indigo-500/5 to-teal-500/5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">إجمالي XP الممنوح</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-teal-500 mb-2">
                {stats?.total_xp_awarded ? (stats.total_xp_awarded / 1000).toFixed(1) + "K" : "—"}
              </p>
              <p className="text-slate-500 text-sm font-bold">نقاط XP على المنصة</p>
            </div>
            <div className="premium-card p-8 md:col-span-1 text-center bg-gradient-to-br from-emerald-500/5 to-sky-500/5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">المصادر الطبية</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-sky-500 mb-2">
                {stats?.total_medical_sources ?? "200+"}
              </p>
              <p className="text-slate-500 text-sm font-bold">مصدر عالمي وعربي</p>
            </div>
            <div className="premium-card p-8 md:col-span-1 text-center bg-gradient-to-br from-amber-500/5 to-rose-500/5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">معدل التحويل</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-rose-500 mb-2">
                {stats && stats.visits_this_week > 0
                  ? `${Math.round((stats.total_registered_users / stats.visits_this_week) * 100)}%`
                  : "—"}
              </p>
              <p className="text-slate-500 text-sm font-bold">زائر → مسجل</p>
            </div>
          </div>
        </>
      )}

      {/* ════════ TAB: VISITORS ════════ */}
      {activeTab === "visitors" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Page breakdown */}
          <BarChart
            data={data?.pageBreakdown ?? { "/encyclopedia": 0, "/calculators": 0, "/usmle": 0 }}
            title="📄 أكثر الصفحات زيارة"
          />
          {/* Country breakdown */}
          <BarChart
            data={data?.countryBreakdown ?? { "SA": 0, "IQ": 0, "EG": 0 }}
            title="🌍 توزيع الزيارات حسب الدولة"
          />

          {/* Live Feed */}
          <div className="premium-card p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">🔴 آخر الزيارات</h3>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                تحديث كل 30 ثانية
              </div>
            </div>
            <div>
              {data?.recentVisits?.slice(0, 15).map((v, i) => (
                <LiveFeedRow key={i} visit={v} />
              ))}
              {(!data?.recentVisits || data.recentVisits.length === 0) && (
                <div className="text-center py-12 text-slate-400">
                  <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">لا توجد زيارات بعد — قم بتفعيل Supabase</p>
                </div>
              )}
            </div>
          </div>

          {/* Devices breakdown */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5">📱 نوع الأجهزة</h3>
            {(() => {
              const devices = data?.recentVisits?.reduce((acc: Record<string, number>, v) => {
                if (v.device_type) acc[v.device_type] = (acc[v.device_type] || 0) + 1;
                return acc;
              }, {}) || {};
              const total = Object.values(devices).reduce((a, b) => a + b, 0) || 1;
              const types = [
                { key: "mobile", label: "موبايل", icon: Smartphone, color: "from-indigo-500 to-teal-500" },
                { key: "desktop", label: "كمبيوتر", icon: Monitor, color: "from-emerald-500 to-sky-500" },
                { key: "tablet", label: "تابلت", icon: Monitor, color: "from-amber-500 to-orange-500" },
              ];
              return types.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="flex items-center gap-4 mb-4">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-xl flex items-center justify-end pr-3 transition-all duration-1000`}
                      style={{ width: `${Math.round(((devices[key] || 0) / total) * 100)}%` }}
                    >
                      <span className="text-[10px] font-black text-white">{Math.round(((devices[key] || 0) / total) * 100)}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-500 w-16">{label}</span>
                </div>
              ));
            })()}
          </div>

          {/* Registered vs Guest */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-5">👤 مسجل مقابل ضيف</h3>
            {(() => {
              const registered = data?.recentVisits?.filter(v => v.is_registered).length || 0;
              const guest = (data?.recentVisits?.length || 0) - registered;
              const total = registered + guest || 1;
              return (
                <div className="space-y-4">
                  {[
                    { label: "مستخدمون مسجلون", count: registered, color: "from-indigo-500 to-teal-500", emoji: "✅" },
                    { label: "زوار ضيوف", count: guest, color: "from-slate-300 to-slate-400", emoji: "👀" },
                  ].map(({ label, count, color, emoji }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-black text-slate-500 mb-2">
                        <span>{emoji} {label}</span>
                        <span>{count} ({Math.round((count / total) * 100)}%)</span>
                      </div>
                      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} rounded-xl transition-all duration-1000`}
                          style={{ width: `${Math.round((count / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ════════ TAB: SOURCES MANAGEMENT ════════ */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          {/* Seed action */}
          <div className="premium-card p-8 bg-gradient-to-br from-indigo-500/5 to-teal-500/5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">🌱 نقل المصادر إلى قاعدة البيانات</h2>
                <p className="text-sm text-slate-500 font-bold mb-4">
                  انقر الزر لنقل كل 200+ مصدر طبي عالمي وعربي إلى Supabase. هذه العملية تستغرق ثوانٍ فقط.
                </p>
                {seedResult && (
                  <div className={`p-3 rounded-xl text-sm font-black mb-4 ${seedResult.includes("✅") ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}>
                    {seedResult}
                  </div>
                )}
              </div>
              <button
                onClick={handleSeedSources}
                disabled={seeding}
                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] disabled:opacity-60 transition-all whitespace-nowrap"
              >
                <Database className={`w-5 h-5 ${seeding ? "animate-spin" : ""}`} />
                {seeding ? "جاري النقل..." : "نقل المصادر الآن"}
              </button>
            </div>
          </div>

          {/* Sources stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "مجلات عالمية", count: "120+", color: "indigo", emoji: "📰" },
              { label: "مجلات عربية", count: "26", color: "emerald", emoji: "🌍" },
              { label: "قواعد بيانات", count: "25", color: "sky", emoji: "💾" },
              { label: "هيئات إرشادية", count: "45", color: "amber", emoji: "📋" },
              { label: "كتب طبية", count: "50+", color: "rose", emoji: "📚" },
            ].map(s => (
              <div key={s.label} className={`premium-card p-6 text-center border border-${s.color}-500/20 bg-${s.color}-500/5`}>
                <p className="text-3xl mb-2">{s.emoji}</p>
                <p className={`text-2xl font-black text-${s.color}-600 dark:text-${s.color}-400`}>{s.count}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">🔗 إجراءات سريعة</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Link href="/library" className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-all">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-black text-indigo-700 dark:text-indigo-300">مكتبة المصادر</p>
                  <p className="text-xs text-slate-400">عرض + بحث جميع المصادر</p>
                </div>
              </Link>
              <Link href="/encyclopedia" className="flex items-center gap-3 p-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 transition-all">
                <Globe className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm font-black text-teal-700 dark:text-teal-300">الموسوعة الطبية</p>
                  <p className="text-xs text-slate-400">عرض التخصصات والمقالات</p>
                </div>
              </Link>
              <Link href="/progress" className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 transition-all">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-sm font-black text-amber-700 dark:text-amber-300">تتبع التقدم</p>
                  <p className="text-xs text-slate-400">XP وإحصائيات المستخدمين</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
