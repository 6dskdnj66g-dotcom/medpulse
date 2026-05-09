-- 20260509000001_osce_sessions_and_ai_audit.sql
-- Adds:
--   1. osce_sessions   -> server-side mirror of OSCE simulator sessions
--   2. ai_responses_log -> immutable audit trail of AI responses for liability
--
-- Both tables enforce strict RLS:
--   - users can read/write only their own rows
--   - service_role has full access for server-side audit writes

-- ──────────────────────────────────────────────────────────────────────
-- 1) OSCE sessions
-- ──────────────────────────────────────────────────────────────────────
create table if not exists public.osce_sessions (
  session_id        uuid primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  station_id        text not null,
  status            text not null check (status in ('reading','active','completed','timed-out')),
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  scores            jsonb not null default '{}'::jsonb,
  rubric_progress   jsonb not null default '{}'::jsonb,
  released_investigations text[] not null default array[]::text[],
  messages          jsonb not null default '[]'::jsonb,
  final_feedback    text,
  updated_at        timestamptz not null default now()
);

create index if not exists osce_sessions_user_idx     on public.osce_sessions (user_id, started_at desc);
create index if not exists osce_sessions_station_idx  on public.osce_sessions (station_id);

create or replace function public.osce_sessions_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_osce_sessions_touch on public.osce_sessions;
create trigger trg_osce_sessions_touch
  before update on public.osce_sessions
  for each row execute function public.osce_sessions_touch_updated_at();

alter table public.osce_sessions enable row level security;

drop policy if exists osce_sessions_select_own on public.osce_sessions;
create policy osce_sessions_select_own on public.osce_sessions
  for select using (auth.uid() = user_id);

drop policy if exists osce_sessions_insert_own on public.osce_sessions;
create policy osce_sessions_insert_own on public.osce_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists osce_sessions_update_own on public.osce_sessions;
create policy osce_sessions_update_own on public.osce_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists osce_sessions_delete_own on public.osce_sessions;
create policy osce_sessions_delete_own on public.osce_sessions
  for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────
-- 2) AI audit log
-- ──────────────────────────────────────────────────────────────────────
create table if not exists public.ai_responses_log (
  id              bigserial primary key,
  user_id         uuid references auth.users(id) on delete set null,
  session_id      text,
  route           text not null,
  model           text,
  prompt_hash     text not null,
  prompt_excerpt  text,
  response_excerpt text,
  prompt_tokens   integer,
  completion_tokens integer,
  status          text not null check (status in ('ok','error','timeout','rate_limited')),
  error_message   text,
  ip_hash         text,
  created_at      timestamptz not null default now()
);

create index if not exists ai_responses_log_user_idx    on public.ai_responses_log (user_id, created_at desc);
create index if not exists ai_responses_log_route_idx   on public.ai_responses_log (route, created_at desc);
create index if not exists ai_responses_log_status_idx  on public.ai_responses_log (status, created_at desc);

alter table public.ai_responses_log enable row level security;

-- Users can read only their own audit rows.
drop policy if exists ai_responses_log_select_own on public.ai_responses_log;
create policy ai_responses_log_select_own on public.ai_responses_log
  for select using (auth.uid() = user_id);

-- No client-side INSERT/UPDATE/DELETE policies are added on purpose:
-- writes happen exclusively from the server using the service-role key.
