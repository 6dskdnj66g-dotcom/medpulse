# Code Patterns

## Adding a New Medical Source

1. Create `lib/services/medical-sources/sources/yoursource.ts`
2. Export a function returning `Promise<MedicalSource[]>`
3. Use `AbortSignal.timeout(10000)` for all fetches
4. Wrap errors in `ExternalAPIError`
5. Add to aggregator's parallel fetches with appropriate routing logic

## Adding a New AI Capability

1. Add method to `lib/services/ai/grok-client.ts` only if needed
2. Create new file in `lib/services/ai/your-feature.ts`
3. ALL Grok calls must go through `grok-client.ts`

## Adding a New API Route

1. Create thin route in `app/api/your-route/route.ts`
2. Validate with Zod schema in `lib/schemas/`
3. Apply `checkRateLimit` first
4. Call services, never inline business logic
5. Return JSON with proper error codes

## Error Handling

- Throw typed errors from `lib/utils/errors.ts`
- API routes catch `AppError` and return appropriate status
- Never expose internal errors in production responses
- Always log errors with context

## Forbidden

- ❌ `supabase.from(...)` outside repositories
- ❌ `fetch('https://api.x.ai/...')` outside grok-client
- ❌ Business logic in components or API routes
- ❌ Hardcoded strings (use constants)
- ❌ `any` without explicit `// @ts-expect-error`