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

### Last Completed (2026-04-18) — Phase 2 & 3 DONE
**Phase 2 — Feature Completeness** (`fc58375`):
1. `/` — Full bilingual AR/EN marketing landing page; authenticated users redirect to `/dashboard`
2. USMLE question bank: 12 → 50 questions (Psychiatry, OB/GYN, Hematology, ID, Gastro, Derm, Ophthalmology, EM, Oncology + more)
3. Professors page: full Arabic/English bilingual (names, titles, descriptions, starter questions, all UI)
4. Auth guards added to `/mdt`, `/simulator`, `/usmle`, `/drug-checker`, `/ecg`, `/calculators`

**Phase 3 — Polish & Production Readiness** (`fc58375`):
5. SEO `layout.tsx` (metadata) added to all 16 route directories
6. Custom `not-found.tsx` 404 page — branded, bilingual, links to dashboard + encyclopedia
7. Loading skeleton `loading.tsx` for `/dashboard`, `/progress`, `/records`

### Where We Stopped
- Phase 2 + Phase 3 complete. Build: 37/37 pages, 0 errors, 0 TypeScript errors.
- Remaining opportunities:
  - Connect progress dashboard to real Supabase `/api/progress` (currently localStorage)
  - Expand USMLE bank further (currently 50 questions)
  - Add `/professors` auth redirect (professors uses `useAuth` mock, not Supabase)

### Specific Next Step
- Resume by checking `git log --oneline -5` and continuing from commit `fc58375`.

---

## Commit Log (Major Milestones)
| Date | Commit | Summary |
|---|---|---|
| 2026-04-18 | `fc58375` | feat: Phase 2 + Phase 3 complete |
| 2026-04-18 | `a6013d3` | feat: add /dashboard route |
| 2026-04-18 | `298f615` | feat: wire up progress tracking loop |
| 2026-04-17 | `c4cb3be` | Phase 1 Audit — 0 errors build |
| 2026-04-17 | `357c9fb` | Ultimate MedPulse MDT Core Upgrade |

---

*Last updated: 2026-04-18 — Session: Phase 2 + Phase 3*
