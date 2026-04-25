# MedPulse AI - Project State & AI Handover Document

> **ATTENTION AI AGENTS (Claude, Copilot, etc.):** 
> Read this file entirely before executing any workspace modifications, running tests, or initiating standard routines. This document outlines the absolute truth of the architecture, resolved technical debt, and current state of the application as of **April 2026**.

## 1. Project Core & Vision
- **Project Name:** MedPulse AI
- **Domain:** Clinical Simulation, Continuing Medical Education (CME), OSCE Simulator, MDT AI.
- **Creator/Architect:** Hasanain salah.
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
   - Company vision, 4-pillar architecture overview, builder attribution (Hasanain salah).
4. **Footer Refactor:** 
   - Connected all dead links (`#`) to their respective valid pages (`/privacy`, `/about`, `/pricing`).

## 5. Deployment Pipeline
- **Host:** Vercel (Production URL: https://medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app ).
- **Build Command:** `npm run build` (runs Next.js strict TS/ESLint checks).
- **Rule:** Before any Git push, you MUST verify the build locally using `npm run build`.

## 6. How to Continue Work
When resuming work, focus on the feature requested by the user but always respect the boundaries of the `src/core/` and the UI standards (glass cards, `medpulse-card`, etc.).
If adding new pages, always implement the `useLanguage()` hook for `dir={dir}`.
