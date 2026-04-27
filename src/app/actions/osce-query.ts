"use server";

import Groq from "groq-sdk";
import { buildAgentPrompt } from "@/lib/ai/agent-registry";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function processOSCEQuery(
  history: ChatMessage[],
  newQuery: string
): Promise<string> {
  if (!newQuery.trim()) throw new Error("Query is empty.");

  const patientProfile =
    "45-year-old male. Presents with central crushing chest pain radiating to the left jaw. Sweating heavily. Smoker (2 packs/day). Terrified but doesn't know medical terms like 'myocardial infarction'.";

  const systemPrompt = buildAgentPrompt("OSCE", { patientProfile });

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history,
    { role: "user" as const, content: newQuery },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages,
  });

  return completion.choices[0].message.content ?? "Patient is unresponsive.";
}
