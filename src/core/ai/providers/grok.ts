/**
 * Groq AI provider — server-only.
 *
 * The legacy name "grok" is preserved to avoid a sweeping rename across the
 * codebase, but this client now talks exclusively to Groq (api.groq.com).
 * The xAI Grok path was retired because the project standardised on Groq
 * (GROQ_API_KEY) and the CSP no longer whitelists api.x.ai.
 *
 * Public surface (kept stable):
 *   - callGrok(messages, options): low-level chat completion call
 *   - askGrok({ systemPrompt, userMessage, ... }): single-turn helper
 *   - sanitizeInput(text, max): prompt-injection scrubber
 *   - checkRateLimit(ip, max): legacy in-memory limiter (use core/ratelimit
 *     for new code — kept here only for callers that have not migrated)
 */

import "server-only";

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GrokResult {
  error: boolean;
  content?: string;
  message?: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const MEDICAL_DISCLAIMER =
  "\n\n---\n⚕️ **تنبيه طبي:** هذه معلومات تعليمية فقط وليست استشارة طبية. في حالات الطوارئ اتصل: 997 (السعودية) · 999 (الإمارات) · 911 (أمريكا)";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function sanitizeInput(text: string, maxLength = 2000): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, "")
    .replace(/\[SYSTEM\]/gi, "")
    .replace(/system\s*:/gi, "")
    .replace(/<\|.*?\|>/g, "")
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
    model = DEFAULT_MODEL,
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      error: true,
      message: "No AI API key configured. Set GROQ_API_KEY in environment.",
    };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "unknown");
      console.error("Groq API error:", res.status, errText);
      return {
        error: true,
        message:
          res.status === 429
            ? "تجاوزت حد الطلبات — انتظر دقيقة ثم حاول مجدداً"
            : "فشل الاتصال بـ AI — حاول مرة أخرى",
      };
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    let content = data.choices[0]?.message?.content ?? "";
    if (addDisclaimer) content += MEDICAL_DISCLAIMER;

    return { error: false, content, usage: data.usage };
  } catch (e) {
    const err = e as Error;
    if (err.name === "TimeoutError") {
      return { error: true, message: "انتهت مهلة الطلب — حاول مجدداً" };
    }
    console.error("Groq network error:", e);
    return { error: true, message: "خطأ في الشبكة — تحقق من الاتصال" };
  }
}

export interface AskGrokOptions {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

export async function askGrok(options: AskGrokOptions): Promise<string> {
  const result = await callGrok(
    [
      { role: "system", content: options.systemPrompt },
      { role: "user", content: options.userMessage },
    ],
    {
      temperature: options.temperature ?? 0.3,
      maxTokens: options.maxTokens ?? 500,
      addDisclaimer: false,
    }
  );

  if (result.error) {
    throw new Error(result.message ?? "AI service error");
  }

  return result.content ?? "";
}

const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const calls = (rateLimitStore.get(ip) ?? []).filter(t => now - t < 60_000);
  if (calls.length >= maxPerMinute) return false;
  calls.push(now);
  rateLimitStore.set(ip, calls);
  return true;
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60_000;
    for (const [ip, calls] of rateLimitStore.entries()) {
      const fresh = calls.filter(t => t > cutoff);
      if (fresh.length === 0) rateLimitStore.delete(ip);
      else rateLimitStore.set(ip, fresh);
    }
  }, 300_000);
}
