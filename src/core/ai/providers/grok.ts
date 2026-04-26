// src/lib/ai/grok.ts
// Centralised xAI Grok client — server-side only (never import from client components)

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

// ── Input sanitization ──────────────────────────────────────────────────────
export function sanitizeInput(text: string, maxLength = 2000): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, "")
    .replace(/\[SYSTEM\]/gi, "")
    .replace(/system\s*:/gi, "")
    .replace(/<\|.*?\|>/g, "")
    .trim()
    .slice(0, maxLength);
}

// ── Core Grok caller ────────────────────────────────────────────────────────
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
    model = "grok-2-latest",
  } = options;

  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    // Fallback chain: Groq → Google Gemini
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      return callGroqFallback(messages, { temperature, maxTokens, addDisclaimer });
    }
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (geminiKey) {
      return callGeminiFallback(messages, { temperature, maxTokens, addDisclaimer });
    }
    return { error: true, message: "No AI API key configured. Set XAI_API_KEY, GROQ_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY." };
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
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
      console.error("Grok API error:", res.status, errText);
      return {
        error: true,
        message: res.status === 429
          ? "تجاوزت حد الطلبات — انتظر دقيقة ثم حاول مجدداً"
          : "فشل الاتصال بـ AI — حاول مرة أخرى",
      };
    }

    const data = await res.json() as {
      choices: { message: { content: string } }[];
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    let content = data.choices[0]?.message?.content ?? "";
    if (addDisclaimer) content += MEDICAL_DISCLAIMER;

    return { error: false, content, usage: data.usage };
  } catch (e) {
    const err = e as Error;
    if (err.name === "TimeoutError") {
      return { error: true, message: "انتهت مهلة الطلب — حاول مجدداً" };
    }
    console.error("Grok network error:", e);
    return { error: true, message: "خطأ في الشبكة — تحقق من الاتصال" };
  }
}

// ── Groq fallback ───────────────────────────────────────────────────────────
async function callGroqFallback(
  messages: GrokMessage[],
  options: { temperature: number; maxTokens: number; addDisclaimer: boolean }
): Promise<GrokResult> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
      }),
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      // Groq rate limited or down → cascade to Gemini
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.warn("Groq fallback failed (status " + res.status + "), cascading to Google Gemini");
        return callGeminiFallback(messages, options);
      }
      return { error: true, message: "فشل الاتصال — حاول مرة أخرى" };
    }

    const data = await res.json() as { choices: { message: { content: string } }[] };
    let content = data.choices[0]?.message?.content ?? "";
    if (options.addDisclaimer) content += MEDICAL_DISCLAIMER;
    return { error: false, content };
  } catch {
    // Network error → try Gemini
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return callGeminiFallback(messages, options);
    }
    return { error: true, message: "خطأ في الشبكة" };
  }
}

// ── Google Gemini fallback ───────────────────────────────────────────────────
async function callGeminiFallback(
  messages: GrokMessage[],
  options: { temperature: number; maxTokens: number; addDisclaimer: boolean }
): Promise<GrokResult> {
  try {
    const { generateText } = await import("ai");
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    const systemMsg = messages.find(m => m.role === "system");
    const chatMsgs = messages.filter(m => m.role !== "system").map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const model = google("gemini-2.0-flash");
    const system = systemMsg?.content;
    const temperature = options.temperature;
    
    let text: string;
    if (chatMsgs.length > 0) {
      const result = await generateText({
        model,
        system,
        messages: chatMsgs,
        temperature,
      });
      text = result.text;
    } else {
      const result = await generateText({
        model,
        system,
        prompt: system ?? "Hello",
        temperature,
      });
      text = result.text;
    }

    let content = text ?? "";
    if (options.addDisclaimer) content += MEDICAL_DISCLAIMER;
    return { error: false, content };
  } catch (e) {
    console.error("Gemini fallback error:", e);
    return { error: true, message: "فشل جميع مزودي الذكاء الاصطناعي — حاول مرة أخرى" };
  }
}

// ── Rate limiter (in-memory, per-IP, server-side) ───────────────────────────
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const calls = (rateLimitStore.get(ip) ?? []).filter(t => now - t < 60_000);
  if (calls.length >= maxPerMinute) return false;
  calls.push(now);
  rateLimitStore.set(ip, calls);
  return true;
}

// Clean up old entries every 5 minutes to prevent memory leak
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
