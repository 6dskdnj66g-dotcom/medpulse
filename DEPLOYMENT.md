# Deployment — Post-Hardening Checklist

This document covers the three external steps the hardening PR
(`claude/review-suggestions-rzrSj`) requires you to perform once. The app
runs without them, but you lose the production-grade guarantees:

| Step | Without it | With it |
|------|------------|---------|
| Run Supabase migration | `osce_sessions` + `ai_responses_log` features silently no-op | Full audit trail + cross-device OSCE history |
| Add Upstash creds | Rate limiter works per-instance only (Vercel cold starts reset it) | True cross-instance rate limit |
| Add `SENTRY_DSN` | Errors logged to console only | Errors shipped to Sentry / Glitchtip |

---

## 1. Apply the Supabase migration

The migration `supabase/migrations/20260509000001_osce_sessions_and_ai_audit.sql`
creates two tables (`osce_sessions`, `ai_responses_log`) with RLS.

### Easiest — Supabase Dashboard SQL Editor (≈ 60 seconds)

1. Open https://supabase.com/dashboard → your project → **SQL Editor** → **New query**.
2. Paste the contents of `supabase/migrations/20260509000001_osce_sessions_and_ai_audit.sql`.
3. Click **Run**. Confirm both tables appear under **Table Editor**.

### Scripted — `npm run db:migrate`

The `scripts/db-migrate.mjs` script tries, in order:
1. `psql` + `DATABASE_URL` env var (most direct — get the URL from Project Settings → Database → Connection string)
2. Local `supabase` CLI (`supabase db push`)
3. `npx supabase db push`
4. Falls back to printing the SQL with copy-paste instructions

```bash
export DATABASE_URL='postgres://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres'
npm run db:migrate
```

---

## 2. Provision Upstash Redis (rate limiter)

1. Sign up: https://console.upstash.com (free tier covers small projects).
2. **Create database** → choose a region close to your Vercel region → **Create**.
3. On the database page, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add both to **Vercel** → Project → Settings → Environment Variables (Production + Preview).

Verify after the next deploy: an AI request should return an `X-RateLimit-Remaining` header.

---

## 3. Provision Sentry (error monitoring)

1. Sign up: https://sentry.io/signup/ (free tier is 5k events/month).
2. Create project → choose **Next.js** → copy the DSN
   (`https://<key>@<host>/<projectId>`).
3. Add `SENTRY_DSN` to Vercel env vars (Production + Preview).

The app uses a custom dependency-free Sentry envelope client
(`src/core/observability/error-monitoring.ts`) — no SDK install needed.

---

## 4. Confirm `SUPABASE_SERVICE_ROLE_KEY` is set

The audit log writer requires the service-role key. Check:

```
Vercel → Project → Settings → Environment Variables
```

Look for `SUPABASE_SERVICE_ROLE_KEY`. If missing, copy it from
**Supabase Dashboard → Project Settings → API → service_role key**.

> ⚠️ This key bypasses RLS. Never expose it to the browser, never commit
> it, and never put it in a `NEXT_PUBLIC_*` variable.

---

## Quick sanity check after deploy

```bash
# Rate limiter is distributed (look for non-trivial X-RateLimit-Remaining)
curl -i https://<your-domain>/api/medical-query -X POST \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"ping"}]}'

# Audit log received the entry (run in Supabase SQL editor)
select route, status, created_at from ai_responses_log order by created_at desc limit 5;

# OSCE session sync works (after completing a station while logged in)
select session_id, station_id, status from osce_sessions order by started_at desc limit 5;
```

If any of these fail, check the Vercel function logs first — every hardening
helper (audit log, error monitor, sync) is fail-soft and writes a clear
prefix (`[audit-log]`, `[error-monitoring]`, `[osce/sessions]`).
