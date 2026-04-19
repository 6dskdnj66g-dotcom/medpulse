"use client";

import { useState, useMemo } from "react";
import {
  Stethoscope, Filter, Trophy, Clock, Target, ChevronRight,
  BookOpen, Users, Brain, Heart, Baby, Activity, Pill,
  AlertCircle, Star
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import {
  OSCE_STATIONS, OSCE_SPECIALTIES, DIFFICULTY_LABELS, STATION_TYPE_LABELS,
  type OSCEStation
} from "@/lib/osceStations";

const SPECIALTY_ICONS: Record<string, React.ElementType> = {
  "Internal Medicine": Stethoscope,
  "Cardiology": Heart,
  "Respiratory": Activity,
  "Neurology": Brain,
  "Psychiatry": Brain,
  "Pediatrics": Baby,
  "OB/GYN": Users,
  "Surgery": Activity,
  "Emergency Medicine": AlertCircle,
  "Gastroenterology": Pill,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  year1: "bg-emerald-500/10 text-emerald-600",
  year2: "bg-teal-500/10 text-teal-600",
  year3: "bg-sky-500/10 text-sky-600",
  year4: "bg-indigo-500/10 text-indigo-600",
  finals: "bg-amber-500/10 text-amber-600",
  postgrad: "bg-rose-500/10 text-rose-600",
};

const TYPE_COLORS: Record<string, string> = {
  history_taking: "bg-blue-500/10 text-blue-600",
  examination: "bg-teal-500/10 text-teal-600",
  communication: "bg-purple-500/10 text-purple-600",
  procedure: "bg-red-500/10 text-red-600",
  data_interpretation: "bg-amber-500/10 text-amber-600",
  mixed: "bg-indigo-500/10 text-indigo-600",
};

function StationCard({ station }: { station: OSCEStation }) {
  const SpecialtyIcon = SPECIALTY_ICONS[station.specialty] ?? Stethoscope;
  const diffColor = DIFFICULTY_COLORS[station.difficulty] ?? "bg-slate-500/10 text-slate-600";
  const typeColor = TYPE_COLORS[station.stationType] ?? "bg-slate-500/10 text-slate-600";
  const { isAr } = useLanguage();

  return (
    <Link
      href={`/simulator/${station.id}`}
      className="group block rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}
    >
      {/* Specialty color bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)]" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}
            style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}>
            <SpecialtyIcon className="w-5 h-5" style={{ color: "var(--color-medical-indigo)" }} />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${diffColor}`}>
              {DIFFICULTY_LABELS[station.difficulty] ?? station.difficulty}
            </span>
          </div>
        </div>

        {/* Station ID badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
            {station.id}
          </span>
          <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-sm leading-tight mb-1" style={{ color: "var(--text-primary)" }}>
          {isAr && station.titleAr ? station.titleAr : station.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${typeColor}`}>
            {STATION_TYPE_LABELS[station.stationType]}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "var(--bg-3)", color: "var(--text-secondary)" }}>
            {station.specialty}
          </span>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {station.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {station.markingScheme.totalMarks} marks
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--color-medical-indigo)" }}>
            Start
            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function OSCEHome() {
  const { lang, dir } = useLanguage();
  const { loading } = useSupabaseAuth();
  const isAr = lang === "ar";
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return OSCE_STATIONS.filter(s => {
      if (specialtyFilter !== "all" && s.specialty !== specialtyFilter) return false;
      if (difficultyFilter !== "all" && s.difficulty !== difficultyFilter) return false;
      if (typeFilter !== "all" && s.stationType !== typeFilter) return false;
      return true;
    });
  }, [specialtyFilter, difficultyFilter, typeFilter]);

  const statsBySpecialty = useMemo(() => {
    const counts: Record<string, number> = {};
    OSCE_STATIONS.forEach(s => { counts[s.specialty] = (counts[s.specialty] || 0) + 1; });
    return counts;
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24 md:pb-8 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir={dir}>

      {/* ── HERO ── */}
      <div
        className="relative rounded-3xl p-6 md:p-10 overflow-hidden"
        style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-medical-indigo)]/5 to-[var(--color-clinical-violet)]/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-medical-indigo)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] rounded-2xl flex items-center justify-center shadow-xl">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {isAr ? "محاكي OSCE السريري" : "Clinical OSCE Simulator"}
              </h1>
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                {isAr ? "تدرب مع مريض AI وممتحن AI — تغذية راجعة فورية" : "Practice with AI Patient & AI Examiner — Instant detailed feedback"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: isAr ? "محطة OSCE" : "OSCE Stations", value: OSCE_STATIONS.length.toString(), icon: Target },
              { label: isAr ? "تخصصات" : "Specialties", value: OSCE_SPECIALTIES.length.toString(), icon: BookOpen },
              { label: isAr ? "مستويات صعوبة" : "Difficulty Levels", value: "6", icon: Trophy },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 rounded-2xl" style={{ background: "var(--bg-3)", border: "1px solid var(--border-subtle)" }}>
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--color-medical-indigo)" }} />
                  <div className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: "1", title: isAr ? "اختر المحطة" : "Choose Station", desc: isAr ? "اختر التخصص والمستوى" : "Pick specialty & difficulty", icon: Filter },
          { step: "2", title: isAr ? "ادخل المحطة" : "Enter Station", desc: isAr ? "تحدث مع المريض AI" : "Talk to the AI patient", icon: Users },
          { step: "3", title: isAr ? "احصل على تغذية راجعة" : "Get Feedback", desc: isAr ? "درجات وتحليل تفصيلي" : "Detailed marks & feedback", icon: Star },
        ].map(item => (
            <div key={item.step} className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)" }}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-medical-indigo)] to-[var(--color-clinical-violet)] text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            {isAr ? `المحطات (${filtered.length})` : `Stations (${filtered.length})`}
          </h2>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: showFilters ? "rgba(99,102,241,0.1)" : "var(--bg-2)",
              border: `1px solid ${showFilters ? "rgba(99,102,241,0.3)" : "var(--border-subtle)"}`,
              color: showFilters ? "var(--color-medical-indigo)" : "var(--text-secondary)",
            }}
          >
            <Filter className="w-4 h-4" />
            {isAr ? "فلاتر" : "Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-2xl animate-in fade-in duration-300" style={{ background: "var(--bg-2)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                {isAr ? "التخصص" : "Specialty"}
              </label>
              <select
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{ background: "var(--bg-3)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
              >
                <option value="all">{isAr ? "كل التخصصات" : "All Specialties"}</option>
                {OSCE_SPECIALTIES.map(sp => (
                  <option key={sp} value={sp}>{sp} ({statsBySpecialty[sp] || 0})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                {isAr ? "المستوى" : "Difficulty"}
              </label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{ background: "var(--bg-3)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
              >
                <option value="all">{isAr ? "كل المستويات" : "All Levels"}</option>
                {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                {isAr ? "نوع المحطة" : "Station Type"}
              </label>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{ background: "var(--bg-3)", color: "var(--text-primary)", borderColor: "var(--border-default)" }}
              >
                <option value="all">{isAr ? "كل الأنواع" : "All Types"}</option>
                {Object.entries(STATION_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── STATION GRID ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(station => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
          <Filter className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold text-lg">{isAr ? "لا توجد محطات تطابق الفلاتر" : "No stations match your filters"}</p>
          <button
            onClick={() => { setSpecialtyFilter("all"); setDifficultyFilter("all"); setTypeFilter("all"); }}
            className="mt-4 text-sm font-bold"
            style={{ color: "var(--color-medical-indigo)" }}
          >
            {isAr ? "إزالة الفلاتر" : "Clear Filters"}
          </button>
        </div>
      )}
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useSupabaseAuth();
  if (loading) return null;
  return <>{children}</>;
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <OSCEHome />
      </AuthGuard>
    </ErrorBoundary>
  );
}
