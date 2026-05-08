# CLAUDE.md — MedPulse AI · Master Architectural Reference

> **مرجع موحد شامل لأي وكيل (Claude / Copilot / Cursor / GPT) أو محرر أكواد يفتح هذا المشروع.**
> هذا الملف هو **النسخة الموحَّدة** التي تجمع كل الملفات المعمارية في المشروع (PROJECT_BRAIN, AGENTS, CLAUDE_SYNC, AUDIT, EXECUTION_REPORT, QA_REPORT, DESIGN_REPORT, SUPABASE_SETUP, OSCE_PHASE_COMPLETE, PHASE_6_COMPLETE, README).
> اقرأه بالكامل قبل أي تعديل.
>
> المالك المعماري: **Hasanain Salah · حسنين صلاح** · الجذر الفعلي: `D:\medpuls\New folder\` · آخر تحديث: 2026-05-08

---

## فهرس المحتوى

### Part A — الخريطة العامة والقواعد المعمارية
- [§0 Quick Facts](#0-quick-facts-اقرأها-أولًا)
- [§1 Stack الكامل](#1-stack-الكامل)
- [§2 خريطة المجلدات](#2-خريطة-المجلدات-folder-map)
- [§3 معمارية `src/`](#3-خريطة-المعمارية-src)
- [§4 البنية التحتية](#4-البنية-التحتية-infrastructure)
- [§5 شجرة Providers](#5-providers-tree)
- [§6 Design System](#6-design-system-srcappglobalscss)
- [§7 16 قاعدة ذهبية](#7-قواعد-ذهبية-لا-تكسرها-أبدًا)
- [§8 متغيرات البيئة](#8-متغيرات-البيئة-env-vars)
- [§9 OSCE System](#9-osce-system-phase-7)
- [§10 سجل المراحل](#10-سجل-المراحل-phase-history)
- [§11 المراجع](#11-المراجع-الإضافية-single-source-of-truth-files)
- [§12 سير العمل القياسي](#12-سير-العمل-القياسي-workflow)

### Part B — الملفات المعمارية مدمجة بالكامل (Single-File Truth)
- [§13 PROJECT_BRAIN.md (الذاكرة الدائمة)](#13-project_brainmd-كاملًا)
- [§14 AGENTS.md (قواعد الوكلاء)](#14-agentsmd-كاملًا)
- [§15 CLAUDE_SYNC.md (حالة المشروع)](#15-claude_syncmd-كاملًا)
- [§16 AUDIT.md (Phase 6 forensic audit)](#16-auditmd-كاملًا)
- [§17 EXECUTION_REPORT.md (Phase 6 + Phase FSD)](#17-execution_reportmd-كاملًا)
- [§18 QA_REPORT.md (Page-by-page audit)](#18-qa_reportmd-كاملًا)
- [§19 DESIGN_REPORT.md (Design System phases)](#19-design_reportmd-كاملًا)
- [§20 SUPABASE_SETUP.md (DB tables)](#20-supabase_setupmd-كاملًا)
- [§21 OSCE_PHASE_COMPLETE.md (30 stations)](#21-osce_phase_completemd-كاملًا)
- [§22 PHASE_6_COMPLETE.md (AppShell + 6 routes)](#22-phase_6_completemd-كاملًا)
- [§23 README.md (overview)](#23-readmemd-كاملًا)

---
---

# Part A — الخريطة العامة والقواعد المعمارية

## 0) Quick Facts (اقرأها أولًا)

| المفتاح | القيمة |
|---|---|
| **اسم المشروع** | MedPulse AI — منصة تعليم طبي عربي/إنجليزي مدعومة بالذكاء الاصطناعي |
| **مسار الجذر الفعلي** | `D:\medpuls\New folder\` ← **كل التعديلات هنا فقط، ليس `D:\medpuls\`** |
| **الإطار** | Next.js 15.5.x · App Router · React 19 · TypeScript 5 · Tailwind 4 |
| **المزود السحابي** | Vercel (production) |
| **قاعدة البيانات/المصادقة** | Supabase (Postgres + Auth + RLS) |
| **مزود AI الأساسي** | **GROQ** (`groq-sdk`, موديل `llama-3.3-70b-versatile` / `llama3-8b-8192`) — ⚠️ NOT xAI Grok و NOT Gemini |
| **مفتاح بيئة AI** | `GROQ_API_KEY` (الأساسي). `XAI_API_KEY` موجود في كود `grok.ts` كمسار قديم لكن فعليًا يستخدم GROQ fallback |
| **اللغة الافتراضية** | `lang="ar" dir="rtl"` (مدارة عبر `LanguageContext.tsx`) |
| **نسق المعمارية** | Feature-Sliced Design (FSD) — `src/core/` + `src/features/` + `src/app/` |
| **Build Status** | 0 TS errors · 0 lint errors · ~62 pages (Phase 6) / 41 routes (Phase 7) |
| **Production URL** | https://medpulse-ai-five.vercel.app · https://medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app |

---

## 1) Stack الكامل

### Runtime / Frontend
- **Next.js 15.5.15** (App Router, RSC-First)
- **React 19** + React DOM 19
- **TypeScript 5** (strict)
- **Tailwind CSS 4** + `@tailwindcss/postcss`
- **next-themes** للـ dark/light
- **framer-motion** للحركات
- **lucide-react** للأيقونات (CRITICAL: استورد كل الأيقونات بشكل صريح)
- **react-markdown** + `remark-gfm` لعرض ردود AI

### AI / Knowledge
- **groq-sdk** + **@ai-sdk/groq** — المزود الأساسي
- **@ai-sdk/google** + **@google/generative-ai** — موجودة لكن **معطّلة فعليًا** (الحصة منتهية، لا تستخدمها)
- **@pinecone-database/pinecone** — Vector DB للمصادر الطبية
- **duck-duck-scrape** — RAG مجاني (DuckDuckGo grounded به sites مثل nih.gov, uptodate.com)
- **ai** (Vercel AI SDK v6) — للستريم والـ tool calling

### Data / Infra
- **@supabase/supabase-js** + **@supabase/ssr** — auth + db + RLS
- **resend** — البريد المعاملاتي
- **web-push** — push notifications
- **html2canvas** + **jspdf** — تصدير PDF

### Dev / Test
- **jest** + **@testing-library/react** + **jest-environment-jsdom**
- **eslint** + **eslint-config-next**
- **husky** للـ git hooks

---

## 2) خريطة المجلدات (Folder Map)

```
D:\medpuls\
├── New folder\               ← الجذر الفعلي للمشروع (كل العمل هنا)
│   ├── CLAUDE.md             ← هذا الملف (master reference)
│   ├── PROJECT_BRAIN.md      ← الذاكرة الدائمة + سجل الـ phases
│   ├── AGENTS.md             ← قواعد الوكلاء (Branches, PRs, TS rules)
│   ├── CLAUDE_SYNC.md        ← حالة المشروع ومستند التسليم
│   ├── README.md
│   ├── SUPABASE_SETUP.md
│   ├── DESIGN_REPORT.md
│   ├── AUDIT.md / QA_REPORT.md / EXECUTION_REPORT.md
│   ├── PHASE_6_COMPLETE.md / OSCE_PHASE_COMPLETE.md
│   ├── package.json
│   ├── next.config.ts        ← CSP + security headers
│   ├── vercel.json           ← cleanUrls, framework=nextjs
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── jest.config.ts / jest.setup.ts
│   ├── postcss.config.mjs
│   ├── public\               ← manifest.json, sw.js, *.svg
│   ├── data\                 ← JSON seed (ليس DB)
│   │   ├── osce-stations\    ← 30 محطة OSCE (.json)
│   │   ├── usmle-questions\  ← step1.json, step2ck.json
│   │   ├── exams\
│   │   ├── medical-kb\       ← acc-aha-cad-2023, ada-diabetes-2024, normal-ranges
│   │   ├── osce-scenarios\
│   │   └── ukmla\
│   ├── supabase\
│   │   ├── schema.sql
│   │   └── migrations\
│   │       ├── 20260427000001_qbank_schema.sql
│   │       └── create_notifications_table.sql
│   ├── scripts\              ← مهام صيانة (audit, import, validate)
│   │   ├── audit-agents.mjs
│   │   ├── expand-databank.ts
│   │   ├── fix-question-ids.mjs
│   │   ├── generate-explanations.mjs
│   │   ├── import-medqa-real.js / import-medqa.ts
│   │   ├── patchOSCE.js
│   │   └── validate-usmle.js
│   ├── clinical_tests\
│   ├── .github\workflows\    ← ci.yml, reminder-cron.yml
│   └── src\                  ← كود المصدر (ينقسم على FSD)
│       ├── app\              ← Next.js App Router (pages + APIs)
│       ├── components\       ← UI components (مشتركة)
│       ├── core\             ← منطق أساسي (auth, ai, db, i18n, ui)
│       ├── features\         ← ميزات قائمة على FSD (osce, usmle, ddx ...)
│       ├── lib\              ← أدوات/خدمات/sources طبية
│       ├── contexts\
│       ├── hooks\
│       ├── types\            ← database.ts, medical.ts
│       ├── __tests__\
│       └── middleware.ts     ← Rate limiting + auth guard
└── New folder.worktrees\     ← git worktrees (نسخ Copilot القديمة)
```

---

## 3) خريطة المعمارية (`src/`)

### `src/app/` — App Router

#### Pages (الصفحات) — ~38 route
| المسار | الميزة | الحالة |
|---|---|---|
| `/` | Landing عربي/إنجليزي | ✅ |
| `/auth` | Supabase login/register | ✅ |
| `/dashboard` | لوحة الطالب | ✅ |
| `/professors` | لوحة المدرّسين | ✅ |
| `/admin` | لوحة الأدمن (محمية) | ✅ |
| `/profile` | البروفايل (3D design) | ✅ |
| `/progress` | تتبع التقدم | ✅ |
| `/mdt` | نقاش MDT بثلاث وكلاء AI | ✅ |
| `/simulator` | محاكي حالات سريرية | ✅ Phase 7 |
| `/osce` | متصفح محطات OSCE | ✅ |
| `/ecg` | تحليل ECG | ✅ |
| `/drug-checker` | التداخلات الدوائية | ✅ |
| `/encyclopedia` | الموسوعة الطبية | ✅ |
| `/library` | المكتبة (308 مصدر، 20/page) | ✅ |
| `/calculators` | الحاسبات الطبية | ✅ |
| `/usmle` | امتحان USMLE | ✅ (50 سؤال) |
| `/summarizer` | تلخيص مستندات | ✅ |
| `/translator` | ترجمة طبية | ✅ |
| `/notes` | ملاحظات + AI | ✅ |
| `/records` | السجلات + PDF export | ✅ |
| `/about` · `/privacy` · `/pricing` | صفحات ثابتة | ✅ |
| `/srs` | spaced repetition (SM-2) | ✅ Phase 6.6 |
| `/reasoning` | Clinical Reasoning Trainer | ✅ Phase 6.6 |
| `/anatomy` | Anatomy Atlas | ✅ scaffold |
| `/image-bank` | Medical Image Bank | ✅ scaffold |
| `/procedures` | Clinical Procedures | ✅ Phase 6.6 |
| `/saudi-exams` | Saudi Medical Exams | ✅ Phase 6.6 |
| `/professor` · `/ddx` · `/pathology` · `/radiology` · `/lab-results` · `/exams` · `/local-resources` | stubs / partial | 🟡 |

#### Special files
- `layout.tsx` — root, `lang="ar" dir="rtl"`, FOUWT script, manifest, theme-color, sw register
- `globals.css` — كل design system (CSS vars, glass cards, animations)
- `error.tsx` / `global-error.tsx` / `not-found.tsx`
- `sitemap.ts` / `robots.ts`
- `actions/` — Server Actions

#### API Routes (`src/app/api/`)
| المسار | الوظيفة |
|---|---|
| `ai/professor` | RAG عبر DuckDuckGo + Groq (6 شخصيات متخصصة، streaming) |
| `medical-query` | استعلامات طبية عامة |
| `mdt-debate` | نظام MDT بثلاث وكلاء (streaming) |
| `drug-interaction` | تداخلات دوائية |
| `ecg-analysis` | تفسير ECG |
| `simulator` | حالة سريرية كلاسيكية |
| `osce/turn` | OSCE single-turn (new format، 30 محطة) |
| `osce/chat` | OSCE chat (legacy/old stations IM-01, CARD-01...) |
| `osce/station/[id]` | جلب محطة بالمعرّف |
| `osce/stations` | قائمة كل المحطات |
| `osce/evaluate` | تقييم AI بعد الجلسة |
| `generate-notes` | توليد ملاحظات |
| `medical-summarizer` | تلخيص (structured output) |
| `translate` | ترجمة طبية |
| `flashcards` | توليد بطاقات |
| `lab-interpreter` | تفسير نتائج معمل |
| `library` | NCBI proxy + sources (rate limit 30/min) |
| `sources` | استرجاع مصادر (Pinecone) |
| `progress` | تتبع تقدم المستخدم |
| `ddx` | تشخيص تفريقي (stub) |
| `usmle` | تقديم أسئلة USMLE |
| `vision` | تحليل صور طبية متعدد الوسائط |
| `notifications` | web-push |
| `cron` | مهام مجدولة (process-reminders) |
| `visitors` | analytics |
| `admin/seed-sources` | seeder للمصادر |

### `src/core/` — منطق أساسي (DRY)
```
core/
├── auth/                              ← SSOT للـ identity (Phase FSD-3)
│   ├── SupabaseAuthContext.tsx        ← الوحيد المسموح به
│   ├── auth.types.ts
│   └── useAuth.ts
├── ai/                                ← server-only (Phase FSD-4)
│   ├── providers/grok.ts              ← يحاول xAI ثم يسقط على Groq
│   ├── tools/free-medical-search.ts   ← RAG مجاني — @ts-expect-error مهم لا تحذفه
│   ├── mdt-agents.ts
│   ├── mdt-prompts.ts
│   └── pinecone.ts                    ← `import 'server-only'` لمنع التسرب
├── database/supabase.ts
├── i18n/
│   ├── LanguageContext.tsx            ← AR/EN + html[lang][dir]
│   └── translations.ts
├── providers/AppProviders.tsx         ← يلف التطبيق كله
└── ui/
    ├── ErrorBoundary.tsx
    ├── ThemeProvider.tsx
    ├── ThemeToggle.tsx
    ├── LanguageToggle.tsx
    └── FlashcardDeck.tsx
