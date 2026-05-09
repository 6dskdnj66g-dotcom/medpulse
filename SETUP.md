# SETUP — One-time bootstrap

Once you complete the steps below, **everything else is automated**:

| Pipeline | Trigger | What happens |
|----------|---------|--------------|
| CI | Every push / PR | Lint, typecheck, build, SQL validation |
| DB migrations | Push to `main` touching `supabase/migrations/**` | `supabase db push` |
| Dependency updates | Weekly (Mon 06:00 Asia/Riyadh) | Dependabot opens grouped PRs |
| Reminder cron | Every 5 min | Hits `/api/cron/process-reminders` |
| Production deploy | Push to `main` | Vercel ↔ GitHub integration |

---

## ✅ Step 1 — Add 7 GitHub Secrets (≈ 5 minutes, do once)

Go to **GitHub → Repo → Settings → Secrets and variables → Actions → New repository secret** and add:

### Required for Supabase migrations workflow

| Name | Where to find it |
|------|------------------|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens → "Generate new token" |
| `SUPABASE_PROJECT_REF` | Supabase Dashboard → Project Settings → General → "Reference ID" |
| `SUPABASE_DB_PASSWORD` | The password you set when creating the project (or rotate at Project Settings → Database) |

### Required for CI build (so previews don't crash on missing keys)

| Name | Where to find it |
|------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/app/apikey |

> CI falls back to `'placeholder'` for any missing key, so the workflow won't break — but real values let you catch runtime issues earlier.

---

## ✅ Step 2 — Add Production Env Vars to Vercel (one of two ways)

### Option A (manual, 3 minutes)

Vercel → Project → Settings → Environment Variables → add each var from `.env.example` to **Production** + **Preview**.

### Option B (scripted, 30 seconds — recommended)

```bash
# 1. Create .env.local (copy from .env.example, fill real values — never commit)
cp .env.example .env.local
$EDITOR .env.local

# 2. Link the repo to your Vercel project (one-time)
npx vercel link

# 3. Push everything to Vercel
npm run vercel:env:sync
```

The script wipes any stale value first, so re-running it always reflects `.env.local` 1:1. To preview without writing:

```bash
DRY_RUN=1 npm run vercel:env:sync
```

---

## ✅ Step 3 — Provision the optional providers (only when you want them)

These are optional. The app degrades gracefully without them — see `DEPLOYMENT.md` table.

### Upstash Redis (rate limiter)

1. https://console.upstash.com → Create Database → copy **REST URL** + **REST TOKEN**.
2. Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` to `.env.local`.
3. `npm run vercel:env:sync`.

### Sentry (error monitoring)

1. https://sentry.io/signup → New Project → Next.js → copy **DSN**.
2. Add `SENTRY_DSN` to `.env.local`.
3. `npm run vercel:env:sync`.

---

## What's automated after bootstrap

```
git commit -m "feat: ..." && git push
└── triggers
    ├── CI: lint + typecheck + build + SQL validation        (every push)
    ├── Vercel preview deploy                                (every PR)
    ├── Vercel production deploy                             (push to main)
    └── DB migrations applied                                (when migrations/ changes)

Every Monday 06:00 Asia/Riyadh
└── Dependabot
    ├── Groups updates by ecosystem (Next, React, AI SDKs, Supabase)
    ├── Opens up to 5 PRs
    └── CI runs against each → green PR is safe to merge
```

## Manual operations (rare)

```bash
# Apply migrations from your laptop (bypasses CI)
npm run db:migrate

# Resync env vars after editing .env.local
npm run vercel:env:sync

# Push only to production (skip preview)
ENVS=production npm run vercel:env:sync

# Trigger DB migration workflow without code changes
gh workflow run db-migrate.yml
gh workflow run db-migrate.yml -f dry_run=true   # show plan only
```

## Sanity check after bootstrap

```bash
# 1. Open a tiny PR — CI should go green within ~3 minutes.
# 2. Merge to main — production deploy runs automatically.
# 3. Check the Actions tab for green checks on:
#    ✓ CI / Lint + Typecheck + Build
#    ✓ Supabase Migrations / Apply migrations  (only if you touched migrations/)
```

If any step fails, the workflow log will tell you exactly which secret is missing — every workflow validates inputs before running.
