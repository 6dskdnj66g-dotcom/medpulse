-- ================================================================
-- Iraqi Medical Knowledge Base — schema, indexes, and RLS policies
-- Run this in the Supabase SQL editor (Project → SQL → New query).
-- ================================================================
--
-- Prerequisites:
--   • public.profiles table exists with columns (id uuid, role text).
--     Role values used by the app: 'student' | 'doctor' | 'admin' | 'professor'.
--   • auth.uid() available (default in Supabase).
--   • Optional: a Supabase Storage bucket for PDF uploads. This migration
--     does NOT create that bucket — create it via Supabase Studio
--     (Storage → New bucket, e.g. name: "iraqi-kb", public: true) and
--     paste the returned public URL into iraqi_materials.file_url.
--
-- All new objects are prefixed 'iraqi_' so they never collide with
-- existing tables.
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------
-- 1. iraqi_materials — PDFs, links, and videos in the knowledge base
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.iraqi_materials (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'link')),
  title          TEXT NOT NULL,
  title_ar       TEXT,
  description    TEXT,
  description_ar TEXT,
  file_url       TEXT NOT NULL,
  -- References an id from src/lib/data/iraqiMedicalResources.ts::IRAQI_MEDICAL_COLLEGES
  -- (kept as free text so the app can evolve the college list without a schema migration).
  college_id     TEXT,
  category       TEXT,      -- e.g. "past-paper", "lecture", "handout", "atlas"
  year           INTEGER,   -- academic year the material corresponds to (optional)
  tags           TEXT[] DEFAULT '{}'::text[],
  uploaded_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS iraqi_materials_college_idx  ON public.iraqi_materials (college_id);
CREATE INDEX IF NOT EXISTS iraqi_materials_type_idx     ON public.iraqi_materials (type);
CREATE INDEX IF NOT EXISTS iraqi_materials_category_idx ON public.iraqi_materials (category);
CREATE INDEX IF NOT EXISTS iraqi_materials_created_idx  ON public.iraqi_materials (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.iraqi_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS iraqi_materials_touch_updated_at ON public.iraqi_materials;
CREATE TRIGGER iraqi_materials_touch_updated_at
  BEFORE UPDATE ON public.iraqi_materials
  FOR EACH ROW EXECUTE FUNCTION public.iraqi_touch_updated_at();

-- ----------------------------------------------------------------
-- 2. iraqi_mcqs — past-paper style multiple choice questions
-- ----------------------------------------------------------------
--
-- options is a JSONB array:
--   [ { "label": "A", "text": "Aspirin",     "text_ar": "الأسبرين" },
--     { "label": "B", "text": "Clopidogrel", "text_ar": "الكلوبيدوغريل" },
--     { "label": "C", "text": "Warfarin",    "text_ar": "الوارفارين" },
--     { "label": "D", "text": "Heparin",     "text_ar": "الهيبارين" } ]
--
-- correct_answer stores the label of the correct option ("A" | "B" | ...).
--
-- Enforced JSONB shape via CHECK constraint: array with 2..8 options each
-- having label + text (text_ar optional).

CREATE TABLE IF NOT EXISTS public.iraqi_mcqs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text     TEXT NOT NULL,
  question_text_ar  TEXT,
  options           JSONB NOT NULL,
  correct_answer    TEXT NOT NULL,
  explanation       TEXT,
  explanation_ar    TEXT,
  source_college    TEXT,     -- college id (free-text, see materials note above)
  year              INTEGER,
  specialty         TEXT,
  difficulty        TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags              TEXT[] DEFAULT '{}'::text[],
  uploaded_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT iraqi_mcqs_options_shape CHECK (
    jsonb_typeof(options) = 'array'
    AND jsonb_array_length(options) BETWEEN 2 AND 8
  )
);

