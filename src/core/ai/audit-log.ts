/**
 * AI response audit log — server-only.
 *
 * Writes an immutable record for every AI invocation so we can:
 *   1. Reconstruct what the model said to a given user when challenged.
 *   2. Investigate hallucinations or harmful outputs after the fact.
 *   3. Bill / quota usage internally without trusting client telemetry.
 *
 * The helper NEVER throws. If logging fails (network down, Supabase
 * unreachable, missing service-role key) we drop the record silently and
 * log to stderr — never block the actual user response.
 */

import "server-only";
import { createClient } from "@supabase/supabase-js";

export type AuditStatus = "ok" | "error" | "timeout" | "rate_limited";

export interface AuditEntry {
  userId?: string | null;
  sessionId?: string | null;
  route: string;
  model?: string;
  prompt: string;
  response?: string;
  promptTokens?: number;
  completionTokens?: number;
  status: AuditStatus;
  errorMessage?: string;
  ip?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient =
  supabaseUrl && serviceKey && !serviceKey.includes("placeholder")
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function excerpt(text: string | undefined, max = 800): string | null {
  if (!text) return null;
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function logAIResponse(entry: AuditEntry): Promise<void> {
  if (!adminClient) return;

  try {
    const promptHash = await sha256Hex(entry.prompt);
    const ipHash = entry.ip ? await sha256Hex(entry.ip) : null;

    const { error } = await adminClient.from("ai_responses_log").insert({
      user_id: entry.userId ?? null,
      session_id: entry.sessionId ?? null,
      route: entry.route,
      model: entry.model ?? null,
      prompt_hash: promptHash,
      prompt_excerpt: excerpt(entry.prompt, 1_000),
      response_excerpt: excerpt(entry.response, 2_000),
      prompt_tokens: entry.promptTokens ?? null,
      completion_tokens: entry.completionTokens ?? null,
      status: entry.status,
      error_message: entry.errorMessage ?? null,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("[audit-log] insert failed:", error.message);
    }
  } catch (e) {
    console.error("[audit-log] unexpected error:", e);
  }
}

/**
 * Fire-and-forget variant — useful inside streaming responses where we don't
 * want the audit write to add latency to the user-visible response.
 */
export function logAIResponseAsync(entry: AuditEntry): void {
  void logAIResponse(entry);
}