```

### `src/features/` — Feature-Sliced
كل ميزة لها نفس الهيكل: `components/ · hooks/ · services/ · store/ · types/ · index.ts`
الموجودة: `osce`, `usmle`, `mdt`, `ddx`, `calculators`, `drug-checker`, `ecg`, `encyclopedia`, `lab-results`, `library`, `pathology`, `radiology`.

### `src/components/` — UI shared
- `Navbar.tsx` — top bar + mobile drawer + bottom tabs (RTL/LTR aware)
- `Footer.tsx` — medical disclaimer + AI attribution + (Privacy/About/Pricing)
- `Sidebar.tsx` (legacy thin wrapper) + `layout/Sidebar.tsx` (current — Learning Tools section مع 6 routes جديدة)
- `layout/AppShell.tsx` — يحجب Navbar/Sidebar/Footer على `/` و `/auth/*` (Phase 6)
- `AuthContext.tsx` — **mock قديم ميت** (لا تستخدمه)
- `AchievementContext.tsx`
- `VisitorTracker.tsx`
- `NotificationToggle.tsx`
- `DevRoleToggle.tsx` — مدمج داخل ملف البروفايل (Phase 6.1)
- `dashboard/StudentDashboard.tsx`, `ProfessorDashboard.tsx`
- `medical/` — `OsceChat.tsx`, `SourceBadge.tsx`, `SourceReaderDrawer.tsx`, `InAppBrowser.tsx`
- `osce/` — `CountdownTimer.tsx`, `InvestigationCard.tsx`, `RubricSidebar.tsx`, `StationBriefing.tsx`, `FinalReport.tsx`
- `error/ErrorBoundary.tsx`

### `src/lib/` — أدوات وخدمات
```
lib/
├── ai/
│   ├── grok.ts                    ← legacy alias لمزود AI
│   ├── medical-ai.ts              ← service layer + RAG + safety (Phase 6)
│   ├── prompts.ts
│   ├── rag.ts                     ← RAG retrieval من medical KB (Phase 6)
│   ├── validators.ts              ← response validation + emergency detection + disclaimer (Phase 6)
│   └── agent-registry.ts
├── osce/
│   ├── types.ts                   ← PatientPersona, OSCEStation, OSCESession
│   ├── station-loader.ts          ← server-side JSON cache
│   ├── patient-engine.ts          ← يقفل هوية المريض ضد التهلوس
│   ├── investigation-detector.ts  ← keyword-based
│   ├── rubric-tracker.ts          ← live scoring (keyword + AI)
│   ├── rubric-analyzer.ts
│   ├── session-manager.ts         ← localStorage osce_v2_session_*
│   └── session-store.ts
├── medical-sources/
│   ├── index.ts · types.ts
│   ├── aggregator.ts · cache.ts · scorer.ts · router.ts
│   ├── grok-synthesizer.ts · groq-synthesizer.ts
│   └── sources/                   ← pubmed, openfda, rxnorm, who, dailymed,
│                                     medlineplus, openalex, statpearls,
│                                     europepmc, clinicaltrials
├── medical-api/
│   ├── europe-pmc.ts
│   └── multi-fetcher.ts
├── exams/                         ← question-loader, types, validators
├── srs/sm2.ts                     ← خوارزمية SM-2 (Phase 6)
├── email/templates.ts
└── medical-search.ts              ← الـ RAG القديم (انظر core/ai/tools للأحدث)
```

---

## 4) البنية التحتية (Infrastructure)

### Hosting
- **Vercel** — `vercel.json` فقط `cleanUrls + framework=nextjs`
- Production URLs:
  - `https://medpulse-ai-five.vercel.app`
  - `https://medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app`
- CI: `.github/workflows/ci.yml` + `reminder-cron.yml`

### Headers الأمنية (`next.config.ts`)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`
- **CSP** يسمح بالاتصال مع: `api.x.ai`, `api.groq.com`, `eutils.ncbi.nlm.nih.gov`, `*.supabase.co`, `wss://*.supabase.co`
- صور خارجية: `images.unsplash.com`, `plus.unsplash.com`, `www.ncbi.nlm.nih.gov`
- `eslint.ignoreDuringBuilds = true`
- `typescript.ignoreBuildErrors = false`

### Middleware (`src/middleware.ts`)
- **Rate limiter** in-memory (Edge-compatible) — 20/min على AI endpoints، 30/min على `/api/library/*`
- يضيف headers: `X-RateLimit-Limit/Remaining/Reset`
- **Auth guard** على `/admin/*` و `/profile/*` (يطلب cookie `sb-access-token` أو `*auth-token`)
- مرتبط على: `/api/ai/*`, `/api/medical-query`, `/api/mdt/*`, `/api/osce/*`, `/api/usmle/explain`, `/api/ddx`, `/api/drug-interaction`, `/api/ecg-analysis`, `/api/vision`, `/api/library/*`

### Supabase (PostgreSQL + Auth + RLS)
**Tables:**
1. `profiles` — بيانات المستخدمين المسجلين
2. `medical_sources` — مكتبة المصادر الطبية (200+ مصدر)
3. `user_progress` — تقدم المستخدم وجلسات التعلم
4. `visitor_logs` — تتبع الزوار والإحصائيات
5. `user_bookmarks` — مفضلة المصادر لكل مستخدم
6. `user_sessions` — جلسات العمل التفصيلية
7. `notifications` — إشعارات push

**Migrations:**
- `20260427000001_qbank_schema.sql` — schema بنك الأسئلة
- `create_notifications_table.sql`

**RLS:** zero-trust من العميل — التزم بها صارمًا.

### PWA
- `public/manifest.json` + `public/sw.js`
- الـ service worker يُسجَّل تلقائيًا من `layout.tsx`

### Cache & RAG
- **24-hour LRU cache** داخل `free-medical-search.ts` → الاستعلامات المتكررة بصفر تكلفة API و<5ms
- **DuckDuckGo grounded** لمواقع: `nih.gov`, `uptodate.com`, إلخ.
- **Pinecone** لـ vector retrieval

---

## 5) Providers Tree

```
RootLayout (server)
└─ AppProviders (client)
   └─ LanguageProvider               ← AR/EN + dir
      └─ SupabaseAuthProvider        ← SSOT للـ auth
         └─ ThemeProvider            ← next-themes (system default)
            └─ AchievementProvider   ← gamification
               ├─ VisitorTracker     ← analytics (mount only)
               └─ ErrorBoundary
                  └─ AppShell        ← يحجب Navbar/Sidebar على / و /auth
                     └─ {children}
```

---

## 6) Design System (`src/app/globals.css`)

- **Dark base:** `bg-base #05050F`, `text #EEF2FF`, indigo accent
- **Light base:** `#F2F4F8` bg, `#0B1120` text, white cards + shadow depth
- **Brand colors:** Medical Indigo `#5B6CFF`, Clinical Violet `#8B5CF6`, Vital Cyan `#06B6D4`
- **Background tokens:** `--background-0`, `--background-1`, ...
- Classes: `clinical-card-3d`, `premium-card`, `btn-elite`, `glass-nav`, `page-transition`, `medpulse-card glass level-1`
- CSS Variables: `--shadow-*`, `--glass-bg/border/blur`, `--sidebar-bg/border`, `--color-medical-indigo`
- 3D depth system: Level 0 → Level 4 elevation (z-axis box-shadow hierarchy)
- Animations: `animate-in fade-in zoom-in-95 duration-700` + ambient glow blobs
- Scrollbars: 8px webkit, indigo thumb, clinical-violet hover
- Transitions: 350ms cubic-bezier (bg/border/shadow), 200ms (color)
- 8pt grid spacing
- Apple-tier glassmorphism + backdrop filters
- **FOUWT prevention:** inline script في `layout.tsx` يقرأ `localStorage.theme` قبل أول رسم

---

## 7) قواعد ذهبية (لا تكسرها أبدًا)

1. **AI Provider = GROQ فقط** — مفتاح `GROQ_API_KEY`. لا تستخدم Gemini (الحصة منتهية). Grok اسم الملف فقط لكنه يسقط على GROQ تلقائيًا.
2. **Auth SSOT = `core/auth/SupabaseAuthContext.tsx`** — `components/AuthContext.tsx` (mock) ميت، تجاهله.
3. **الجذر الفعلي = `D:\medpuls\New folder\`** — لا تعدل `D:\medpuls\` المباشر.
4. **`@ts-expect-error` في `free-medical-search.ts` لازم لـ Vercel V3** — لا تحذفه.
5. **استورد كل أيقونات `lucide-react` بشكل صريح** — أي missing import = runtime crash.
6. **في RTL استخدم `gap-*` لا `space-x-*`**.
7. **Sidebar hover** direction-aware (`translate-x-1` / `-translate-x-1`).
8. **Library filters** تتطلب الحقلين `labelAr` و `labelEn`.
9. **لا hardcoded years** ("2026") في metadata أو نص UI — استبدلها بـ "Clinical Guidelines".
10. **`<html lang="ar" dir="rtl">` لا يتغير** في root layout.
11. **في `simulator/[stationId]/page.tsx`** الـ `/* eslint-disable @typescript-eslint/no-explicit-any */` متروك عمدًا — لا ترفعه (كان يكسر Vercel CI).
12. **الـ imports المطلقة** (`@/core/...`, `@/features/...`, `@/types/...`) — لا تستخدم `../../`.
13. **RSC-First** — `use client` فقط عند ضرورة hooks/interactivity.
14. **قبل أي commit:** `npm run build` و `npm run lint` يجب أن ينجحا.
15. **Branches:** `feature/`, `fix/`, `chore/`, `refactor/`, `docs/` فقط — kebab-case ≤5 كلمات. لا push مباشر على `main`. لا أسماء auto-generated مثل `copilot/worktree-*`.
16. **لا تلتزم `.env`** أو أي مفاتيح.
17. **لا تستخدم `any`** — استخدم `unknown` أو generics. لو لزم، أضف `// eslint-disable-next-line @typescript-eslint/no-explicit-any` مع تعليق السبب.
18. **استخدم `useLanguage()` hook** لتطبيق `dir={dir}` في كل صفحة جديدة.
19. **لا تعطّل tests/lint/type checks** لجعل الـ build يمر — صلح السبب الجذري.
20. **`pinecone.ts` server-only** — لا تستوردها من عميل.

