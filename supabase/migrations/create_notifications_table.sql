-- ═══════════════════════════════════════════════════════════════════
-- MedPulse AI — Notifications Table
-- Run this in Supabase SQL Editor → Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info', 'reminder', 'update', 'achievement')),
  icon        TEXT DEFAULT '🔔',
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- RLS: users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert (for system-generated notifications)
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- Optional: Insert welcome notification for all existing users
-- ═══════════════════════════════════════════════════════════════════
-- INSERT INTO notifications (user_id, title, message, type, icon)
-- SELECT id, 'مرحباً في MedPulse AI 🩺', 'منصتك السريرية الذكية جاهزة. استكشف أدوات الذكاء الاصطناعي الطبية!', 'info', '🩺'
-- FROM auth.users;
