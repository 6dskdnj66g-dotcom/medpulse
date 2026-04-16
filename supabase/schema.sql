-- ═══════════════════════════════════════════════════════════════
-- MEDPULSE AI — SUPABASE DATABASE SCHEMA v1.0
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE (User accounts & info)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'student' CHECK (role IN ('student', 'doctor', 'admin', 'professor')),
  specialty     TEXT,
  institution   TEXT,
  country       TEXT DEFAULT 'Not specified',
  xp            INTEGER DEFAULT 0 NOT NULL,
  level         INTEGER DEFAULT 1 NOT NULL,
  streak_days   INTEGER DEFAULT 0 NOT NULL,
  last_active   DATE DEFAULT CURRENT_DATE,
  is_active     BOOLEAN DEFAULT TRUE,
  bio           TEXT
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. MEDICAL SOURCES TABLE (Full registry — 200+ sources)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_sources (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name           TEXT NOT NULL,
  abbreviation   TEXT,
  url            TEXT,
  type           TEXT NOT NULL CHECK (type IN ('journal', 'database', 'guideline', 'textbook', 'organization', 'database_arab', 'journal_arab')),
  specialty      TEXT,
  impact_factor  DECIMAL(6,2),
  region         TEXT DEFAULT 'global' CHECK (region IN ('global', 'arab', 'europe', 'usa', 'asia', 'mena')),
  language       TEXT DEFAULT 'english' CHECK (language IN ('english', 'arabic', 'bilingual')),
  open_access    BOOLEAN DEFAULT FALSE,
  is_verified    BOOLEAN DEFAULT TRUE,
  is_active      BOOLEAN DEFAULT TRUE,
  description    TEXT,
  tags           TEXT[],
  publisher      TEXT,
  founded_year   INTEGER,
  bookmark_count INTEGER DEFAULT 0
);

-- Public read access for sources
ALTER TABLE public.medical_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read medical sources" ON public.medical_sources FOR SELECT USING (true);
CREATE POLICY "Admins can manage sources" ON public.medical_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_sources_name ON public.medical_sources USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_sources_type ON public.medical_sources (type);
CREATE INDEX IF NOT EXISTS idx_sources_specialty ON public.medical_sources (specialty);
CREATE INDEX IF NOT EXISTS idx_sources_region ON public.medical_sources (region);

-- ─────────────────────────────────────────────────────────────
-- 3. USER PROGRESS TABLE (Learning sessions & scores)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module      TEXT NOT NULL CHECK (module IN ('usmle', 'simulator', 'encyclopedia', 'professors', 'mdt', 'calculators', 'drug-checker', 'ecg', 'notes', 'flashcards')),
  score       INTEGER DEFAULT 0,
  total       INTEGER DEFAULT 0,
  xp_earned   INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  specialty   TEXT,
  difficulty  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON public.user_progress (module);

-- ─────────────────────────────────────────────────────────────
-- 4. VISITOR LOGS TABLE (Analytics for all visitors)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  session_id   TEXT,
  page         TEXT,
  referrer     TEXT,
  country      TEXT,
  city         TEXT,
  device_type  TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser      TEXT,
  is_registered BOOLEAN DEFAULT FALSE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duration_seconds INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0
);

-- Admin only for visitor logs
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert visitor logs" ON public.visitor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read visitor logs" ON public.visitor_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own visit logs" ON public.visitor_logs FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_visitor_session ON public.visitor_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_date ON public.visitor_logs (created_at);

-- ─────────────────────────────────────────────────────────────
-- 5. USER BOOKMARKS TABLE (Saved medical sources)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source_id  UUID REFERENCES public.medical_sources(id) ON DELETE CASCADE NOT NULL,
  notes      TEXT,
  UNIQUE(user_id, source_id)
);

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 6. PLATFORM ANALYTICS VIEW (Admin dashboard)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.platform_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) AS total_registered_users,
  (SELECT COUNT(*) FROM public.profiles WHERE last_active = CURRENT_DATE) AS active_today,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '7 days') AS new_this_week,
  (SELECT COUNT(*) FROM public.visitor_logs WHERE created_at > NOW() - INTERVAL '24 hours') AS visits_today,
  (SELECT COUNT(*) FROM public.visitor_logs WHERE created_at > NOW() - INTERVAL '7 days') AS visits_this_week,
  (SELECT COUNT(*) FROM public.visitor_logs WHERE is_registered = false AND created_at > NOW() - INTERVAL '7 days') AS guest_visits_this_week,
  (SELECT COUNT(*) FROM public.medical_sources) AS total_medical_sources,
  (SELECT COUNT(*) FROM public.user_progress) AS total_sessions_completed,
  (SELECT SUM(xp_earned) FROM public.user_progress) AS total_xp_awarded,
  (SELECT AVG(score::DECIMAL / NULLIF(total, 0) * 100) FROM public.user_progress WHERE total > 0) AS avg_accuracy_pct;

-- ─────────────────────────────────────────────────────────────
-- 7. HELPER: Update profile XP when progress added
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    xp = xp + NEW.xp_earned,
    level = GREATEST(1, FLOOR(LOG(2, GREATEST(1, xp + NEW.xp_earned) / 50)) + 1)::INTEGER,
    last_active = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_progress_insert
  AFTER INSERT ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp();

-- ─────────────────────────────────────────────────────────────
-- 8. SEED: Insert all global medical sources
-- (Run the seeder API after setting up)
-- ─────────────────────────────────────────────────────────────
-- Placeholder — seeder will be run via /api/admin/seed-sources endpoint
