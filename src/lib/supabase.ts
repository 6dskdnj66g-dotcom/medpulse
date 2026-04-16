import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Browser Client (for client components) ─────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── Server Client (for API routes) ─────────────────────────────────
export function createSupabaseServerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });
}

// ── Admin Client (service role — only on server) ────────────────────
export function createSupabaseAdmin() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── Types ───────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'student' | 'doctor' | 'admin' | 'professor';
  specialty?: string;
  institution?: string;
  country?: string;
  xp: number;
  level: number;
  streak_days: number;
  last_active: string;
  bio?: string;
}

export interface MedicalSourceDB {
  id: string;
  name: string;
  abbreviation?: string;
  url?: string;
  type: string;
  specialty?: string;
  impact_factor?: number;
  region?: string;
  language?: string;
  open_access?: boolean;
  is_verified?: boolean;
  description?: string;
  tags?: string[];
  publisher?: string;
  bookmark_count?: number;
}

export interface UserProgress {
  id: string;
  created_at: string;
  user_id: string;
  module: string;
  score: number;
  total: number;
  xp_earned: number;
  duration_seconds?: number;
  specialty?: string;
  difficulty?: string;
  metadata?: Record<string, unknown>;
}

export interface VisitorLog {
  id?: string;
  session_id: string;
  page: string;
  referrer?: string;
  country?: string;
  device_type?: string;
  browser?: string;
  is_registered?: boolean;
  user_id?: string;
}

export interface PlatformStats {
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
