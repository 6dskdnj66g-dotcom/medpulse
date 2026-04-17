"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle, Edit3, PenTool, ShieldCheck,
  TrendingUp, Users, BookOpen, Activity
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";

interface PlatformStats {
  total_users?: number;
  total_visits?: number;
  total_queries?: number;
  total_sources?: number;
}

// Static curated review items — representative of what a professor reviews
const REVIEW_ITEMS = [
  {
    id: 1,
    typeEn: "Pathology Flag",
    typeAr: "علامة مرضية",
    timeEn: "2 hours ago",
    timeAr: "منذ ساعتين",
    titleEn: 'AI confidence below threshold on "Atypical Pneumonia" macrolide protocol',
    titleAr: 'ثقة الذكاء الاصطناعي أقل من الحد في بروتوكول ماكروليد "الالتهاب الرئوي اللانمطي"',
    bodyEn: "Agent A confidence was 68% regarding the latest CDC macrolide resistance protocols. Human verification required before publishing.",
    bodyAr: "بلغت ثقة الوكيل A 68% بخصوص أحدث بروتوكولات مقاومة CDC للماكروليد. يلزم التحقق البشري قبل النشر.",
    urgent: true,
  },
  {
    id: 2,
    typeEn: "Content Update",
    typeAr: "تحديث محتوى",
    timeEn: "5 hours ago",
    timeAr: "منذ 5 ساعات",
    titleEn: 'ACC/AHA 2026 update conflicts with "Heart Failure" article §4.2',
    titleAr: 'تعارض تحديث ACC/AHA 2026 مع المقال §4.2 في "فشل القلب"',
    bodyEn: "Automated crawler detected that the updated LVEF threshold (≤40%) may conflict with existing article content. Review recommended.",
    bodyAr: "اكتشف الزاحف الآلي أن حد LVEF المحدّث (≤40٪) قد يتعارض مع محتوى المقال الحالي. يُنصح بالمراجعة.",
    urgent: true,
  },
  {
    id: 3,
    typeEn: "User Query Flag",
    typeAr: "علامة استعلام مستخدم",
    timeEn: "Yesterday",
    timeAr: "أمس",
    titleEn: "Experimental interaction query — RAG declined to answer",
    titleAr: "استعلام تفاعل تجريبي — رفض RAG الإجابة",
    bodyEn: "A query involved an unverified interaction between an investigational compound and beta-blockers. RAG correctly rejected the query.",
    bodyAr: "تضمّن استعلام تفاعلاً غير موثق بين مركب تجريبي وحاصرات بيتا. رفض RAG الاستعلام بشكل صحيح.",
    urgent: false,
  },
];

export function ProfessorDashboard() {
  const { lang, dir } = useLanguage();
  const { profile } = useSupabaseAuth();
  const isAr = lang === "ar";
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [reviews, setReviews] = useState(REVIEW_ITEMS);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/visitors/log");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || null);
        }
      } catch {
        // stats unavailable — show fallback
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const STAT_CARDS = [
    {
      icon: BookOpen,
      labelEn: "Total Sources", labelAr: "إجمالي المصادر",
      value: stats?.total_sources ? stats.total_sources.toLocaleString() : "500+",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      icon: Users,
      labelEn: "Active Users", labelAr: "المستخدمون النشطون",
      value: stats?.total_users ? stats.total_users.toLocaleString() : "—",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      color: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: TrendingUp,
      labelEn: "Total Visits", labelAr: "إجمالي الزيارات",
      value: stats?.total_visits ? stats.total_visits.toLocaleString() : "—",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  const handleApprove = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full page-transition" dir={dir}>

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="w-9 h-9 text-teal-500 flex-shrink-0" />
            {isAr ? "مركز القيادة الأكاديمي" : "Verified HQ"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {isAr
              ? "إشراف على إضافات الموسوعة، التحقق من علامات الذكاء الاصطناعي، وتأليف المحتوى."
              : "Oversee encyclopedia additions, validate AI flags, and author peer-reviewed content."}
          </p>
          {profile?.full_name && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold mt-1">
              {isAr ? `مرحباً، د. ${profile.full_name}` : `Welcome, Dr. ${profile.full_name}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800 font-bold text-sm">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          {isAr ? "الإنسان في الحلقة · نشط" : "Human-in-the-Loop Active"}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(stat => (
          <div key={stat.labelEn} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            {loadingStats ? (
              <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isAr ? stat.labelAr : stat.labelEn}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── AI Validation Queue ── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            {isAr ? "قائمة التحقق من الذكاء الاصطناعي" : "Pending AI Validations"}
            <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs px-2 py-1 rounded-full font-bold">
              {reviews.filter(r => r.urgent).length} {isAr ? "عاجل" : "Urgent"}
            </span>
          </h2>

          {reviews.length === 0 ? (
            <div className="premium-card p-10 text-center text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-500 opacity-60" />
              <p className="font-bold">{isAr ? "لا توجد مراجعات معلقة" : "No pending reviews"}</p>
              <p className="text-sm mt-1">{isAr ? "تمت معالجة جميع العلامات" : "All flags have been processed"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(item => (
                <div key={item.id} className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border transition-all ${
                  item.urgent ? "border-amber-200 dark:border-amber-800/60" : "border-slate-200 dark:border-slate-800"
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${item.urgent ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                        {isAr ? item.typeAr : item.typeEn}
                      </span>
                      {item.urgent && (
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          {isAr ? "عاجل" : "Urgent"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {isAr ? item.timeAr : item.timeEn}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 leading-relaxed">
                    {isAr ? item.bodyAr : item.bodyEn}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isAr ? "موافقة" : "Approve"}
                    </button>
                    <button className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Edit3 className="w-4 h-4" />
                      {isAr ? "تعديل" : "Edit Output"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Publishing Panel ── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-sky-500 flex-shrink-0" />
            {isAr ? "النشر" : "Publishing"}
          </h2>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-[#020617] p-6 rounded-2xl shadow-lg border border-slate-700 relative overflow-hidden group hover:shadow-xl transition-all h-52 flex flex-col justify-end cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
              <PenTool className="w-36 h-36 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-bold text-xl mb-2">
                {isAr ? "تأليف مقال جديد" : "Author New Article"}
              </h3>
              <p className="text-slate-400 text-sm mb-4 max-w-[200px] leading-relaxed">
                {isAr
                  ? "أرسل محتوى مراجَعاً إلى قاعدة بيانات الموسوعة العالمية."
                  : "Submit peer-reviewed content to the Global Encyclopedia vector database."}
              </p>
              <div className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg inline-flex text-sm transition-colors backdrop-blur-md">
                {isAr ? "فتح المحرر" : "Open Editor"}
              </div>
            </div>
          </div>

          {/* Authorship Stats */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              {isAr ? "إسهاماتي" : "Your Authorship"}
            </h3>
            <div className="space-y-3">
              {[
                { labelEn: "Articles Authored", labelAr: "مقالات مؤلَّفة", value: profile ? "—" : "24", bar: "70%" },
                { labelEn: "Validations Done",  labelAr: "عمليات التحقق",   value: profile ? "—" : "143", bar: "90%" },
                { labelEn: "Pending Reviews",   labelAr: "مراجعات معلقة",   value: String(reviews.length), bar: `${(reviews.length / 3) * 100}%` },
              ].map(item => (
                <div key={item.labelEn}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? item.labelAr : item.labelEn}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full transition-all duration-700" style={{ width: item.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
