"use server";

import Groq from "groq-sdk";
import { fetchClinicalEvidence } from "@/lib/medical-api/europe-pmc";
import { STRICT_CLINICAL_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { ValidatedResponse } from "@/types/medical";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function processClinicalQuery(userQuery: string): Promise<ValidatedResponse> {
  if (!userQuery || userQuery.trim() === "") {
    throw new Error("Query cannot be empty.");
  }

  const evidence = await fetchClinicalEvidence(userQuery, 4);

  if (evidence.length === 0) {
    return {
      content:
        "Insufficient clinical evidence found in the connected databases to answer this query. Please refine your search terms.",
      sources: [],
    };
  }

  const formattedContext = evidence
    .map(
      (doc, index) =>
        `[Source ${index + 1}]\nTitle: ${doc.title}\nJournal: ${doc.journal} (${doc.publicationYear})\nAbstract: ${doc.summary}`
    )
    .join("\n\n");

  const systemPrompt = STRICT_CLINICAL_SYSTEM_PROMPT.replace("{CONTEXT}", formattedContext);

  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0.0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
  });

  return {
    content: completion.choices[0].message.content ?? "System processing error.",
    sources: evidence,
  };
}