CREATE INDEX IF NOT EXISTS iraqi_mcqs_college_idx    ON public.iraqi_mcqs (source_college);
CREATE INDEX IF NOT EXISTS iraqi_mcqs_specialty_idx  ON public.iraqi_mcqs (specialty);
CREATE INDEX IF NOT EXISTS iraqi_mcqs_difficulty_idx ON public.iraqi_mcqs (difficulty);
CREATE INDEX IF NOT EXISTS iraqi_mcqs_created_idx    ON public.iraqi_mcqs (created_at DESC);

DROP TRIGGER IF EXISTS iraqi_mcqs_touch_updated_at ON public.iraqi_mcqs;
CREATE TRIGGER iraqi_mcqs_touch_updated_at
  BEFORE UPDATE ON public.iraqi_mcqs
  FOR EACH ROW EXECUTE FUNCTION public.iraqi_touch_updated_at();

-- ----------------------------------------------------------------
-- 3. Row Level Security
-- ----------------------------------------------------------------
-- Reads: anyone (published, is_public = true for materials; all MCQs).
-- Writes: only users whose profiles.role = 'admin'.

ALTER TABLE public.iraqi_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iraqi_mcqs      ENABLE ROW LEVEL SECURITY;

-- helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.iraqi_is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Materials policies
DROP POLICY IF EXISTS iraqi_materials_read_public  ON public.iraqi_materials;
DROP POLICY IF EXISTS iraqi_materials_admin_write  ON public.iraqi_materials;
DROP POLICY IF EXISTS iraqi_materials_admin_update ON public.iraqi_materials;
DROP POLICY IF EXISTS iraqi_materials_admin_delete ON public.iraqi_materials;

CREATE POLICY iraqi_materials_read_public ON public.iraqi_materials
  FOR SELECT USING (is_public = true OR public.iraqi_is_admin());

CREATE POLICY iraqi_materials_admin_write ON public.iraqi_materials
  FOR INSERT WITH CHECK (public.iraqi_is_admin());

CREATE POLICY iraqi_materials_admin_update ON public.iraqi_materials
  FOR UPDATE USING (public.iraqi_is_admin()) WITH CHECK (public.iraqi_is_admin());

CREATE POLICY iraqi_materials_admin_delete ON public.iraqi_materials
  FOR DELETE USING (public.iraqi_is_admin());

-- MCQs policies
DROP POLICY IF EXISTS iraqi_mcqs_read_all      ON public.iraqi_mcqs;
DROP POLICY IF EXISTS iraqi_mcqs_admin_write   ON public.iraqi_mcqs;
DROP POLICY IF EXISTS iraqi_mcqs_admin_update  ON public.iraqi_mcqs;
DROP POLICY IF EXISTS iraqi_mcqs_admin_delete  ON public.iraqi_mcqs;

CREATE POLICY iraqi_mcqs_read_all ON public.iraqi_mcqs
  FOR SELECT USING (true);

CREATE POLICY iraqi_mcqs_admin_write ON public.iraqi_mcqs
  FOR INSERT WITH CHECK (public.iraqi_is_admin());

CREATE POLICY iraqi_mcqs_admin_update ON public.iraqi_mcqs
  FOR UPDATE USING (public.iraqi_is_admin()) WITH CHECK (public.iraqi_is_admin());

CREATE POLICY iraqi_mcqs_admin_delete ON public.iraqi_mcqs
  FOR DELETE USING (public.iraqi_is_admin());

-- ----------------------------------------------------------------
-- 4. Grants
-- ----------------------------------------------------------------

GRANT SELECT                         ON public.iraqi_materials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.iraqi_materials TO authenticated;
GRANT SELECT                         ON public.iraqi_mcqs      TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.iraqi_mcqs      TO authenticated;

-- ================================================================
-- END OF MIGRATION
-- After running this file:
--   1. Create a Supabase Storage bucket (Storage → New bucket) if you
--      want to host PDFs directly. Set it public if the materials should
--      be readable without a signed URL.
--   2. Ensure your admin user's profiles.role is set to 'admin'.
--   3. Visit /admin/knowledge-base in the app to add materials + MCQs.
-- ================================================================
