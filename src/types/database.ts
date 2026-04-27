/* eslint-disable @typescript-eslint/no-explicit-any */
﻿export type ExamType = 'usmle_step1' | 'usmle_step2' | 'usmle_step3' | 'plab1' | 'plab2_osce';
export type QuestionFormat = 'single_best' | 'extended_matching' | 'ospe_station';
export type CognitiveLevel = 'recall' | 'application' | 'analysis';
export type StationType = 'history' | 'examination' | 'communication' | 'data_interpretation' | 'practical';
export type ContentMapType = 'ukmla' | 'nbme' | 'gmc_plab';

export interface Question {
  id: string;
  created_at: string;
  updated_at: string;
  exam_type: ExamType;
  question_format: QuestionFormat;
  cognitive_level: CognitiveLevel;
  specialty: string;
  system_body: string;
  topic: string;
  stem: string;
  explanation?: string | null;
  media_url?: string | null;
  media_alt?: string | null;
  difficulty: number;
  source_reference?: string | null;
  is_active: boolean;
  language: 'en' | 'ar';
  created_by?: string | null;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  label: 'A' | 'B' | 'C' | 'D' | 'E';
  body: string;
  is_correct: boolean;
}

export interface OsceStation {
  id: string; // References Question.id
  station_type: StationType;
  time_minutes: number;
  patient_brief: string;
  actor_notes?: string | null;
  candidate_brief?: string | null;
  marking_criteria: any[]; // JSONB
  pass_mark: number;
}

export interface ContentMap {
  id: string;
  question_id: string;
  map_type: ContentMapType;
  domain: string;
  subdomain?: string | null;
  blueprint_ref?: string | null;
  weight: number;
}

export interface UserAttempt {
  id: string;
  attempted_at: string;
  user_id: string;
  question_id: string;
  selected_option_id?: string | null;
  osce_transcript?: string | null;
  osce_ai_score?: number | null;
  is_correct: boolean;
  time_taken_ms: number;
  confidence?: number | null;
  session_id?: string | null;
  exam_mode?: 'practice' | 'timed' | 'mock' | null;
}

export interface SrsCard {
  id: string;
  user_id: string;
  question_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at?: string | null;
}

export interface DifficultySnapshot {
  id: string;
  computed_at: string;
  question_id: string;
  attempt_count: number;
  correct_count: number;
  correct_rate: number;
  avg_time_ms: number;
  computed_difficulty: number;
}
