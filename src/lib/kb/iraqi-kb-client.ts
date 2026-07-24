/**
 * Client-side Supabase helpers for the Iraqi Knowledge Base.
 *
 * Reads follow the RLS defined in
 *   supabase/migrations/20260724000001_iraqi_knowledge_base.sql
 * — anon + authenticated can SELECT; only profiles.role = 'admin' can write.
 *
 * All fetchers return an { data, error } shape so callers can render
 * an empty state or an error message without throwing.
 */

import { supabase } from "@/core/database/supabase";

export type MaterialType = "pdf" | "video" | "link";
export type McqDifficulty = "easy" | "medium" | "hard";

export interface McqOption {
  label: string;    // e.g. "A", "B", "C", "D"
  text: string;
  text_ar?: string;
}

export interface IraqiMaterial {
  id: string;
  type: MaterialType;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  file_url: string;
  college_id: string | null;
  category: string | null;
  year: number | null;
  tags: string[] | null;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface IraqiMcq {
  id: string;
  question_text: string;
  question_text_ar: string | null;
  options: McqOption[];
  correct_answer: string;
  explanation: string | null;
  explanation_ar: string | null;
  source_college: string | null;
  year: number | null;
  specialty: string | null;
  difficulty: McqDifficulty | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchResult<T> {
  data: T[];
  error: string | null;
}

// ── Reads ────────────────────────────────────────────────────────────────

export async function fetchMaterials(options?: {
  collegeId?: string;
  type?: MaterialType;
  category?: string;
  limit?: number;
}): Promise<FetchResult<IraqiMaterial>> {
  let query = supabase
    .from("iraqi_materials")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.collegeId) query = query.eq("college_id", options.collegeId);
  if (options?.type)      query = query.eq("type", options.type);
  if (options?.category)  query = query.eq("category", options.category);
  if (options?.limit)     query = query.limit(options.limit);

  const { data, error } = await query;
  return {
    data: (data as IraqiMaterial[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function fetchMcqs(options?: {
  sourceCollege?: string;
  specialty?: string;
  difficulty?: McqDifficulty;
  limit?: number;
}): Promise<FetchResult<IraqiMcq>> {
  let query = supabase
    .from("iraqi_mcqs")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.sourceCollege) query = query.eq("source_college", options.sourceCollege);
  if (options?.specialty)     query = query.eq("specialty", options.specialty);
  if (options?.difficulty)    query = query.eq("difficulty", options.difficulty);
  if (options?.limit)         query = query.limit(options.limit);

  const { data, error } = await query;
  return {
    data: (data as IraqiMcq[]) ?? [],
    error: error?.message ?? null,
  };
}

// ── Writes (admin-only per RLS) ──────────────────────────────────────────

export type NewMaterial = Omit<IraqiMaterial, "id" | "created_at" | "updated_at" | "uploaded_by"> & {
  uploaded_by?: string | null;
};

export type NewMcq = Omit<IraqiMcq, "id" | "created_at" | "updated_at" | "uploaded_by"> & {
  uploaded_by?: string | null;
};

export async function insertMaterial(material: NewMaterial): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("iraqi_materials")
    .insert(material)
    .select("id")
    .single();
  return { id: (data as { id: string } | null)?.id ?? null, error: error?.message ?? null };
}

export async function insertMcq(mcq: NewMcq): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("iraqi_mcqs")
    .insert(mcq)
    .select("id")
    .single();
  return { id: (data as { id: string } | null)?.id ?? null, error: error?.message ?? null };
}

export async function deleteMaterial(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("iraqi_materials").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteMcq(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("iraqi_mcqs").delete().eq("id", id);
  return { error: error?.message ?? null };
}
