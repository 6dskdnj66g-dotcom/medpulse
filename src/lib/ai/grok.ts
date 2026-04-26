// src/lib/ai/grok.ts
// Thin wrapper around core/ai/providers/grok that exposes askGrok() for OSCE engine
// Server-side only — never import from client components

import { callGrok } from "@/core/ai/providers/grok";

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