---

## 8) متغيرات البيئة (Env Vars)

```env
# AI (الأساسي = GROQ)
GROQ_API_KEY=                         # ⭐ المفتاح الرئيسي للذكاء الاصطناعي
XAI_API_KEY=                          # legacy — يسقط لـ GROQ تلقائيًا إن لم يوجد

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server-only

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX=

# Site
NEXT_PUBLIC_SITE_URL=

# Email (resend)
RESEND_API_KEY=

# Web push (vapid)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

> **توليد VAPID:** `npx --yes web-push generate-vapid-keys`

---

## 9) OSCE System (Phase 7)

- **30 محطة** بصيغة JSON في `data/osce-stations/`
- التصنيفات: history-taking (8) · focused-examination (4) · breaking-bad-news (1) · informed-consent (1) · communication-skills (5) · ethical-dilemma (1) · emergency-management (4) · data-interpretation (3) · procedure-explanation (3)
- **Dual-mode:**
  - محطات قديمة (IM-01, CARD-01) → `/api/osce/chat`
  - محطات جديدة → `/api/osce/turn` بثلاث أعمدة + RubricSidebar حية
- **Anti-hallucination:** prompt المريض يقفل الهوية في headers بـ ALL-CAPS (`patient-engine.ts`)
- **Session persistence:** `localStorage` تحت مفاتيح `osce_v2_session_*` (منفصلة عن `osce_session_*` القديمة)
- **Investigation detection:** `InvestigationDetector.detectMultiple()` يحلّل رسائل الطالب لطلبات التحقيقات
- **Live rubric:** keyword + investigation client-side للسرعة. `ai-evaluation` items مؤجلة حتى نهاية الجلسة
- **Evaluation:** `POST /api/osce/evaluate` → Groq transcript analysis → زر "AI analysis" في `FinalReport.tsx`
- **⚠️ ناقص:** صور المحطات في `public/osce-assets/*.png` لم تُضف بعد (تُعرض gracefully بدونها)
- **⚠️ ناقص:** New stations English-only — يمكن توسيعها بـ `candidateInstructionsAr`

---

## 10) سجل المراحل (Phase History)

| Phase | التاريخ | الموجز |
|---|---|---|
| 1 — Bug Audit | 2026-04-17 | إصلاح 10 bugs runtime، build مستقر صفر أخطاء |
| 2 — Feature Completeness | 2026-04-18 | landing عربي/إنجليزي، USMLE 50 سؤال، auth guards |
| 3 — Polish & SEO | 2026-04-18 | metadata لـ 16 route، 404، loading skeletons |
| 4 — Integration | 2026-04-18 | auth guards كاملة، PDF export، ECG/drug bilingual |
| 5 — SEO & Errors | 2026-04-18 | OG/Twitter cards, sitemap, robots, error.tsx |
| 6 — Final QA | 2026-04-18 | 0 lint, 0 errors, 39 routes |
| 6.1 — Mobile Fixes | 2026-04-18 | DevRoleToggle, encyclopedia layout, simulator hooks |
| 7 — Legendary Redesign | 2026-04-18 | mobile drawer, dark/light overhaul, +15 مصدر مكتبة، 41 route |
| FSD-1 → FSD-4 | 2026-04-21 | معمارية `core/` + `features/`، migration كامل لـ Supabase auth، AI server-only |
| 6.6 — New Routes | 2026-04-25 | AppShell, +6 routes (srs, reasoning, anatomy, image-bank, procedures, saudi-exams), 62 pages |
| 8 — Hardening + Zero-Cost RAG | 2026-04-26 | DuckDuckGo RAG, LRU cache 24h, rate limiter, OSCE evaluate |
| 9 — Next | قادم | DDx · Lab Results · PWA offline · Stripe · OSCE images · Vision UI |

---

## 11) المراجع الإضافية (Single Source of Truth files)

- **`PROJECT_BRAIN.md`** — الذاكرة الدائمة طويلة المدى (مدمج كامل في §13)
- **`AGENTS.md`** — قواعد الالتزام/PR/Branches للوكلاء (§14)
- **`CLAUDE_SYNC.md`** — حالة المشروع قصيرة المدى وملاحظات التسليم (§15)
- **`AUDIT.md`** — Phase 6 forensic audit (§16)
- **`EXECUTION_REPORT.md`** — Phase 6 + FSD execution log (§17)
- **`QA_REPORT.md`** — Page-by-page audit (§18)
- **`DESIGN_REPORT.md`** — تفاصيل Design System (§19)
- **`SUPABASE_SETUP.md`** — Tables + RLS (§20)
- **`OSCE_PHASE_COMPLETE.md`** — تفاصيل 30 محطة OSCE (§21)
- **`PHASE_6_COMPLETE.md`** — AppShell + 6 routes جديدة (§22)
- **`README.md`** — overview (§23)

> ⚠️ هذا الملف (CLAUDE.md) يدمج كل ما سبق. لو عدّلت أي ملف منهم، حدّث القسم المقابل هنا أيضًا.

---

## 12) سير العمل القياسي (Workflow)

```bash
# 1. اقرأ هذا الملف بالكامل (Part A للخريطة، Part B للتفاصيل التاريخية)
# 2. أنشئ branch: feature/<short-name>  (kebab-case، ≤5 كلمات)
# 3. عدّل في src/ — التزم بـ FSD و RSC-First
# 4. اختبر:
npm run lint
npm run build
npm test
npm run dev   # تحقق يدويًا في المتصفح للـ UI

# 5. commit بـ Conventional Commits: feat(scope): ... | fix(scope): ...
# 6. PR — انتظر Vercel preview + CI أخضر قبل الدمج.
```

---
---

# Part B — الملفات المعمارية مدمجة بالكامل

> القسم التالي يحوي **النص الحرفي** لكل ملف معماري في المشروع. اعتبره مرجعًا تاريخيًا/تنفيذيًا.

---

## 13) `PROJECT_BRAIN.md` كاملًا

```markdown
# PROJECT_BRAIN.md — MedPulse AI Persistent Memory

> **FIRST TASK ON RESUME:** Read this file in full before taking any action.

---

## Master Requirements

### Project Identity
- **Name:** MedPulse AI (healthtech-platform)
- **Purpose:** Arabic/English bilingual medical education & AI-assisted clinical platform
- **Root Path:** `D:\medpuls\New folder\`
- **Stack:** Next.js 15.5, React 19, Tailwind CSS 4, TypeScript, Supabase, Groq (llama-3.3-70b-versatile)

### Core Architecture
- **Router:** Next.js App Router (`src/app/`)
- **Language/Dir:** Default Arabic (`lang="ar" dir="rtl"`) — managed by `LanguageContext.tsx`
- **Auth (real):** `src/components/SupabaseAuthContext.tsx` — Supabase login/logout — SINGLE SOURCE OF TRUTH
- **AI Provider:** Groq (`llama-3.3-70b-versatile` via `@ai-sdk/groq`) **STRICTLY**.
  > ⚠️ CRITICAL: DO NOT USE GEMINI. Gemini API keys have exhausted quotas. Always use Groq for ALL AI routes.
- **RAG:** DuckDuckGo (`duck-duck-scrape`) grounded to `site:nih.gov`, `site:uptodate.com`, etc.
- **DB/Storage:** Supabase (`src/lib/supabase.ts`)
- **Vector DB:** Pinecone (`src/lib/pinecone.ts`)
- **Caching:** 24-hour LRU cache map in `free-medical-search.ts` — zero API cost for duplicate queries

### Architecture Pattern
- **Feature-Sliced Design (FSD):** `src/core/` (auth, ai, database, i18n, providers, ui) + `src/features/` (osce, library, usmle)
- **RSC-First:** All pages are React Server Components by default. `use client` only when interactivity strictly required.
- **AppProviders:** `src/core/providers/AppProviders.tsx` wraps the app; root `layout.tsx` is clean.

---

## Full Route Map (38 routes total)

| Route | Feature | Status |
|-------|---------|--------|
| `/` | Landing / Home page | ✅ Full bilingual landing |
| `/auth` | Login / Registration | ✅ Supabase Auth |
| `/dashboard` | Student dashboard | ✅ With loading skeleton |
| `/professors` | Professor dashboard | ✅ Bilingual |
| `/admin` | Admin panel | ✅ Role-gated |
| `/profile` | User profile | ✅ 3D design |
| `/progress` | Learning progress tracker | ✅ With skeleton |
| `/mdt` | Multi-Disciplinary Team AI debate (3 AI agents) | ✅ Live |
| `/simulator` | Clinical case simulator (OSCE) — 30 new-format + classic | ✅ Phase 7 |
| `/osce` | OSCE station browser | ✅ |
| `/ecg` | ECG analysis AI tool | ✅ Bilingual |
| `/drug-checker` | Drug interaction checker | ✅ Bilingual |
| `/encyclopedia` | Medical encyclopedia | ✅ Mobile-fixed |
| `/library` | Medical library (bilingual TYPE/REGION filters, 30+ sources) | ✅ |
| `/calculators` | Medical calculators | ✅ |
| `/usmle` | USMLE exam prep (50 questions, 10 specialties) | ✅ |
| `/summarizer` | Medical document summarizer | ✅ |
| `/translator` | Medical translator | ✅ |
| `/notes` | Note-taking with AI | ✅ |
| `/records` | Patient records with PDF export | ✅ |
| `/about` | About page | ✅ |
| `/pricing` | Pricing page (stub) | 🟡 Needs Stripe |
| `/privacy` | Privacy policy | ✅ |
| `/professor` | AI Professor/Tutor mode | 🟡 Stub |
| `/ddx` | Differential Diagnosis engine | 🟡 Stub |
| `/srs` | Spaced Repetition System | ✅ Phase 6.6 (SM-2) |
| `/anatomy` | 3D Anatomy viewer | 🟡 Scaffold |
| `/pathology` | Pathology image bank | 🟡 Stub |
| `/image-bank` | Clinical image bank | ✅ Phase 6.6 |
| `/radiology` | Radiology reading room | 🟡 Stub |
| `/lab-results` | Lab results interpreter | 🟡 Stub |
| `/procedures` | Procedure library | ✅ Phase 6.6 |
| `/reasoning` | Clinical reasoning journal | ✅ Phase 6.6 |
| `/exams` | General exams module | 🟡 Stub |
| `/saudi-exams` | Saudi/Gulf Board exam prep | ✅ Phase 6.6 |
| `/local-resources` | Arabic medical resources library | 🟡 Stub |
| `/actions` | Server actions directory | Internal |

---

## API Routes (`src/app/api/`)

| Route | Purpose |
|-------|---------|
| `ai/professor` | Web-Grounded RAG via DuckDuckGo + Groq |
| `medical-query/` | General AI medical queries |
| `mdt-debate/` | Triple-agent MDT debate system |
| `drug-interaction/` | Drug interaction analysis |
| `ecg-analysis/` | ECG AI interpretation |
| `simulator/` | Classic clinical case generation |
| `osce/turn/` | New-format OSCE single-turn patient response |
| `osce/station/[id]/` | Fetch OSCE station by ID |
| `osce/stations/` | List all new-format station metadata |
| `osce/evaluate/` | Post-session OSCE deep AI evaluation (Groq) |
| `generate-notes/` | AI note generation |
| `medical-summarizer/` | Document summarization |
| `translate/` | Medical translation |
| `flashcards/` | Flashcard generation |
| `sources/` | Medical source retrieval (Pinecone) |
| `progress/` | Progress tracking |
| `admin/` | Admin operations |
| `visitors/` | Visitor analytics |
| `ddx/` | Differential diagnosis (to be built) |
| `usmle/` | USMLE question serving |
| `vision/` | Medical image analysis (multimodal) |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Navbar.tsx` | Mobile top bar + drawer + bottom tabs |
| `src/components/layout/Sidebar.tsx` | Desktop sidebar (RTL-aware) |
| `LanguageContext.tsx` | AR/EN switcher — updates `html[lang][dir]` |
| `ThemeProvider.tsx` | Dark/light mode via next-themes |
| `AchievementContext.tsx` | Gamification/achievements |
| `VisitorTracker.tsx` | Analytics tracking |
| `FlashcardDeck.tsx` | Flashcard UI component |
| `osce/CountdownTimer.tsx` | Animated countdown with urgency colors |
| `osce/InvestigationCard.tsx` | Lab table + image result display |
| `osce/RubricSidebar.tsx` | Live three-domain rubric with checkmarks |
| `osce/StationBriefing.tsx` | Pre-station reading phase |
| `osce/FinalReport.tsx` | Post-station score report with AI analysis button |

---

## Design System (`src/app/globals.css`)

- **Dark mode base:** `bg-base #05050F`, `text #EEF2FF`, indigo accent
- **Light mode:** warm `#F2F4F8` bg, deep `#0B1120` text, white cards with shadow depth
- **CSS Classes:** `clinical-card-3d`, `premium-card`, `btn-elite`, `glass-nav`, `page-transition`, `medpulse-card glass level-1`
- **CSS Variables:** `--shadow-*`, `--glass-bg/border/blur`, `--sidebar-bg/border`, `--color-medical-indigo`
- **Animations:** `animate-in fade-in zoom-in-95 duration-700` + ambient glow blobs
- **Scrollbars:** 8px webkit custom, indigo thumb, clinical-violet hover
- **Transitions:** 350ms cubic-bezier on bg/border/shadow, 200ms on color
- **FOUWT prevention:** Inline script in `layout.tsx` reads localStorage theme before paint

---

## OSCE System (Phase 7 — 30 Stations)

- **Station JSON:** `data/osce-stations/*.json`
- **Categories:** history-taking (8), focused-examination (4), breaking-bad-news (1), informed-consent (1), communication-skills (5), ethical-dilemma (1), emergency-management (4), data-interpretation (3), procedure-explanation (3)
- **Dual-mode:** Old stations (IM-01, CARD-01) → `/api/osce/chat`. New stations → `/api/osce/turn` + three-column layout
- **Anti-hallucination:** Patient prompt locks identity in ALL-CAPS headers
- **Session persistence:** `localStorage` under `osce_v2_session_*` keys
- **⚠️ Missing:** `public/osce-assets/*.png` — OSCE station images not yet added

---

## Critical Patterns (Never Break These)

1. Always import ALL icons from `lucide-react` — missing imports = runtime crash
2. Always destructure all hooks fully (e.g., `const { signOut } = useSupabaseAuth()`)
3. Use `gap-*` not `space-x-*` in RTL layouts
4. Sidebar hover: direction-aware `translate-x-1` / `-translate-x-1`
5. Library filters need both `labelAr` and `labelEn` fields
6. No hardcoded `lang="en"` — layout must stay `lang="ar" dir="rtl"`
7. All edits go in `D:\medpuls\New folder\` (not parent `D:\medpuls\`)
8. `@ts-expect-error` in `free-medical-search.ts` is required for Vercel V3 strict typing — DO NOT REMOVE
9. Auth SSOT = `SupabaseAuthContext.tsx` only. The old mock `AuthContext.tsx` is dead.
10. No hardcoded years (e.g., "2026") in metadata or UI copy

---

## Phase History

### Phase 1 — Bug Audit & Foundation ✅ (2026-04-17)
- 10 critical runtime bugs fixed, build stabilized (0 errors, 0 TS errors)

### Phase 2 — Feature Completeness ✅ (2026-04-18)
- Bilingual landing page, USMLE 50 questions, auth guards on all tools

### Phase 3 — Polish & Production Readiness ✅ (2026-04-18)
- SEO `layout.tsx` metadata for all 16 routes, custom 404, loading skeletons

### Phase 4 — Integration Completeness ✅ (2026-04-18)
- Auth guards on translator/summarizer/notes, real PDF export in records, bilingual ECG/drug-checker

### Phase 5 — SEO & Error Handling ✅ (2026-04-18)
- OG/Twitter cards, `sitemap.ts`, `robots.ts`, `error.tsx` in all 15 route dirs

### Phase 6 — Final QA Gate ✅ (2026-04-18)
- `npm run lint` → 0 warnings, 0 errors
- `npm run build` → 0 errors, 39 routes, exit code 0
- Fixed 13 source files, configured ESLint `_`-prefix ignore, excluded test files from tsconfig

### Phase 7 — Legendary Redesign ✅ (2026-04-18)
- Mobile sidebar overlay drawer (RTL/LTR aware), fixed bottom nav
- Full dark/light mode CSS overhaul, FOUWT prevention
- +15 library sources (StatPearls, UWorld, Pathoma, Sketchy, Osmosis, OnlineMedEd, SCFHS, UAE MOHAP, Webteb, AnKing, LITFL, Radiopaedia, Divine Intervention, Saudi MOH, Egyptian Medical Syndicate)
- Build: 0 errors, 41 routes

### Phase 6.1 — Post-QA Mobile Fixes ✅ (2026-04-18)
- DevRoleToggle moved out of floating position into profile sections
- Deleted legacy `encyclopedia/layout.tsx` that crushed mobile layout
- Fixed React Hook rule violation in `simulator/page.tsx`

### Phase FSD — Feature-Sliced Design Refactor ✅ (2026-04-21)
- Built `src/core/` + `src/features/` architecture
- Nuked mock AuthContext → migrated fully to `SupabaseAuthContext.tsx`
- 0 TypeScript compilation errors via `npx tsc --noEmit`
- Non-negotiable: Do NOT revert to flat architecture

### Phase 8 — Enterprise Hardening & Zero-Cost RAG ✅ (2026-04-26)
- **Zero-Cost RAG:** `free-medical-search.ts` using `duck-duck-scrape` grounded to `site:nih.gov`, `site:uptodate.com`, etc.
- **Semantic Caching:** 24-hour LRU cache → duplicate queries cost 0 API calls, <5ms
- **Rate Limiter:** Sliding window in `src/middleware.ts` with `X-RateLimit-*` headers for DDoS protection
- **OSCE Evaluation Engine:** `POST /api/osce/evaluate` → Groq transcript analysis → `FinalReport.tsx` AI analysis button
- **CRITICAL:** `@ts-expect-error` in `free-medical-search.ts` is required for Vercel V3 — do not remove

---

## Phase 9 — Recommended Next Steps

1. **DDx Engine** `/ddx` — route+stub exists, plug in Groq RAG, 2–3 days
2. **Lab Results Interpreter** `/lab-results` — same pattern as drug-checker, 1 day
3. **PWA (Offline Mode)** — `next-pwa`, service worker for encyclopedia + flashcards, 1 day
4. **Saudi Exams Module** `/saudi-exams` — SCFHS, Emirates, Egypt boards, ~1 week
5. **SRS (Spaced Repetition)** `/srs` — SM-2 algorithm + daily streaks, ~1 week
6. **AppShell Fix** — `usePathname()` guard in root `layout.tsx` to hide shell on `/` and `/auth/*`
7. **Stripe Integration** `/pricing` — Free / Pro / Institution tiers
8. **OSCE Image Assets** — Add real images to `public/osce-assets/` for 30 stations
9. **Vision UI** — Surface the `/api/vision` route with an upload interface at `/ecg` or standalone page
10. **Collaborative Study Rooms** — Supabase Realtime multiplayer USMLE + shared decks
```

---

## 14) `AGENTS.md` كاملًا

```markdown
# Agent Persona and Core Instructions

You are acting as a **Distinguished Systems Architect and Principal Software Engineer** with decades of elite, top-tier industry experience. You possess encyclopedic knowledge of modern web/mobile ecosystems, database architecture, and scalable infrastructure (specifically Next.js, Flutter, and Supabase).

## Communication & Tone (STRICT)
- Be brutally honest, radically candid, and strictly analytical.
- Zero fluff, zero sugarcoating, and no unnecessary pleasantries.
- If the proposed logic, architecture, or code is flawed, inefficient, or an anti-pattern, TELL THE USER DIRECTLY. Dismantle bad ideas and immediately provide the superior, industry-standard solution.
- Treat the user as a highly capable peer who values raw truth over politeness.

## Coding & Execution Standards
1. **Absolute Completion (Zero Laziness):** Provide 100% complete, fully functional, and production-ready code. NEVER use placeholders like `// add logic here`, `// TODO`, or skip implementations. If it requires 100 lines, write 100 lines.
2. **Zero Hallucination:** Rely EXCLUSIVELY on verified, up-to-date official documentation. Never invent APIs, libraries, or methods. If something is impossible or deprecated, state it as a fact and pivot to the real solution.
3. **Elite Architecture:** Write code that is Modular, DRY, scalable, and adheres strictly to SOLID principles. Always anticipate edge cases, state management complexities, and performance bottlenecks.
4. **Bulletproof Security & Error Handling:** No silent failures. Implement advanced error catching, proper data validation, and robust security measures by default.

## Workflow For Every Request
1. **Architectural Review:** Briefly analyze the problem. Point out any critical flaws in the premise.
2. **Structural Blueprint:** Provide the optimal file/folder structure if applicable.
3. **Flawless Execution:** Output the exact, copy-pasteable code required to achieve perfection.

## Project Context
Review these documents before making architectural changes:
- Architecture & Environment Guidelines: README.md
- Database Topology & RLS: SUPABASE_SETUP.md
- Design System & Theming: DESIGN_REPORT.md
- Brainstorm & Conceptual Docs: PROJECT_BRAIN.md

## Tech Stack Specifics
- **Next.js:** Use App Router (Next.js 15.5+), React 19, and Tailwind 4. Implement strict Server Components by default; only use `use client` when interactivity or hooks are strictly required.
- **Supabase:** Strictly adhere to Row Level Security (RLS) policies. Maintain zero-trust interactions from the client.
- **Flutter:** (When applicable in subdirectories) Ensure state management is scalable, isolate heavy computations, and implement null safety strictly.

---

# AI Agent Guidelines for MedPulse

Any AI assistant (Claude Code, GitHub Copilot, Cursor, etc.) working on this repo MUST follow these rules.

## Branch Strategy
- NEVER commit to `main` directly — it is protected
- Create branches with these prefixes ONLY:
  - `feature/` for new features
  - `fix/` for bug fixes
  - `chore/` for maintenance/tooling
  - `refactor/` for refactoring
  - `docs/` for documentation
- NEVER use auto-generated names like `copilot/worktree-`
- Branch names: lowercase kebab-case, max 5 words

## Before Every Commit
Run locally and confirm SUCCESS:
```bash
npm run build
npm run lint
```
If either fails, FIX before committing. Do not commit broken code.

## TypeScript Rules
- Avoid `any` — use `unknown`, generics, or specific types
- If `any` is truly necessary, add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a comment explaining why
- All exported functions need explicit return types where reasonable

## Pull Request Requirements
- One logical change per PR
- PR title follows Conventional Commits: `<type>(<scope>): <description>`
  - Examples: `feat(auth): add magic link login`, `fix(dashboard): resolve loading state`
- Wait for Vercel preview AND GitHub Actions CI to succeed before requesting merge
- Never bypass branch protection

## Forbidden Actions
- Direct pushes to `main`
- Force pushes to shared branches
- Committing `.env`, secrets, API keys, or credentials
- Auto-generated branch names (copilot/worktree-*, etc.)
- Disabling tests, type checks, or linters to "make it pass"
- Modifying files outside the scope of the current task
```

---

## 15) `CLAUDE_SYNC.md` كاملًا

```markdown
# MedPulse AI - Project State & AI Handover Document

> **ATTENTION AI AGENTS (Claude, Copilot, etc.):**
> Read this file entirely before executing any workspace modifications, running tests, or initiating standard routines. This document outlines the absolute truth of the architecture, resolved technical debt, and current state of the application as of **April 2026**.

## 1. Project Core & Vision
- **Project Name:** MedPulse AI
- **Domain:** Clinical Simulation, Continuing Medical Education (CME), OSCE Simulator, MDT AI.
- **Creator/Architect:** Hasanain Salah · حسنين صلاح.
- **Framework:** Next.js 15.5+ (App Router).
- **Styling:** Tailwind CSS with Apple-tier "Glassmorphism" UI standards.
- **Localization:** Bilingual (Arabic `ar` & English `en`), RTL/LTR support via `src/core/i18n/LanguageContext`.

## 2. Architecture & Folder Structure (FSD-Inspired)
The project was recently refactored to enforce modularity and solve cross-import circular dependencies.
- `src/app/` -> App Router pages and API routes.
- `src/components/` -> Dumb/Presentational UI components (e.g., Footer, Headers).
- `src/core/` -> Core business logic, contexts, and providers (e.g., `auth/`, `i18n/`).
- `src/hooks/` -> Custom React hooks abstracted away from components.
- `src/types/` -> Global TypeScript definitions (`auth.types.ts`, `medical.types.ts`).
- `src/lib/` -> Utility classes, database configs (Supabase), and external services (Groq LLM).

## 3. TypeScript & ESLint Rules (CRITICAL)
- **Zero Build Errors:** The `npm run build` process is currently green (0 errors). Maintaining this state is mandatory.
- **Simulator Bypass:** In `src/app/simulator/[stationId]/page.tsx`, we have intentionally placed explicit `/* eslint-disable @typescript-eslint/no-explicit-any */` top-level comments. **DO NOT** attempt to automatically refactor these without manual human confirmation, as it previously broke the Vercel CI/CD pipeline due to highly complex nested types from the external AI stream.
- **Imports:** Always use absolute imports (`@/core/`, `@/types/`, etc.) instead of relative paths (`../../`) whenever possible.

## 4. Recently Added Features (Done & Live)
1. **Pricing Page (`src/app/pricing/page.tsx`):**
   - 3-tier subscription model (Basic, Pro, Enterprise).
   - Monthly/Yearly toggles.
   - States explicitly that Plans are **Free during Beta** as per product strategy.
2. **Privacy Policy (`src/app/privacy/page.tsx`):**
   - Professional bilingual medical data security policy (HIPAA/GDPR compliance statements).
3. **About Us (`src/app/about/page.tsx`):**
   - Company vision, 4-pillar architecture overview, builder attribution (Hasanain Salah).
4. **Footer Refactor:**
   - Connected all dead links (`#`) to their respective valid pages (`/privacy`, `/about`, `/pricing`).

