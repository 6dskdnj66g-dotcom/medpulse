# MedPulse AI

**Arabic Clinical Intelligence Platform** — A comprehensive bilingual medical education platform built with Next.js 15, TypeScript, and Tailwind CSS.

**Built by Hasanain Salah**

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
- **UI**: Tailwind CSS 4
- **AI**: Groq (primary) + Google Generative AI
- **Auth/DB**: Supabase (with Row-Level Security)
- **Rate limiting**: Upstash Redis (sliding window)
- **Error monitoring**: Sentry-compatible (env-gated)
- **Language**: TypeScript 5

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
# AI providers
GROQ_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Rate limiting (optional — falls back to in-memory)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Error monitoring (optional)
SENTRY_DSN=

# Site
NEXT_PUBLIC_SITE_URL=
```

## Medical Disclaimer

This platform is for **educational purposes only**. It does not replace consultation with a licensed physician, diagnosis, or treatment.

---

© MedPulse AI · Built by Hasanain Salah · Based on WHO · NEJM · ACC/AHA · ESC guidelines
