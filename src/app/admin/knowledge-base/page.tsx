"use client";

/**
 * Admin CMS for the Iraqi Knowledge Base.
 *
 * Routes:
 *   - Materials tab: create / list / delete iraqi_materials rows
 *   - MCQs tab:      create / list / delete iraqi_mcqs rows
 *
 * Access control:
 *   - Client-side: this page redirects non-admins to /dashboard.
 *   - Server-side (source of truth): Supabase RLS policies (defined in
 *     supabase/migrations/20260724000001_iraqi_knowledge_base.sql) reject
 *     any INSERT/UPDATE/DELETE from a user whose profiles.role is not 'admin'.
 *
 * PDF hosting model:
 *   PDFs are NOT uploaded through this form (browser-side file upload to
 *   Supabase Storage requires bucket + policy setup that varies per install).
 *   Instead, the admin uploads the file into their Supabase Storage bucket
 *   via the Supabase dashboard, then pastes the resulting public URL here.
 *   This is called out explicitly in the UI.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Loader2, Plus, Trash2, ExternalLink,
  BookMarked, FileText, HelpCircle, AlertCircle, Info, CheckCircle,
} from "lucide-react";
import { useSupabaseAuth } from "@/core/auth/SupabaseAuthContext";
import {
  fetchMaterials,
  fetchMcqs,
  insertMaterial,
  insertMcq,
  deleteMaterial,
  deleteMcq,
  type IraqiMaterial,
  type IraqiMcq,
  type McqOption,
  type MaterialType,
  type McqDifficulty,
} from "@/lib/kb/iraqi-kb-client";
import { IRAQI_MEDICAL_COLLEGES } from "@/lib/data/iraqiMedicalResources";

type TabKey = "materials" | "mcqs";

export default function KnowledgeBaseAdminPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useSupabaseAuth();

  const [tab, setTab] = useState<TabKey>("materials");

  // Access control — server-side enforcement is via RLS; this is UX only.
  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [authLoading, user, profile, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-medical-indigo)] animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-6 max-w-md text-center">
          <ShieldCheck className="w-8 h-8 text-rose-500 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-extrabold text-[var(--text-primary)]">Admin access required</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[12px] font-bold transition-colors mb-4 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        Back to Admin
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-medical-indigo)]/10 border border-[var(--color-medical-indigo)]/20 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-[var(--color-medical-indigo)]" aria-hidden="true" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
            Content management
          </p>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] leading-tight">
          National Iraqi Medical Knowledge Base
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium max-w-3xl leading-relaxed">
          Manage the materials and past-paper questions surfaced to students. All writes are gated
          by Supabase RLS — non-admin users cannot insert or delete records even if they craft the
          request manually.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] mb-6" role="tablist" aria-label="Knowledge base content">
        <button
          role="tab"
          aria-selected={tab === "materials"}
          onClick={() => setTab("materials")}
          className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${
            tab === "materials"
              ? "text-[var(--color-medical-indigo)] border-[var(--color-medical-indigo)]"
              : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-primary)]"
          }`}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          Materials
        </button>
        <button
          role="tab"
          aria-selected={tab === "mcqs"}
          onClick={() => setTab("mcqs")}
          className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${
            tab === "mcqs"
              ? "text-[var(--color-medical-indigo)] border-[var(--color-medical-indigo)]"
              : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-primary)]"
          }`}
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
          Past-paper MCQs
        </button>
      </div>

      {tab === "materials" ? <MaterialsPanel userId={user.id} /> : <McqsPanel userId={user.id} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Materials panel
// ═══════════════════════════════════════════════════════════════════════

function MaterialsPanel({ userId }: { userId: string }) {
  const [materials, setMaterials] = useState<IraqiMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "pdf" as MaterialType,
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    file_url: "",
    college_id: "",
    category: "",
    year: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await fetchMaterials();
    setMaterials(data);
    setLoadError(error);
    setLoading(false);
  }, []);

  // Legitimate initial fetch — the effect exists so React can trigger it once on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.title.trim() || !form.file_url.trim()) {
      setFormError("Title and file URL are required.");
      return;
    }
    if (!/^https?:\/\//i.test(form.file_url.trim())) {
      setFormError("file_url must start with http:// or https://.");
      return;
    }
    setSubmitting(true);
    const yearNum = form.year ? Number(form.year) : null;
    const { error } = await insertMaterial({
      type: form.type,
      title: form.title.trim(),
      title_ar: form.title_ar.trim() || null,
      description: form.description.trim() || null,
      description_ar: form.description_ar.trim() || null,
      file_url: form.file_url.trim(),
      college_id: form.college_id || null,
      category: form.category.trim() || null,
      year: Number.isFinite(yearNum ?? NaN) ? yearNum : null,
      tags: [],
      is_public: true,
      uploaded_by: userId,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    setFormSuccess("Material added.");
    setForm({
      type: "pdf", title: "", title_ar: "", description: "", description_ar: "",
      file_url: "", college_id: "", category: "", year: "",
    });
    await load();
  }

  async function remove(id: string) {
    const ok = confirm("Delete this material? This cannot be undone.");
    if (!ok) return;
    const { error } = await deleteMaterial(id);
    if (error) {
      alert(`Delete failed: ${error}`);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      {/* Upload note */}
      <div className="rounded-2xl border border-[var(--color-medical-indigo)]/20 bg-[var(--color-medical-indigo)]/5 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[var(--color-medical-indigo)] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-[12px] text-[var(--text-secondary)] font-medium leading-relaxed">
          <p className="mb-1 font-extrabold text-[var(--text-primary)]">How PDF hosting works</p>
          <p>
            Upload the PDF file into your Supabase Storage bucket via the Supabase dashboard,
            then paste the resulting public URL into <code className="font-mono">file_url</code> below.
            Only add materials you have the legal right to host — do not upload copyrighted textbooks.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Add material</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Type" required>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MaterialType }))}
              className={inputClass}
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </FormField>

          <FormField label="Category" hint="e.g. past-paper, lecture, handout">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={inputClass}
              placeholder="past-paper"
            />
          </FormField>

          <FormField label="Title (English)" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="Baghdad — Cardiology past paper 2023"
              required
            />
          </FormField>

          <FormField label="Title (Arabic)">
            <input
              type="text"
              value={form.title_ar}
              onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
              className={inputClass}
              dir="rtl"
              placeholder="بغداد — امتحان أمراض القلب 2023"
            />
          </FormField>

          <FormField label="College">
            <select
              value={form.college_id}
              onChange={(e) => setForm((f) => ({ ...f, college_id: e.target.value }))}
              className={inputClass}
            >
              <option value="">— None —</option>
              {IRAQI_MEDICAL_COLLEGES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Academic year">
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className={inputClass}
              placeholder="2024"
              min={1900}
              max={2100}
            />
          </FormField>

          <FormField label="File URL" required hint="Public URL to the PDF / video / resource" className="md:col-span-2">
            <input
              type="url"
              value={form.file_url}
              onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
              className={inputClass + " font-mono text-[12px]"}
              placeholder="https://<project>.supabase.co/storage/v1/object/public/iraqi-kb/..."
              required
            />
          </FormField>

          <FormField label="Description (English)" className="md:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
              rows={2}
            />
          </FormField>

          <FormField label="Description (Arabic)" className="md:col-span-2">
            <textarea
              value={form.description_ar}
              onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
              className={inputClass}
              rows={2}
              dir="rtl"
            />
          </FormField>
        </div>

        {formError && <FormError message={formError} />}
        {formSuccess && <FormSuccess message={formSuccess} />}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-medical-indigo)] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Plus className="w-3.5 h-3.5" aria-hidden="true" />}
            Add material
          </button>
        </div>
      </form>

      {/* List */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
          Existing materials ({materials.length})
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-medical-indigo)]" aria-hidden="true" /></div>
        ) : loadError ? (
          <FormError message={loadError} />
        ) : materials.length === 0 ? (
          <EmptyRow message="No materials yet. Add the first one above." />
        ) : (
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-extrabold text-[var(--text-primary)] truncate">{m.title}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-0.5 truncate">
                    {m.type.toUpperCase()} · {m.college_id ?? "no college"} · {m.category ?? "uncategorised"}
                    {m.year ? ` · ${m.year}` : ""}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-mono mt-0.5 truncate">{m.file_url}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[var(--bg-3)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <button
                    onClick={() => void remove(m.id)}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 hover:bg-rose-500/20"
                    aria-label={`Delete ${m.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MCQs panel
// ═══════════════════════════════════════════════════════════════════════

function McqsPanel({ userId }: { userId: string }) {
  const [mcqs, setMcqs] = useState<IraqiMcq[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initialOptions: McqOption[] = [
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ];

  const [form, setForm] = useState({
    question_text: "",
    question_text_ar: "",
    options: initialOptions,
    correct_answer: "A",
    explanation: "",
    explanation_ar: "",
    source_college: "",
    year: "",
    specialty: "",
    difficulty: "medium" as McqDifficulty,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await fetchMcqs();
    setMcqs(data);
    setLoadError(error);
    setLoading(false);
  }, []);

  // Legitimate initial fetch — the effect exists so React can trigger it once on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function updateOption(idx: number, field: "text" | "text_ar", value: string) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.question_text.trim()) { setFormError("Question text is required."); return; }
    const validOptions = form.options.filter((o) => o.text.trim().length > 0);
    if (validOptions.length < 2) { setFormError("At least two options with text are required."); return; }
    if (!validOptions.find((o) => o.label === form.correct_answer)) {
      setFormError("Correct answer must match one of the option labels that has text.");
      return;
    }
    setSubmitting(true);
    const yearNum = form.year ? Number(form.year) : null;
    const { error } = await insertMcq({
      question_text: form.question_text.trim(),
      question_text_ar: form.question_text_ar.trim() || null,
      options: validOptions.map((o) => ({
        label: o.label,
        text: o.text.trim(),
        text_ar: o.text_ar?.trim() || undefined,
      })),
      correct_answer: form.correct_answer,
      explanation: form.explanation.trim() || null,
      explanation_ar: form.explanation_ar.trim() || null,
      source_college: form.source_college || null,
      year: Number.isFinite(yearNum ?? NaN) ? yearNum : null,
      specialty: form.specialty.trim() || null,
      difficulty: form.difficulty,
      tags: [],
      uploaded_by: userId,
    });
    setSubmitting(false);
    if (error) { setFormError(error); return; }
    setFormSuccess("Question added.");
    setForm({
      question_text: "", question_text_ar: "",
      options: initialOptions.map((o) => ({ ...o })),
      correct_answer: "A", explanation: "", explanation_ar: "",
      source_college: "", year: "", specialty: "", difficulty: "medium",
    });
    await load();
  }

  async function remove(id: string) {
    const ok = confirm("Delete this question? This cannot be undone.");
    if (!ok) return;
    const { error } = await deleteMcq(id);
    if (error) { alert(`Delete failed: ${error}`); return; }
    await load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-[var(--color-medical-indigo)]" aria-hidden="true" />
          <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">Add MCQ</p>
        </div>

        <FormField label="Question (English)" required>
          <textarea
            value={form.question_text}
            onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
            className={inputClass}
            rows={3}
            required
          />
        </FormField>

        <FormField label="Question (Arabic)">
          <textarea
            value={form.question_text_ar}
            onChange={(e) => setForm((f) => ({ ...f, question_text_ar: e.target.value }))}
            className={inputClass}
            rows={3}
            dir="rtl"
          />
        </FormField>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Options</p>
          <div className="space-y-2">
            {form.options.map((opt, idx) => (
              <div key={opt.label} className="flex items-start gap-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black flex-shrink-0 ${
                  form.correct_answer === opt.label
                    ? "bg-emerald-500 text-white"
                    : "bg-[var(--bg-3)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}>
                  {opt.label}
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(idx, "text", e.target.value)}
                    className={inputClass}
                    placeholder={`Option ${opt.label} (English)`}
                  />
                  <input
                    type="text"
                    value={opt.text_ar ?? ""}
                    onChange={(e) => updateOption(idx, "text_ar", e.target.value)}
                    className={inputClass}
                    placeholder={`الخيار ${opt.label} (Arabic)`}
                    dir="rtl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormField label="Correct answer label" required>
          <select
            value={form.correct_answer}
            onChange={(e) => setForm((f) => ({ ...f, correct_answer: e.target.value }))}
            className={inputClass}
          >
            {form.options.map((o) => (
              <option key={o.label} value={o.label}>{o.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Explanation (English)">
          <textarea
            value={form.explanation}
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
            className={inputClass}
            rows={3}
          />
        </FormField>

        <FormField label="Explanation (Arabic)">
          <textarea
            value={form.explanation_ar}
            onChange={(e) => setForm((f) => ({ ...f, explanation_ar: e.target.value }))}
            className={inputClass}
            rows={3}
            dir="rtl"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FormField label="Source college">
            <select
              value={form.source_college}
              onChange={(e) => setForm((f) => ({ ...f, source_college: e.target.value }))}
              className={inputClass}
            >
              <option value="">— None —</option>
              {IRAQI_MEDICAL_COLLEGES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Specialty">
            <input
              type="text"
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              className={inputClass}
              placeholder="Cardiology"
            />
          </FormField>

          <FormField label="Year">
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className={inputClass}
              placeholder="2024"
              min={1900}
              max={2100}
            />
          </FormField>

          <FormField label="Difficulty" className="md:col-span-3">
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as McqDifficulty }))}
              className={inputClass}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </FormField>
        </div>

        {formError && <FormError message={formError} />}
        {formSuccess && <FormSuccess message={formSuccess} />}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-medical-indigo)] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[var(--color-medical-indigo)]/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Plus className="w-3.5 h-3.5" aria-hidden="true" />}
            Add MCQ
          </button>
        </div>
      </form>

      {/* List */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
          Existing MCQs ({mcqs.length})
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-medical-indigo)]" aria-hidden="true" /></div>
        ) : loadError ? (
          <FormError message={loadError} />
        ) : mcqs.length === 0 ? (
          <EmptyRow message="No MCQs yet. Add the first one above." />
        ) : (
          <div className="space-y-2">
            {mcqs.map((q) => (
              <div key={q.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-2)] p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
                    {q.question_text}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1 flex items-center gap-2 flex-wrap">
                    <span className="uppercase tracking-widest">answer: {q.correct_answer}</span>
                    {q.specialty && <span>· {q.specialty}</span>}
                    {q.source_college && <span>· {q.source_college}</span>}
                    {q.year && <span>· {q.year}</span>}
                    {q.difficulty && <span>· {q.difficulty}</span>}
                  </p>
                </div>
                <button
                  onClick={() => void remove(q.id)}
                  className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 flex-shrink-0"
                  aria-label="Delete MCQ"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Small shared UI
// ═══════════════════════════════════════════════════════════════════════

const inputClass =
  "w-full px-3 py-2 rounded-xl bg-[var(--bg-1)] border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-medical-indigo)]/25";

function FormField({
  label, required, hint, children, className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className ?? ""}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[10px] text-[var(--text-tertiary)] font-medium">{hint}</span>}
    </label>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-[12px] text-rose-600 dark:text-rose-400 font-medium">{message}</p>
    </div>
  );
}

function FormSuccess({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">{message}</p>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-2)] p-6 text-center">
      <p className="text-[12px] text-[var(--text-tertiary)] font-medium">{message}</p>
    </div>
  );
}
