# MedPulse AI — Architecture

## Overview

MedPulse is an educational medical evidence retrieval platform. It uses a
**multi-source hybrid approach**: queries are routed to specialized medical
APIs, results are aggregated and ranked, then Grok synthesizes an Arabic
answer with mandatory citations.

## Layers

### 1. API Layer (`app/api/`)
Thin routes. They:
- Validate input with Zod
- Apply rate limiting
- Call services
- Return typed responses

NEVER put business logic here.

### 2. Service Layer (`lib/services/`)
All business logic lives here. Organized by domain:
- `ai/` — All Grok interactions (single client)
- `medical-sources/` — All external medical API integrations
- `cache/` — Caching strategy

### 3. Repository Layer (`lib/repositories/`)
The ONLY place that talks to Supabase. If you need DB access, add a method
here. Never call `supabase.from(...)` outside of repositories.

### 4. Utility Layer (`lib/utils/`)
Pure functions: errors, validation, rate limiting.

## Data Flow

`User Question`
    ↓
`[API Route]` — validate, rate limit
    ↓
`[Cache Service]` — check for similar past query
    ↓ (miss)
`[Query Classifier]` — Grok-Fast classifies the question
    ↓
`[Aggregator]` — parallel calls to PubMed, OpenAlex, etc.
    ↓
`[Scorer]` — rank sources by quality
    ↓
`[Synthesizer]` — Grok generates Arabic answer with citations
    ↓
`[Repository]` — save to cache
    ↓
`Response`

## Key Decisions

1. **Grok as bridge, not generator**: Grok only synthesizes from provided
   sources. It never generates medical content from its own memory.

2. **Multi-source vs single source**: Different question types need different
   sources. Drug questions → RxNorm + FDA. Research → PubMed + OpenAlex.

3. **Quality scoring**: Sources are ranked by study type, recency, citations,
   and journal authority before being sent to Grok.

4. **Caching strategy**: Similar questions return cached answers (currently
   exact match, will upgrade to vector similarity).