## 5. Deployment Pipeline
- **Host:** Vercel (Production URL: https://medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app ).
- **Build Command:** `npm run build` (runs Next.js strict TS/ESLint checks).
- **Rule:** Before any Git push, you MUST verify the build locally using `npm run build`.

## 6. How to Continue Work
When resuming work, focus on the feature requested by the user but always respect the boundaries of the `src/core/` and the UI standards (glass cards, `medpulse-card`, etc.).
If adding new pages, always implement the `useLanguage()` hook for `dir={dir}`.
```

---

## 16) `AUDIT.md` كاملًا

```markdown
# Phase 6 Forensic Audit — MedPulse AI
Generated: 2026-04-25

---

## Layout Files (17 total — should be 2)

| File | Lines | Issue |
|------|-------|-------|
| `src/app/layout.tsx` | 111 | ROOT — renders Sidebar + Navbar on every page including landing |
| `src/app/admin/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/calculators/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/dashboard/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/drug-checker/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/ecg/layout.tsx` | 6 | **Deprecated "Gemini 2.0 Flash" in metadata** — FIX |
| `src/app/library/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/mdt/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/notes/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/professors/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/profile/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/progress/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/records/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/simulator/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/summarizer/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/translator/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |
| `src/app/usmle/layout.tsx` | 6 | Metadata only (passthrough) — KEEP |

Note: the 16 per-route layouts are metadata-only (6 lines each). They are valid Next.js SEO optimization, not problematic. The real issue is the root layout.

### Architecture Problem
Root layout renders `<Navbar />` + `<Sidebar />` on EVERY page including:
- Landing page `/` (should have NO shell)
- Auth pages `/auth/*` (should have NO shell)
Fix: `AppShell` client component that uses `usePathname()` to conditionally show/hide the shell.

---

## Navigation Components

| File | Role | Action |
|------|------|--------|
| `src/components/layout/Sidebar.tsx` | Desktop sidebar (hidden on mobile) | KEEP + fix |
| `src/components/Sidebar.tsx` | Re-export only | KEEP (thin wrapper) |
| `src/components/Navbar.tsx` | Mobile top bar + drawer + bottom tabs | KEEP + fix |

The Sidebar and Navbar are complementary (different CSS breakpoints), not true duplicates.
Real problem: root layout renders both on pages that should have no shell.
Fix: wrap in `AppShell` that checks current path.

---

## Deprecated Marketing Text — 8 instances in 6 files

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/app/layout.tsx` | 10,22,37 | "Clinical Intelligence Platform 2026" | Remove "2026" |
| `src/app/layout.tsx` | 11,23,38 | "Powered by Gemini 2.0 Flash" | Remove Gemini refs |
| `src/app/layout.tsx` | 12 | "Gemini" keyword | Remove from keywords |
| `src/app/ecg/layout.tsx` | 4 | "powered by Gemini 2.0 Flash" | Fix description |
| `src/components/Navbar.tsx` | 152 | "AI ELITE" branding tag | Remove |
| `src/components/Footer.tsx` | 23 | "إرشادات 2026" in disclaimer | → "إرشادات سريرية" |
| `src/app/api/medical-query/route.ts` | 13 | "April 2026" + "ELITE BOARD-CERTIFIED" | Fix |
| `src/app/api/medical-query/route.ts` | 21,26 | "ESC 2026", "2026 Guidelines" | Fix |
| `src/app/library/[sourceId]/page.tsx` | 524 | "2026 Guidelines Summary" | Fix |

---

## Spelling Errors ("Hasanain" → "Hassanin")

| File | Line | Text |
|------|------|------|
| `src/components/Footer.tsx` | 91 | "Hasanain salah" |
| `src/app/about/page.tsx` | 68 | "Hasanain salah" |
| `src/app/encyclopedia/[specialty]/page.tsx` | 787 | "Hasanain Salah Noori" |

---

## Footer Link Issues

| Label (Arabic) | Label (English) | href | Issue |
|----------------|-----------------|------|-------|
| سياسة الخصوصية | Privacy Policy | /privacy | ✓ OK |
| شروط الاستخدام | About Us | /about | Arabic = "Terms", English = "About" — mismatch |
| تواصل معنا | Pricing | /pricing | Arabic = "Contact Us", English = "Pricing" — mismatch |

Fix: Unify label → "About Us" / "من نحن" and "Pricing" / "التسعير"

---

## Landing Page Status
- `app/page.tsx` already IS a proper landing page ✓
- Shows landing to visitors, redirects logged-in users to /dashboard ✓
- BUT root layout applies shell to it (Sidebar + Navbar visible) — needs AppShell fix

---

## Files NOT to Touch
- `data/usmle-questions/` — question bank
- `src/app/simulator/` — OSCE scenarios
- `src/app/admin/` — admin functionality
- Arabic translations in `src/lib/translations.ts`
```

---

## 17) `EXECUTION_REPORT.md` كاملًا

```markdown
# EXECUTION_REPORT.md — Phase 6: Final QA Gate

**Date:** 2026-04-18
**Executed by:** Claude Sonnet 4.6 (autonomous)
**Project:** MedPulse AI — `D:\medpuls\New folder\`
**Stack:** Next.js 15.5, React 19, Tailwind CSS 4, TypeScript, Supabase, Groq

---

## Gate Results Summary

| Gate | Check | Result |
|------|-------|--------|
| Technical | `npm run build` | ✅ PASS — 0 errors, 39 routes |
| Technical | `npm run lint` | ✅ PASS — 0 warnings, 0 errors |
| Technical | TypeScript (`tsc --noEmit`) | ✅ PASS — 0 errors (test files correctly excluded) |
| Technical | `@types/jest` installed | ✅ PASS |
| Functional | All 39 routes compiled | ✅ PASS |
| Functional | All 13 API routes compiled | ✅ PASS |
| Functional | Static pages generated (39/39) | ✅ PASS |
| Functional | Sitemap at `/sitemap.xml` | ✅ PASS |
| Functional | Robots at `/robots.txt` | ✅ PASS |
| Functional | 404 (`/_not-found`) | ✅ PASS |
| UI/UX | Auth-guarded routes present | ✅ PASS — `/mdt`, `/simulator`, `/usmle`, `/drug-checker`, `/ecg`, `/calculators`, `/translator`, `/summarizer`, `/notes` |
| UI/UX | Bilingual AR/EN support | ✅ PASS |
| UI/UX | RTL layout (`dir="rtl"`) | ✅ PASS |
| UI/UX | SEO metadata | ✅ PASS — all 16 route `layout.tsx` |
| UI/UX | Error boundaries | ✅ PASS — `error.tsx` in all 15 dirs |
| UI/UX | Loading skeletons | ✅ PASS — `/dashboard`, `/progress`, `/records` |

---

## Fixes Applied in Phase 6

### 1. ESLint Configuration
- File: `eslint.config.mjs`
- Added `argsIgnorePattern`, `varsIgnorePattern`, `caughtErrorsIgnorePattern` matching `^_`
- Excluded `src/__tests__/**` from lint

### 2. TypeScript Configuration
- File: `tsconfig.json`
- Added `src/__tests__` to `exclude` array — eliminates 50+ false TS2582/TS2304 errors
- Installed `@types/jest` as dev dependency

### 3. Unused Variable Cleanup (13 files fixed)

| File | Fix |
|------|-----|
| `src/app/calculators/page.tsx` | Removed unused `useEffect`, `useRouter`, `router`, `user` |
| `src/app/dashboard/page.tsx` | Removed unused `useEffect`, `useRouter`, `router`, `user` |
| `src/app/drug-checker/page.tsx` | Removed unused `useEffect`, `useRouter`, `router`, `user` |
| `src/app/ecg/page.tsx` | Removed unused `useEffect`, `useRouter`, `router` |
| `src/app/library/page.tsx` | Removed unused `user` from `useSupabaseAuth()` |
| `src/app/mdt/page.tsx` | Removed unused `useRouter`, `router`, `user` |
| `src/app/notes/page.tsx` | Removed unused `useEffect`, `useRouter`, `router` |
| `src/app/summarizer/page.tsx` | Removed unused `useEffect`, `useRouter`, `router`, `user` |
| `src/app/translator/page.tsx` | Removed unused `useEffect`, `useRouter`, `router` |
| `src/app/usmle/page.tsx` | Removed unused `useEffect`, `useRouter`, `router`, `user` |
| `src/app/simulator/page.tsx` | Renamed `isSpeaking` → `_isSpeaking`, removed `useRouter`/`router`/`user` in AuthGuard, added `eslint-disable-next-line` for mount-only `useEffect` |
| `src/components/Sidebar.tsx` | Removed unused `COLOR_MAP` and `colors` |
| `src/app/encyclopedia/[specialty]/page.tsx` | Prefixed `GLOBAL_MEDICAL_SOURCES` → `_GLOBAL_MEDICAL_SOURCES` |

---

## Final Build Output

```
✓ Compiled successfully in 37.6s
✓ Linting and checking validity of types
✓ Generating static pages (39/39)
```

Routes: 39 total (26 static, 13 dynamic/API)
Middleware: 33.2 kB
Shared JS: 102 kB
Exit code: 0

---

## Phase 6.1: Post-QA Mobile UI & Lint Fixes
- **Mobile Navigation Overlap Fix:** Moved DevRoleToggle from a fixed floating position into the user profile section inside Navbar.tsx (mobile drawer) and Sidebar.tsx (desktop).
- **Encyclopedia Mobile Layout Fix:** Deleted legacy `src/app/encyclopedia/layout.tsx` which was forcing a desktop-only sidebar layout.
- **Simulator Lint Fix:** Fixed a React Hook rule violation (useMemo called conditionally) in `src/app/simulator/page.tsx`.
- **Build Status:** 0 errors, 41 clean compiled routes.

---

## 2026-04-21 — Architectural Refactor (Phase FSD-1)
- Consolidated global contexts into `src/core/providers/AppProviders.tsx` to stop breaking RSC caching in `layout.tsx`.
- Deprecated/Removed AuthProvider to exclusively rely on SupabaseAuthContext for single source of truth.
- Installed `server-only` to physically prevent leaking AI and Database logic (applied to `pinecone.ts`).
- Root layout is now thinner and correctly leverages RSC features.

## 2026-04-21 — FSD Implementation (Phase FSD-2)
- Scaffolded strict Feature-Sliced Design (FSD) inside `src/features/`.
- Migrated generic global components (ThemeProvider, ErrorBoundary, LanguageToggle) to `src/core/ui` to reduce `src/components` bloat.
- Prepared modular isolation spaces for usmle, osce, ddx, mdt, ecg, drug-checker.

## 2026-04-21 — Build Fixes (Phase FSD-2.1)
- Successfully updated TS imports across all components to point to `src/core/ui`, resolving 8 catastrophic build errors.
- Verified zero compilation errors via strict `npx tsc --noEmit` pass.

## 2026-04-21 — Auth Consolidation (Phase FSD-3)
- Extracted all Authentication contexts (SupabaseAuthContext, useAuth, auth.types) out of standard components/hook directories.
- Established `src/core/auth/` as the immutable Single Source of Truth for identity management.
- Ran global regex migration across `src/` enforcing the new paths for 50+ dependent files.

## 2026-04-21 — AI Infrastructure Security (Phase FSD-4)
- Isolated critical AI logic (`pinecone.ts`, `mdt-agents`, `mdt-prompts`, `grok.ts`) into `src/core/ai/` avoiding client bundle leaks.
- Updated 20+ API routes and service hooks automatically to consume from the protected `core` layer.
- Project maintains 100% build integrity (0 TS errors).

## 2026-04-21 — Library & Features Phase (Completed)
- Migrated `lib/ncbi`, `lib/medicalSources`, and `lib/osceStations` straight to `features/`.
- Enforced robust folder structure for all complex data services resolving dozens of cross-domain imports.
- Architectural Refactor is complete. Minimal legacy technical debt remains within bounded contexts.
```

---

## 18) `QA_REPORT.md` كاملًا

```markdown
# MedPulse AI — QA Report
**Date:** 2026-04-19
**Build:** Clean (0 errors, 0 warnings)
**Pages:** 42 static/dynamic routes

---

## Page Audit Results

| Page | HTTP | Content | AI | Notes |
|------|------|---------|-----|-------|
| `/` | ✅ 200 | ✅ Landing page | — | Fixed: was redirecting to /dashboard via mock auth |
| `/dashboard` | ✅ 200 | ✅ UI renders | — | Mock data shown; needs real Supabase data |
| `/encyclopedia` | ✅ 200 | ✅ 13 specialties | — | Working |
| `/professors` | ✅ 200 | ✅ 6 professors | ✅ Groq streaming | Fixed: mock auth spinner infinite loop |
| `/mdt` | ✅ 200 | ✅ Debate UI | ✅ Groq 3-agent | Fixed: loading gate removed |
| `/simulator` | ✅ 200 | ✅ Station grid | ✅ Groq patient+examiner | Built: [stationId] page |
| `/usmle` | ✅ 200 | ✅ Questions | — | Partial — no AI explanation yet |
| `/summarizer` | ✅ 200 | ✅ Text input | ✅ Groq streaming | Fixed: loading gate removed |
| `/calculators` | ✅ 200 | ✅ 8 calculators | — | Fixed: auth gate removed |
| `/drug-checker` | ✅ 200 | ✅ Drug chips + check | ✅ Groq streaming | Fixed: loading gate removed |
| `/ecg` | ✅ 200 | ✅ Text presets + upload | ✅ Groq streaming | Fixed: loading gate removed |
| `/notes` | ✅ 200 | ✅ Editor + templates | ✅ Groq | Fixed: loading gate removed |
| `/translator` | ✅ 200 | ✅ Bidirectional | ✅ Groq | Fixed: loading gate removed |
| `/records` | ✅ 200 | ✅ LocalStorage grid | — | Working |
| `/library` | ✅ 200 | ✅ 308 sources, 20/page | — | Paginated, clickable |
| `/progress` | ✅ 200 | ✅ Charts + streaks | — | Working |
| `/profile` | ✅ 200 | ✅ Settings form | — | Shows login prompt if no auth |

---

## Root Cause Analysis — All Blank Pages

**Pattern:** `if (loading) return null` on pages using `useSupabaseAuth()`.
When Supabase connection is slow (or misconfigured), `loading` stays `true` indefinitely.
**Fixed in:** calculators, drug-checker, ecg, summarizer, notes, translator, mdt, professors (7 pages).

---

## AI Provider Status

| Route | Provider | Model | Status |
|-------|----------|-------|--------|
| `/api/ai/professor` | Groq | llama-3.3-70b | ✅ Per-persona prompts |
| `/api/mdt-debate` | Groq | llama-3.3-70b | ✅ 3-agent streaming |
| `/api/osce/chat` | Groq | llama-3.3-70b | ✅ Patient + examiner modes |
| `/api/drug-interaction` | Groq | llama-3.3-70b | ✅ Interaction analysis |
| `/api/ecg-analysis` | Groq | llama-3.3-70b | ✅ Systematic ECG |
| `/api/medical-query` | Groq | llama-3.3-70b | ✅ General medical Q&A |
| `/api/medical-summarizer` | Groq | llama-3.3-70b | ✅ Structured summary |
| `/api/translate` | Groq | llama-3.3-70b | ✅ Medical translation |

**Note:** All routes fall back to Groq (`GROQ_API_KEY`). Grok (`XAI_API_KEY`) is supported in `lib/ai/grok.ts` but not yet wired to individual routes.

---

## What Was Built / Fixed (Phases 1 & 2)

### ✅ Fixed
1. `/calculators` — removed auth gate (was 100% blank)
2. `/professors` — replaced mock auth with Supabase auth; no more infinite spinner
3. `/drug-checker` — removed Supabase loading gate
4. `/ecg` — removed Supabase loading gate
5. `/summarizer` — removed loading gate
6. `/notes` — removed loading gate
7. `/translator` — removed loading gate
8. `/mdt` — removed loading gate
9. `/` Landing page — replaced mock auth redirect with Supabase auth (guests see landing)
10. Navigation — unified Arabic labels across Navbar + Sidebar
11. Library — pagination (20 items / Load More), clickable cards with modal preview
12. `AI-Verified Sources` badge removed from mobile drawer

### ✅ Built New
1. `src/app/simulator/[stationId]/page.tsx` — full OSCE simulation (Brief → Chat → Results)
2. `src/components/Footer.tsx` — medical disclaimer + AI attribution
3. `src/app/api/ai/professor/route.ts` — 6 specialist personas with streaming
4. `src/lib/ai/grok.ts` — xAI Grok client + Groq fallback + rate limiter + sanitizer
5. `src/lib/medicalSources.ts` — added `slug` field; 14 textbooks linkable

---

## Remaining Items (P2/P3)

| Item | Priority | Effort |
|------|----------|--------|
| Dashboard — real metrics from Supabase | P2 | Medium |
| Calculators — add GCS, Anion Gap, Osmolality (3 missing) | P2 | Small |
| USMLE — AI explanation for wrong answers | P2 | Medium |
| Wire `XAI_API_KEY` (Grok) to all AI routes | P2 | Small |
| 3D anatomy hero (Three.js / Spline) | P3 | Large |
| Spaced repetition / XP system | P3 | Large |
| Voice OSCE (Web Speech API) | P3 | Medium |
| Supabase — seed real OSCE attempts table | P2 | Small |
| Algolia / pgvector semantic search | P3 | Large |

---

## Security Checklist

- [x] No API keys in client-side code
- [x] All AI calls via `/api/*` server routes only
- [x] `lib/ai/grok.ts` has input sanitization (prompt injection)
- [x] `lib/ai/grok.ts` has in-memory rate limiter (20 req/min/IP)
- [x] Medical disclaimer appended to all AI responses
- [x] `.gitignore` covers `.env.local`
- [ ] Zod validation on API inputs (pending)
- [ ] CSRF protection (Next.js default: enabled for API routes)

---

## Build Status

```
✓ Compiled successfully
✓ 0 TypeScript errors
✓ 0 ESLint errors
✓ 42 routes generated
```
```

---

## 19) `DESIGN_REPORT.md` كاملًا

```markdown
# MedPulse Design System - Sovereign Execution Report

## Phase 1: Color System (3D-Aware)
- Implemented dual-mode (Light/Dark) theme using `--background-0`, `--background-1`, etc.
- Configured brand colors: Medical Indigo `#5B6CFF`, Clinical Violet `#8B5CF6`, Vital Cyan `#06B6D4`.
- Added dynamic glassmorphism surface layers.

## Phase 2: 3D Depth System
- Added z-axis hierarchy box shadows.
- Level 0 to 4 elevation scales applied.
- Integrated glass effects with backdrop filters.

## Phase 3: Typography System
- Custom font stacks logic applied.
- Type scale defined globally.

## Phase 4: Spacing & Layout
- Established 8pt grid logic.
- Container padding adjusted dynamically.

## Phase 5: Components
- Standard cards, feature cards, and button variants adapted with custom CSS.

## QA Checklist
- [x] Dark mode richness validated
- [x] Light mode warmth verified
- [x] 3D depth system layered correctly
- [x] Responsive sizes implemented

Phase 1 to 4 configured in globals.css.
Phase 5 components (Navbar & Sidebar) refactored with glassmorphism, depth classes, logic transitions, & 3D hierarchy.
Phase 13 (Dashboard Cards) refactored for Premium Glass/Level elevations + Typography fluid classes.
Phase 5 AI Chat Interface completed (Professors page). Floating frosted modal, dynamic brand gradient bubbles, pulsing thinking anims.
Phase 5 and Elements continued: MDT logic, Clinical Calculators, and Notes Generator were fully refactored to strict glassmorphism and depth parameters.
Phase 6: Auth modules (Login/Register) & Drug Checker meticulously designed with the new Apple-tier 3D UI, variable gradients, glass styling, and precise typography.

Apple-tier 3D design applied to:
- [x] src/app/encyclopedia/page.tsx
- [x] src/app/ecg/page.tsx
- [x] src/app/library/page.tsx
- [x] src/app/summarizer/page.tsx
- [x] src/app/simulator/page.tsx
- [x] src/app/translator/page.tsx
```

---

## 20) `SUPABASE_SETUP.md` كاملًا

```markdown
# MedPulse AI — Database Implementation Plan

## Architecture: Supabase (PostgreSQL + Auth + RLS)

### Tables:
1. **profiles** — بيانات المستخدمين المسجلين
2. **medical_sources** — مكتبة المصادر الطبية (200+ مصدر)
3. **user_progress** — تقدم المستخدم وجلسات التعلم
4. **visitor_logs** — تتبع الزوار والإحصائيات
5. **user_bookmarks** — مفضلة المصادر لكل مستخدم
6. **user_sessions** — جلسات العمل التفصيلية
```

> ملاحظة: الجدول السابع `notifications` مضاف عبر migration `create_notifications_table.sql`.

---

## 21) `OSCE_PHASE_COMPLETE.md` كاملًا

```markdown
# OSCE Phase 7 — Completion Report

## Build Status
✅ `npm run build` — PASSES (no errors, warnings only on pre-existing files)

## Stations Created — 30 Total

| # | File | Title | Category |
|---|------|-------|----------|
| 1 | chest-pain-stemi-001.json | 47M central chest pain | history-taking |
| 2 | headache-sah-002.json | 38F thunderclap headache | history-taking |
| 3 | sob-pe-003.json | 55F SOB post-flight | history-taking |
| 4 | abdominal-pain-appendicitis-004.json | 22M RIF pain | history-taking |
| 5 | weight-loss-malignancy-005.json | 68M weight loss | history-taking |
| 6 | dysphagia-oesophageal-ca-006.json | 60M dysphagia | history-taking |
| 7 | polyuria-t1dm-007.json | 16F polyuria/DKA | history-taking |
| 8 | pv-bleeding-ectopic-008.json | 28F PV bleeding | history-taking |
| 9 | cardiovascular-exam-mr-009.json | Mitral regurgitation exam | focused-examination |
| 10 | respiratory-exam-pneumonia-010.json | RLL pneumonia exam | focused-examination |
| 11 | neurological-exam-stroke-011.json | Left MCA stroke exam | focused-examination |
| 12 | abdominal-exam-hepatomegaly-012.json | Hepatomegaly exam | focused-examination |
| 13 | breaking-bad-news-cancer-013.json | Lung cancer diagnosis | breaking-bad-news |
| 14 | consent-laparoscopic-cholecystectomy-014.json | Lap chole consent | informed-consent |
| 15 | angry-patient-delayed-results-015.json | De-escalation + prostate Ca | communication-skills |
| 16 | confidentiality-15yo-016.json | Gillick competence | ethical-dilemma |
| 17 | interpreter-needed-017.json | Language barrier | communication-skills |
| 18 | domestic-violence-screen-018.json | DVA screening | communication-skills |
| 19 | anaphylaxis-management-019.json | Penicillin anaphylaxis | emergency-management |
| 20 | dka-management-020.json | DKA protocol | emergency-management |
| 21 | acute-asthma-severe-021.json | Life-threatening asthma | emergency-management |
| 22 | tonic-clonic-seizure-022.json | Status epilepticus | emergency-management |
| 23 | ecg-interpretation-stemi-023.json | Inferior STEMI + RV | data-interpretation |
| 24 | abg-interpretation-mixed-024.json | Mixed acid-base | data-interpretation |
| 25 | cxr-interpretation-pneumothorax-025.json | Tension pneumothorax | data-interpretation |
| 26 | explain-lumbar-puncture-026.json | LP consent | procedure-explanation |
| 27 | explain-colonoscopy-027.json | Colonoscopy consent | procedure-explanation |
| 28 | explain-mri-claustrophobic-028.json | MRI for claustrophobic | procedure-explanation |
| 29 | smoking-cessation-029.json | 5 As brief intervention | communication-skills |
| 30 | end-of-life-discussion-030.json | Goals of care | communication-skills |

## New Files Created

### Library
- `src/lib/osce/types.ts` — Full type system (PatientPersona, OSCEStation, OSCESession)
- `src/lib/osce/patient-engine.ts` — Anti-hallucination patient prompt builder
- `src/lib/osce/investigation-detector.ts` — Keyword-based investigation request detection
- `src/lib/osce/rubric-tracker.ts` — Live scoring with keyword + AI detection
- `src/lib/osce/session-manager.ts` — localStorage session persistence
- `src/lib/osce/station-loader.ts` — Server-side JSON station loader with cache
- `src/lib/ai/grok.ts` — `askGrok()` wrapper for rubric AI evaluation

### API Routes
- `src/app/api/osce/turn/route.ts` — Single-turn patient response endpoint
- `src/app/api/osce/station/[id]/route.ts` — Fetch station by ID
- `src/app/api/osce/stations/route.ts` — List all new-format station metadata

### UI Components
- `src/components/osce/CountdownTimer.tsx` — Animated countdown
- `src/components/osce/InvestigationCard.tsx` — Lab table + image result
- `src/components/osce/RubricSidebar.tsx` — Live three-domain rubric
- `src/components/osce/StationBriefing.tsx` — Pre-station reading phase
- `src/components/osce/FinalReport.tsx` — Post-station score report

### Data
- `data/osce-stations/*.json` — 30 clinically accurate station files

### Updated
- `src/app/simulator/[stationId]/page.tsx` — Dual-mode: old format + new Phase 7 layout
- `src/app/simulator/page.tsx` — Station library with tabs (All / PLAB2 New / Classic)

## Architecture Decisions

1. **Dual-mode simulator**: Old stations (IM-01, CARD-01) use `/api/osce/chat`. New stations use `/api/osce/turn` + three-column layout.
2. **Client-side live rubric**: Keyword and investigation-requested detection runs instantly client-side. AI-evaluation items are deferred to session end.
3. **Investigation detection**: `InvestigationDetector.detectMultiple()` parses student messages for request verbs + investigation keywords.
4. **Anti-hallucination**: Patient prompt locks identity (name, age) in ALL-CAPS headers and repeats at top and bottom. `doNotVolunteer[]` is explicitly listed. Medical terminology forbidden.
5. **Session persistence**: localStorage under `osce_v2_session_*` keys, separate from old `osce_session_*` keys.

## Known Issues / Limitations

1. **Investigation images**: `/osce-assets/*.png` paths referenced in JSON files need actual images in `public/osce-assets/`. Currently renders gracefully without them.
2. **AI rubric evaluation speed**: Items with `detectionMethod: "ai-evaluation"` each make an API call. Full AI evaluation is not yet wired into the end-of-session flow.
3. **Examiner feedback at session end**: The `FinalReport` shows rubric progress from keyword detection only. Adding full AI-based examiner feedback is the recommended next step.
4. **Right-to-left (RTL)**: New-format stations are English-only. Old stations support Arabic.
```

---

## 22) `PHASE_6_COMPLETE.md` كاملًا

```markdown
# Phase 6 Completion Report
**Date:** 2026-04-25
**Build Status:** ✅ 0 errors · 62 pages

---

## Files Created (14 new files)

| File | Purpose |
|------|---------|
| `src/components/layout/AppShell.tsx` | Single conditional shell — hides nav on `/` and `/auth/*` |
| `src/lib/ai/medical-ai.ts` | Medical AI service layer with RAG + safety layer |
| `src/lib/ai/rag.ts` | RAG retrieval from medical KB |
| `src/lib/ai/validators.ts` | Response validation + emergency detection + disclaimer injection |
| `src/lib/srs/sm2.ts` | SM-2 spaced repetition algorithm |
| `src/app/srs/page.tsx` | Anki-style flashcard SRS with localStorage persistence |
| `src/app/reasoning/page.tsx` | Step-by-step clinical reasoning trainer |
| `src/app/anatomy/page.tsx` | Anatomy atlas (scaffold + encyclopedia links) |
| `src/app/image-bank/page.tsx` | CC-licensed medical image bank |
| `src/app/procedures/page.tsx` | Clinical procedures guide (central line, LP, ABG) |
| `src/app/saudi-exams/page.tsx` | Saudi medical exams prep hub (SLE, SMLE, Arab Board) |
| `data/medical-kb/guidelines/acc-aha-cad-2023.json` | ACC/AHA CAD guideline KB entry |
| `data/medical-kb/guidelines/ada-diabetes-2024.json` | ADA Diabetes guideline KB entry |
| `data/medical-kb/lab-references/normal-ranges.json` | Normal lab range reference |

---

## Files Modified (12 files)

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Removed Gemini/2026 metadata, uses AppShell, author credited as Hassanin Salah |
| `src/app/ecg/layout.tsx` | Removed "Gemini 2.0 Flash" from description |
| `src/app/api/medical-query/route.ts` | Fixed system prompt: removed ELITE/2026/fabrication risks |
| `src/app/library/[sourceId]/page.tsx` | "2026 Guidelines Summary" → "Clinical Guidelines Summary" |
| `src/app/encyclopedia/[specialty]/page.tsx` | "Hasanain Salah Noori" → "Hassanin Salah" |
| `src/app/about/page.tsx` | "Hasanain salah" → "Hassanin Salah" |
| `src/components/Footer.tsx` | Fixed disclaimer, link labels, author name |
| `src/components/Navbar.tsx` | Removed "AI ELITE" branding |
| `src/components/layout/Sidebar.tsx` | Added Learning Tools section with 6 new routes + new icons |
| `src/core/i18n/translations.ts` | Added learningTools section + 6 new nav keys (EN + AR) |
| `AUDIT.md` | Phase 6 audit report |

---

## Architecture Changes

### Before
```
app/layout.tsx → <AppProviders> + <Navbar> + <Sidebar> + <Footer>
```
Applied to ALL pages including `/` (landing) and `/auth/*`

### After
```
app/layout.tsx → <AppProviders> + <AppShell>
AppShell → conditionally renders nav based on pathname
  - / and /auth/* → no shell
  - all other routes → <Navbar> + <Sidebar> + main + <Footer>
```

---

## Deprecated Content Removed

| Item | Result |
|------|--------|
| "Powered by Gemini 2.0 Flash" | ✅ GONE — 0 instances |
| "AI ELITE" / "MedPulse AI ELITE" | ✅ GONE — 0 instances |
| "إرشادات 2026" (fictional date) | ✅ GONE — 0 instances |
| "Hasanain"/"Hassanain" misspelling | ✅ GONE — 0 instances |
| "AI ELITE" Navbar branding | ✅ GONE — removed |

---

## Navigation Verification
- Single `data-nav-instance="app-shell"` attribute in AppShell.tsx
- Landing page (`/`) renders with NO sidebar/navbar
- Auth pages (`/auth/*`) render with NO sidebar/navbar
- All app pages render with exactly 1 nav instance
- JS console check: `document.querySelectorAll('[data-nav-instance]').length === 1`

---

## New Routes Added (Phase 6.6)

| Route | Feature |
|-------|---------|
| `/srs` | Spaced Repetition flashcards (SM-2 algorithm, localStorage) |
| `/reasoning` | Clinical Reasoning Trainer (step-by-step case progression) |
| `/anatomy` | Anatomy Atlas (organ system browser + encyclopedia links) |
| `/image-bank` | Medical Image Bank (CC-licensed, filterable) |
| `/procedures` | Clinical Procedures (central line, LP, ABG with steps) |
| `/saudi-exams` | Saudi Medical Exam Prep (SLE, SMLE, Arab Board, Saudi Board) |

---

## Build Results
```
✓ Compiled successfully
✓ Type check: 0 errors
✓ 62 pages generated (was 56, +6 new pages)
Warnings: 5 pre-existing (not introduced by Phase 6)
```

---

## Remaining Known Issues
1. `/about/page.tsx` — unused `Image` import (pre-existing warning)
2. `/ecg/page.tsx` — missing `description` in useEffect deps (pre-existing)
3. `/radiology/page.tsx` — `<img>` instead of Next Image (pre-existing)
4. Anatomy Atlas — 3D models not yet embedded (marked "Coming Soon")
5. Image Bank — actual images not seeded, shows placeholder previews
6. `data/medical-kb/` — only 3 seed files; needs expansion with full guideline library
```

---

## 23) `README.md` كاملًا

```markdown
# MedPulse AI

**Arabic Clinical Intelligence Platform** — A comprehensive bilingual medical education platform built with Next.js 15, TypeScript, and Tailwind CSS.

**Built by Hasanain Salah · حسنين صلاح**

## Features

- **USMLE Question Bank** — 5,300+ Step 1 & Step 2 CK board-style questions with AI explanations
- **OSCE Simulator** — Realistic clinical scenarios with patient interactions and rubric scoring
- **AI Professors** — Groq-powered medical tutors for Q&A
- **Clinical Tools** — Drug checker, ECG analyzer, differential diagnosis, medical calculator
- **Medical Encyclopedia** — Bilingual (English/Arabic) clinical reference
- **MDT Debates** — Multi-disciplinary team case discussions
- **Flashcards (SRS)** — Spaced repetition learning system
- **Progress Tracking** — Analytics dashboard with specialty-level breakdown

## Stack

- **Framework**: Next.js 15 App Router
- **UI**: Tailwind CSS 4 + shadcn/ui
- **AI**: Groq (primary, llama-3.3-70b)
- **Auth/DB**: Supabase
- **Language**: TypeScript 5

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

```env
GROQ_API_KEY=        # Groq API key (primary)
XAI_API_KEY=         # xAI Grok (legacy fallback)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Medical Disclaimer

This platform is for **educational purposes only**. It does not replace consultation with a licensed physician, diagnosis, or treatment.

---

© MedPulse AI · Built by Hasanain Salah · حسنين صلاح · Based on WHO · NEJM · ACC/AHA · ESC guidelines
```

---

*انتهى — هذا الملف هو المرجع الموحَّد الكامل للمشروع. أي وكيل أو محرر يفتح المشروع يقرأ هذا الملف فقط ويعرف كل شيء.*
