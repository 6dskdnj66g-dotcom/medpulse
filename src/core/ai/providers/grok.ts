// GROQ client using groq-sdk — llama-3.3-70b-versatile
// Named grok.ts for legacy import compatibility; the underlying provider is GROQ, not xAI.
import Groq from 'groq-sdk';

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResult {
  error: boolean;
  content?: string;
  message?: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const MEDICAL_DISCLAIMER =
  '\n\n---\n⚕️ **تنبيه طبي:** هذه معلومات تعليمية فقط وليست استشارة طبية. في حالات الطوارئ اتصل: 997 (السعودية) · 999 (الإمارات) · 911 (أمريكا)';

export function sanitizeInput(text: string, maxLength = 2000): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, '')
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .trim()
    .slice(0, maxLength);
}

export async function callGrok(
  messages: GrokMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    addDisclaimer?: boolean;
    model?: string;
  } = {}
): Promise<GrokResult> {
  const {
    temperature = 0.3,
    maxTokens = 2000,
    addDisclaimer = true,
    model = 'llama-3.3-70b-versatile',
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { error: true, message: 'GROQ_API_KEY not configured' };
  }

  try {
    const client = new Groq({ apiKey });
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    let content = completion.choices[0]?.message?.content ?? '';
    if (addDisclaimer) content += MEDICAL_DISCLAIMER;

    return {
      error: false,
      content,
      usage: completion.usage
        ? {
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  } catch (e) {
    const err = e as Error;
    if (err.name === 'TimeoutError') {
      return { error: true, message: 'انتهت مهلة الطلب — حاول مجدداً' };
    }
    console.error('GROQ error:', e);
    return { error: true, message: 'خطأ في الاتصال — تحقق من الاتصال' };
  }
}

// In-memory rate limiter (per-IP, server-side)
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const calls = (rateLimitStore.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (calls.length >= maxPerMinute) return false;
  calls.push(now);
  rateLimitStore.set(ip, calls);
  return true;
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - 60_000;
    for (const [ip, calls] of rateLimitStore.entries()) {
      const fresh = calls.filter((t) => t > cutoff);
      if (fresh.length === 0) rateLimitStore.delete(ip);
      else rateLimitStore.set(ip, fresh);
    }
  }, 300_000);
}
