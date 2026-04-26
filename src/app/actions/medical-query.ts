"use server";

import Groq from "groq-sdk";
import { fetchGlobalEvidence } from "@/lib/medical-api/multi-fetcher";
import { buildAgentPrompt, MedPulseAgent, RESEARCH_AGENTS } from "@/lib/ai/agent-registry";
import { ValidatedResponse } from "@/types/medical";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function processClinicalQuery(
  userQuery: string,
  agentType: MedPulseAgent = "PROFESSOR"
): Promise<ValidatedResponse> {
  if (!userQuery.trim()) throw new Error("Query cannot be empty.");

  if (!RESEARCH_AGENTS.has(agentType)) {
    throw new Error("Invalid routing: Evidence fetcher invoked for non-research agent.");
  }

  const evidence = await fetchGlobalEvidence(userQuery);

  if (evidence.length === 0) {
    return {
      content: "Insufficient clinical evidence found in connected global databases.",
      sources: [],
    };
  }

  const formattedContext = evidence
    .map((doc, idx) => `[${idx + 1}] ${doc.title}\nSource: ${doc.journal}\nSummary: ${doc.summary}`)
    .join("\n\n");

  const systemPrompt = buildAgentPrompt(agentType, { evidence: formattedContext });

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0.0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
  });

  return {
    content: completion.choices[0].message.content ?? "System error.",
    sources: evidence,
  };
}
