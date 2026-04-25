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
