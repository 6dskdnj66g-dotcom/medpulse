# PROJECT_BRAIN.md — MedPulse AI Persistent Memory

> **FIRST TASK ON RESUME:** Read this file in full before taking any action.

---

## Master Requirements

### Project Identity
- **Name:** MedPulse AI (healthtech-platform)
- **Purpose:** Arabic/English bilingual medical education & AI-assisted clinical platform
- **Root Path:** `D:\medpuls\New folder\`
- **Stack:** Next.js 15.5, React 19, Tailwind CSS 4, TypeScript, Supabase, Google Gemini 2.0 Flash

### Core Architecture
- **Router:** Next.js App Router (`src/app/`)
- **Language/Dir:** Default Arabic (`lang="ar" dir="rtl"`) — managed by `LanguageContext.tsx`
- **Auth (mock):** `src/components/AuthContext.tsx` — roles: Student / Professor
- **Auth (real):** `src/components/SupabaseAuthContext.tsx` — Supabase login/logout
- **AI Provider:** Google Gemini 2.0 Flash via `@ai-sdk/google` (+ Groq fallback via `@ai-sdk/groq`)
- **DB/Storage:** Supabase (`src/lib/supabase.ts`)
- **Vector DB:** Pinecone (`src/lib/pinecone.ts`)

### Full Feature Scope

| Route | Feature |
|---|---|
| `/` | Landing / Home page |
| `/auth` | Login / Registration |
| `/dashboard` | Student dashboard |
| `/professors` | Professor dashboard |
| `/admin` | Admin panel |
| `/profile` | User profile |
| `/progress` | Learning progress tracker |
| `/mdt` | Multi-Disciplinary Team AI debate (3 AI agents) |
| `/simulator` | Clinical case simulator |
| `/ecg` | ECG analysis AI tool |
| `/drug-checker` | Drug interaction checker |
| `/encyclopedia` | Medical encyclopedia |
| `/library` | Medical library (bilingual TYPE/REGION filters) |
| `/calculators` | Medical calculators |
| `/usmle` | USMLE exam prep |
| `/summarizer` | Medical document summarizer |
| `/translator` | Medical translator |
| `/notes` | Note-taking with AI |
| `/records` | Patient records |

### API Routes (`src/app/api/`)
- `medical-query/` — General AI medical queries
- `mdt-debate/` — Triple-agent MDT debate system
- `drug-interaction/` — Drug interaction analysis
- `ecg-analysis/` — ECG AI interpretation
- `simulator/` — Clinical case generation
- `generate-notes/` — AI note generation
- `medical-summarizer/` — Document summarization
- `translate/` — Medical translation
- `flashcards/` — Flashcard generation
- `sources/` — Medical source retrieval (Pinecone)
- `progress/` — Progress tracking
- `admin/` — Admin operations
- `visitors/` — Visitor analytics

### Key Components
- `Navbar.tsx` — Top navigation with auth, theme, language toggles
- `Sidebar.tsx` — Left sidebar with route links (RTL-aware)
- `LanguageContext.tsx` — AR/EN switcher, updates `html[lang][dir]`
- `ThemeProvider.tsx` — Dark/light mode via next-themes
- `AchievementContext.tsx` — Gamification/achievements
- `VisitorTracker.tsx` — Analytics tracking
- `FlashcardDeck.tsx` — Flashcard UI component
- `DevRoleToggle.tsx` — Dev-only role switcher

### Design System (`src/app/globals.css`)
Custom Tailwind 4 classes: `clinical-card-3d`, `premium-card`, `btn-elite`, `glass-nav`, `page-transition`

### Translations
`src/lib/translations.ts` — All UI strings in AR/EN

---

## Known Pre-existing Issues (Not Our Bugs)
- Test files missing `@types/jest` — ignore TS errors in test files
- `.next/types` generated file issue with encyclopedia page — ignore

---

## Critical Patterns (Never Break These)
1. Always import ALL icons used from `lucide-react` — missing imports = runtime crash
2. Always destructure all hooks fully (e.g., `const { signOut } = useSupabaseAuth()`)
3. Use `gap-*` not `space-x-*` in RTL layouts
4. Sidebar hover: direction-aware `translate-x-1` / `-translate-x-1`
5. Library filters need both `labelAr` and `labelEn` fields
6. No hardcoded `lang="en"` — layout must stay `lang="ar" dir="rtl"`
7. All edits go in `D:\medpuls\New folder\` (not parent `D:\medpuls\`)

---

## Progress Status

### Last Completed (2026-04-18)
1. **Progress tracking loop wired up** — USMLE saves sessions to `medpulse_sessions` localStorage on finish; Simulator saves session when starting a new case. Progress page cleans up no-op, adds Recent Sessions history panel. (`298f615`)
2. **`/dashboard` route created** — Dedicated authenticated student dashboard with XP level banner, stat grid, 10-module quick-access cards, recent sessions panel, quick tools. Sidebar updated to link to `/dashboard`. (`a6013d3`)

### Where We Stopped
- Both feature milestones committed. Build passes 0 errors.
- Next candidates:
  - Enhance `/` home page as a proper unauthenticated landing page (currently redirects unauthenticated users to "Please sign in")
  - Add professors page bilingual support (currently EN-only)
  - Implement `/api/progress` integration in dashboard (currently localStorage only)

### Specific Next Step
- Resume by checking `git log --oneline -5` and continuing from commit `a6013d3`.

---

## Commit Log (Major Milestones)
| Date | Commit | Summary |
|---|---|---|
| 2026-04-18 | `a6013d3` | feat: add /dashboard route |
| 2026-04-18 | `298f615` | feat: wire up progress tracking loop |
| 2026-04-17 | `c4cb3be` | Phase 1 Audit — 0 errors build |
| 2026-04-17 | `3e0392e` | PROJECT_BRAIN.md created |
| 2026-04-17 | `357c9fb` | Ultimate MedPulse MDT Core Upgrade |

---

*Last updated: 2026-04-18 — Session: Progress tracking + Dashboard route*
