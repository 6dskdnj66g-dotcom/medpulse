/**
 * Backward-compatible re-export.
 * The single source of truth for the Grok/Groq client now lives at
 * `@/core/ai/providers/grok`. New code should import from there directly.
 */
export {
  askGrok,
  callGrok,
  sanitizeInput,
  checkRateLimit,
  type AskGrokOptions,
  type GrokMessage,
  type GrokResult,
} from "@/core/ai/providers/grok";
