"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/components/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { exportMedicalReport } from "@/lib/pdfExport";
import {
  FolderHeart, FileText, Activity, Calculator, Clock,
  Search, Download, Trash2,
  ChevronRight, ArrowRight, Loader2, Database, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ClinicalRecord {
  id: string;
  created_at: string;
  type: "soap_note" | "ecg_report" | "calc_result" | "translator_output";
  title: string;
  content: Record<string, unknown>;
  specialty?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  soap_note: { label: "ملاحظات SOAP", icon: FileText, color: "text-teal-500", bgColor: "bg-teal-500/10" },
  ecg_report: { label: "تقرير ECG", icon: Activity, color: "text-rose-500", bgColor: "bg-rose-500/10" },
  calc_result: { label: "نتيجة حاسبة", icon: Calculator, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  translator_output: { label: "ترجمة طبية", icon: Database, color: "text-amber-500", bgColor: "bg-amber-500/10" },
};

const s = (v: unknown): string => (v == null ? '' : String(v));

export default function ClinicalRecordsPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinical_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRecords(data as ClinicalRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) fetchRecords();
  }, [user]);

  async function deleteRecord(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    const { error } = await supabase.from("clinical_records").delete().eq("id", id);
    if (!error) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  }

  const filtered = records.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></div>;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-10 mt-20 text-center premium-card">
        <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">هذه الصفحة تتطلب تسجيل الدخول</h2>
        <p className="text-[var(--text-tertiary)] mb-8">يجب عليك تسجيل الدخول للوصول إلى محفظتك السريرية وسجلاتك المحفوظة.</p>
        <Link href="/auth/login" className="btn-premium bg-indigo-600 inline-flex">تسجيل الدخول الآن</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 w-full animate-in fade-in zoom-in-95 duration-700 relative">
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] bg-[var(--color-medical-indigo)]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[40%] h-[40%] bg-[var(--color-vital-cyan)]/5 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/20">
            <FolderHeart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] font-arabic">المحفظة السريرية</h1>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">سجل كامل بجميع التقارير، الحسابات، والملاحظات التي قمت بحفظها</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <Database className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black text-indigo-700">{records.length} سجل محفوظ</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Sidebar: List & Filters */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Controls */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]/70" />
              <input 
                type="text" 
                placeholder="ابحث في السجلات..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-0)] border border-[var(--border-subtle)] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["all", "soap_note", "ecg_report", "calc_result"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    filter === t 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-[var(--bg-0)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:bg-slate-50"
                  }`}
                >
                  {t === "all" ? "الكل" : TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-[var(--bg-2)] animate-pulse rounded-2xl" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-tertiary)]/70 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <FolderHeart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-bold">لا توجد سجلات بعد</p>
                <p className="text-xs">ابدأ باستخدام الأدوات السريرية واحفظ نتائجك</p>
              </div>
            ) : (
              filtered.map(record => {
                const config = TYPE_CONFIG[record.type] || TYPE_CONFIG.soap_note;
                const Icon = config.icon;
                const active = selectedRecord?.id === record.id;
                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all group ${
                      active 
                      ? "bg-indigo-500/5 border-indigo-500 shadow-md" 
                      : "bg-[var(--bg-0)] border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-black truncate ${active ? "text-indigo-600" : "text-[var(--text-primary)]"}`}>
                          {record.title || "بدون عنوان"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-[var(--text-tertiary)]/70">
                          <Clock className="w-3 h-3" />
                          {new Date(record.created_at).toLocaleDateString()}
                          <span>•</span>
                          <span className="uppercase">{config.label}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${active ? "rotate-90 text-indigo-500" : "group-hover:translate-x-1"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content: Record Detail */}
        <div className="lg:col-span-7 xl:col-span-8">
          {selectedRecord ? (
            <div id="record-content" className="medpulse-card glass level-1 p-0 flex flex-col h-full min-h-[600px] overflow-hidden">
              {/* Detail Header */}
              <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${TYPE_CONFIG[selectedRecord.type].bgColor} flex items-center justify-center`}>
                    {(() => {
                      const Icon = TYPE_CONFIG[selectedRecord.type].icon;
                      return <Icon className={`w-6 h-6 ${TYPE_CONFIG[selectedRecord.type].color}`} />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[var(--text-primary)] leading-tight">{selectedRecord.title}</h2>
                    <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">
                      {TYPE_CONFIG[selectedRecord.type].label} • {new Date(selectedRecord.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteRecord(selectedRecord.id)}
                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                {selectedRecord.type === "soap_note" && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s(selectedRecord.content?.note)}</ReactMarkdown>
                    <div className="mt-10 pt-6 border-t border-[var(--border-subtle)]">
                      <h4 className="text-xs font-black uppercase text-[var(--text-tertiary)]/70 mb-2">Original Clinical Input:</h4>
                      <p className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-[var(--text-tertiary)] font-bold italic line-clamp-4">
                        {s(selectedRecord.content?.input)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRecord.type === "ecg_report" && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s(selectedRecord.content?.report)}</ReactMarkdown>
                    <div className="mt-8 p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                      <p className="text-[10px] font-black uppercase text-rose-500 mb-1">Clinical Findings Provided:</p>
                      <p className="text-xs text-slate-600 dark:text-[var(--text-tertiary)]/70 font-bold">{s(selectedRecord.content?.findings)}</p>
                    </div>
                  </div>
                )}

                {selectedRecord.type === "calc_result" && (
                  <div className="space-y-8">
                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-2">{s(selectedRecord.content?.label)}</p>
                      <p className="text-6xl font-black text-[var(--text-primary)] mb-4">{s(selectedRecord.content?.score)}</p>
                      <p className="text-lg font-bold text-[var(--text-secondary)]">{s(selectedRecord.content?.risk)}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)]/70 mb-4">Input Parameters:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries((selectedRecord.content?.inputs as Record<string, unknown>) || {}).map(([key, val]) => (
                          <div key={key} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)]/70 truncate mr-2">{key.replace(/_/g, ' ')}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${val ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-[var(--text-tertiary)]'}`}>
                              {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : val as string}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Footer */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-[var(--border-subtle)] flex justify-between items-center">
                <p className="text-[10px] font-black text-[var(--text-tertiary)]/70 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" />
                  Clinical Educational Use Only — MedPulse AI v4.0
                </p>
                <button 
                  onClick={() => selectedRecord && exportMedicalReport("record-content", { title: selectedRecord.title, filename: `MedPulse_Record_${selectedRecord.id.slice(0, 8)}` })}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                >
                  <Download className="w-4 h-4" />
                  تحميل تقرير PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-20 border-2 border-dashed border-[var(--border-subtle)]/50 rounded-3xl min-h-[600px]">
              <div className="w-20 h-20 bg-[var(--bg-1)] bg-opacity-50 rounded-full flex items-center justify-center mb-6">
                <ArrowRight className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-black text-xl mb-2 text-[var(--text-tertiary)]/70">اختر سجلاً لعرض التفاصيل</p>
              <p className="text-sm text-center">سيتم عرض نتائج الحسابات والتقارير المحفوظة هنا<br />بشكل منظم واحترافي.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
