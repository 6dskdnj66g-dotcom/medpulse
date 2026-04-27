-- ═══════════════════════════════════════════════════════════════════════════
-- MEDPULSE AI — Q-BANK SCHEMA  (Migration v2 — April 2026)
-- Run this in Supabase Dashboard → SQL Editor.
-- Safe to run on an existing database — uses IF NOT EXISTS throughout.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- fuzzy search on stems


-- ─────────────────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.exam_type AS ENUM (
    'usmle_step1',
    'usmle_step2',
    'usmle_step3',
    'plab1',
    'plab2_osce'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.question_format AS ENUM (
    'single_best',          -- Standard MCQ (A-E)
    'extended_matching',    -- EMQ
    'ospe_station'          -- OSCE / PLAB 2
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cognitive_level AS ENUM (
    'recall',               -- Bloom L1: remember/define
    'application',          -- Bloom L3: apply/use
    'analysis'              -- Bloom L4-6: analyse/evaluate/create
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.station_type AS ENUM (
    'history',
    'examination',
    'communication',
    'data_interpretation',
    'practical'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.content_map_type AS ENUM (
    'ukmla',                -- UK Medical Licensing Assessment blueprint
    'nbme',                 -- USMLE / NBME content outline
    'gmc_plab'              -- GMC PLAB blueprint
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ─────────────────────────────────────────────────────────────────────────
-- 2. QUESTIONS  (master table — MCQ and OSCE share this row)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Classification
  exam_type         public.exam_type      NOT NULL,
  question_format   public.question_format NOT NULL,
  cognitive_level   public.cognitive_level NOT NULL DEFAULT 'application',

  -- Content
  specialty         TEXT        NOT NULL,
  system_body       TEXT        NOT NULL,             -- e.g. "cardiovascular"
  topic             TEXT        NOT NULL,             -- e.g. "heart failure"
  stem              TEXT        NOT NULL,             -- clinical vignette / station brief
  explanation       TEXT,                            -- teaching explanation shown after attempt
  media_url         TEXT,                            -- image / ECG / CXR URL (nullable)
  media_alt         TEXT,                            -- alt text for accessibility

  -- Difficulty (static seed; dynamically recalculated nightly)
  difficulty        SMALLINT    NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),

  -- Blueprint reference
  source_reference  TEXT,                            -- e.g. "UKMLA 2024 §3.2.1"

  -- Metadata
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  language          TEXT        NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  created_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_type      ON public.questions (exam_type);
CREATE INDEX IF NOT EXISTS idx_questions_specialty       ON public.questions (specialty);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty      ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_system          ON public.questions (system_body);
CREATE INDEX IF NOT EXISTS idx_questions_stem_trgm       ON public.questions USING GIN (stem gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select_active" ON public.questions
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "questions_admin_all" ON public.questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 3. QUESTION_OPTIONS  (MCQ answer choices — A through E)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_options (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID    NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  label         CHAR(1) NOT NULL CHECK (label IN ('A','B','C','D','E')),
  body          TEXT    NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,

  UNIQUE (question_id, label)
);

CREATE INDEX IF NOT EXISTS idx_options_question ON public.question_options (question_id);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options_select_all" ON public.question_options
  FOR SELECT USING (TRUE);
CREATE POLICY "options_admin_all" ON public.question_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 4. OSCE_STATIONS  (extends questions rows where exam_type = 'plab2_osce')
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.osce_stations (
  id                UUID         PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  station_type      public.station_type NOT NULL,
  time_minutes      SMALLINT     NOT NULL DEFAULT 8 CHECK (time_minutes > 0),

  -- Scenario participants
  patient_brief     TEXT         NOT NULL,    -- what the patient/actor is told
  actor_notes       TEXT,                     -- examiner / actor instructions
  candidate_brief   TEXT,                     -- what the candidate reads outside the door

  -- Structured marking — array of {domain, maxMarks, descriptors[]}
  -- e.g. [{"domain":"History Taking","maxMarks":6,"descriptors":["Presents complaint clearly",...]}]
  marking_criteria  JSONB        NOT NULL DEFAULT '[]',

  -- Pass mark (percentage) for this station
  pass_mark         SMALLINT     NOT NULL DEFAULT 60 CHECK (pass_mark BETWEEN 0 AND 100)
);

ALTER TABLE public.osce_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "osce_select_active" ON public.osce_stations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.questions q WHERE q.id = osce_stations.id AND q.is_active = TRUE)
  );
CREATE POLICY "osce_admin_all" ON public.osce_stations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 5. CONTENT_MAPS  (multi-standard blueprint mapping per question)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_maps (
  id            UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID              NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  map_type      public.content_map_type NOT NULL,
  domain        TEXT              NOT NULL,    -- e.g. "Cardiovascular"
  subdomain     TEXT,                          -- e.g. "Arrhythmias"
  blueprint_ref TEXT,                          -- e.g. "UKMLA §4.1.3"
  weight        NUMERIC(4,3)      NOT NULL DEFAULT 1.000
                  CHECK (weight > 0),

  UNIQUE (question_id, map_type, domain, subdomain)
);

CREATE INDEX IF NOT EXISTS idx_content_maps_question ON public.content_maps (question_id);
CREATE INDEX IF NOT EXISTS idx_content_maps_type     ON public.content_maps (map_type);

ALTER TABLE public.content_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_maps_select_all" ON public.content_maps FOR SELECT USING (TRUE);
CREATE POLICY "content_maps_admin_all"  ON public.content_maps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 6. USER_ATTEMPTS  (every attempt recorded for analytics + SRS)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id         UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,

  -- MCQ response
  selected_option_id  UUID        REFERENCES public.question_options(id) ON DELETE SET NULL,

  -- OSCE response (JSON transcript or plain text feedback)
  osce_transcript     TEXT,
  osce_ai_score       SMALLINT    CHECK (osce_ai_score BETWEEN 0 AND 100),

  -- Outcome
  is_correct          BOOLEAN     NOT NULL,
  time_taken_ms       INTEGER     NOT NULL CHECK (time_taken_ms >= 0),

  -- Self-reported confidence (1 = guessing, 5 = certain)
  confidence          SMALLINT    DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),

  -- Session context
  session_id          UUID,       -- links multiple attempts within one study session
  exam_mode           TEXT        DEFAULT 'practice' CHECK (exam_mode IN ('practice','timed','mock'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_user          ON public.user_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question      ON public.user_attempts (question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_question ON public.user_attempts (user_id, question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_attempted_at  ON public.user_attempts (attempted_at DESC);

ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_own" ON public.user_attempts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "attempts_admin_read" ON public.user_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 7. SRS_CARDS  (SM-2 spaced repetition — one row per user × question)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.srs_cards (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,

  -- SM-2 fields
  ease_factor     NUMERIC(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
  interval_days   SMALLINT    NOT NULL DEFAULT 1 CHECK (interval_days >= 1),
  repetitions     SMALLINT    NOT NULL DEFAULT 0 CHECK (repetitions >= 0),

  next_review_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,

  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_srs_user          ON public.srs_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_srs_next_review   ON public.srs_cards (user_id, next_review_at);

ALTER TABLE public.srs_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srs_own" ON public.srs_cards FOR ALL USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────
-- 8. DIFFICULTY_SNAPSHOTS  (nightly aggregation — drives dynamic difficulty)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.difficulty_snapshots (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  question_id     UUID        NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,

  attempt_count   INTEGER     NOT NULL DEFAULT 0,
  correct_count   INTEGER     NOT NULL DEFAULT 0,
  correct_rate    NUMERIC(5,4) NOT NULL DEFAULT 0 CHECK (correct_rate BETWEEN 0 AND 1),
  avg_time_ms     INTEGER     NOT NULL DEFAULT 0,

  -- Computed difficulty (1-5) stored for fast reads
  computed_difficulty SMALLINT NOT NULL DEFAULT 3 CHECK (computed_difficulty BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_question    ON public.difficulty_snapshots (question_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_computed_at ON public.difficulty_snapshots (computed_at DESC);

ALTER TABLE public.difficulty_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_select_all" ON public.difficulty_snapshots FOR SELECT USING (TRUE);
CREATE POLICY "snapshots_admin_all"  ON public.difficulty_snapshots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─────────────────────────────────────────────────────────────────────────
-- 9. NIGHTLY DIFFICULTY RECALCULATION FUNCTION
--    Called by a pg_cron job: SELECT cron.schedule('0 3 * * *', 'SELECT public.recalculate_difficulty()');
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_difficulty()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a new snapshot for each question with >= 5 attempts in the last 90 days
  INSERT INTO public.difficulty_snapshots
    (question_id, attempt_count, correct_count, correct_rate, avg_time_ms, computed_difficulty)
  SELECT
    ua.question_id,
    COUNT(*)                                          AS attempt_count,
    SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)   AS correct_count,
    AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) AS correct_rate,
    AVG(ua.time_taken_ms)::INTEGER                    AS avg_time_ms,
    -- Map correct_rate to difficulty 1-5 (inverse: easy = high rate)
    CASE
      WHEN AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) >= 0.80 THEN 1
      WHEN AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) >= 0.65 THEN 2
      WHEN AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) >= 0.50 THEN 3
      WHEN AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) >= 0.35 THEN 4
      ELSE 5
    END                                               AS computed_difficulty
  FROM public.user_attempts ua
  WHERE ua.attempted_at >= NOW() - INTERVAL '90 days'
  GROUP BY ua.question_id
  HAVING COUNT(*) >= 5;

  -- Propagate computed_difficulty back to questions table
  UPDATE public.questions q
  SET difficulty = ds.computed_difficulty,
      updated_at = NOW()
  FROM (
    SELECT DISTINCT ON (question_id)
      question_id, computed_difficulty
    FROM public.difficulty_snapshots
    ORDER BY question_id, computed_at DESC
  ) ds
  WHERE q.id = ds.question_id;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────
-- 10. HELPER VIEW  (question list with live difficulty + attempt stats)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_questions_enriched AS
SELECT
  q.*,
  ds.correct_rate,
  ds.attempt_count,
  ds.avg_time_ms,
  ds.computed_at AS difficulty_last_updated
FROM public.questions q
LEFT JOIN LATERAL (
  SELECT correct_rate, attempt_count, avg_time_ms, computed_at
  FROM public.difficulty_snapshots
  WHERE question_id = q.id
  ORDER BY computed_at DESC
  LIMIT 1
) ds ON TRUE;

COMMENT ON VIEW public.v_questions_enriched IS
  'Questions joined with the latest difficulty snapshot — use for Q-Bank browsing.';


-- ─────────────────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────────────────
