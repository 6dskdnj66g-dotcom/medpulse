# MedPulse AI

**Arabic Clinical Intelligence Platform** — A comprehensive bilingual medical education platform built with Next.js 15, TypeScript, and Tailwind CSS.

**Built by Hassanin Salah**

## Features

- **USMLE Question Bank** — 5,300+ Step 1 & Step 2 CK board-style questions with AI explanations
- **OSCE Simulator** — Realistic clinical scenarios with patient interactions and rubric scoring
- **AI Professors** — Grok-powered medical tutors for Q&A
- **Clinical Tools** — Drug checker, ECG analyzer, differential diagnosis, medical calculator
- **Medical Encyclopedia** — Bilingual (English/Arabic) clinical reference
- **MDT Debates** — Multi-disciplinary team case discussions
- **Flashcards (SRS)** — Spaced repetition learning system
- **Progress Tracking** — Analytics dashboard with specialty-level breakdown

## Stack

- **Framework**: Next.js 15 App Router
- **UI**: Tailwind CSS 4 + shadcn/ui
- **AI**: xAI Grok (primary) / Groq fallback
- **Auth/DB**: Supabase
- **Language**: TypeScript 5

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
XAI_API_KEY=         # xAI Grok API key
GROQ_API_KEY=        # Groq fallback key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Medical Disclaimer

This platform is for **educational purposes only**. It does not replace consultation with a licensed physician, diagnosis, or treatment.

---

© 2026 MedPulse AI · Built by Hassanin Salah · Based on WHO · NEJM · ACC/AHA · ESC guidelines
