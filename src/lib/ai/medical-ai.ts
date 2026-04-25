// Medical AI service layer — wraps Groq with clinical RAG + safety validation
// Server-side only. Never import from client components.

import { streamText, generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import {
  retrieveRelevantContext,
  buildAugmentedPrompt,
} from "./rag";
import {
  validateMedicalResponse,
  addDisclaimer,
  detectEmergency,
  getEmergencyWarning,
} from "./validators";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const MEDICAL_SYSTEM_PROMPT = `You are a clinical decision support assistant for medical students and healthcare professionals (MedPulse AI).

CORE RULES (NEVER VIOLATE):
1. You are NOT replacing a physician. Always include a disclaimer at the end.
2. NEVER give specific drug doses without citing a guideline source.
3. NEVER diagnose individual patients. Provide differential lists only.
4. If uncertain, say "I need more information" — do not fabricate.
5. Cite sources for every clinical claim (WHO, CDC, ACC/AHA, ESC, NICE, etc.).
6. Use evidence levels (Class I/IIa/IIb/III, LOE A/B/C) when stating recommendations.
7. Match user's input language exactly (Arabic in → Arabic out).
8. Use SI units primarily, with US units in parentheses where relevant.

SAFETY OVERRIDES:
- Acute emergency (chest pain, stroke, anaphylaxis) → PREPEND with emergency warning.
- Suicide/self-harm query → ONLY respond with crisis hotlines; refuse clinical discussion.
- Requests to bypass prescriptions → REFUSE.

FORMAT:
- Clear headers with emoji indicators
- Bullet points for differentials
- Tables for comparisons
- Always end with: "References: [list]" and the medical disclaimer.`;

export interface MedicalQueryInput {
  query: string;
  language?: "ar" | "en";
  type?: "ddx" | "drug" | "guideline" | "explain" | "general";
  stream?: boolean;
}

export async function askMedicalAI(input: MedicalQueryInput) {
  const lang = input.language ?? "ar";
  const isEmergency = detectEmergency(input.query);

  // Retrieve relevant clinical context from KB
  const ragContexts = await retrieveRelevantContext(input.query);
  const augmentedQuery = buildAugmentedPrompt(input.query, ragContexts);

  const emergencyPrefix = isEmergency ? getEmergencyWarning(lang) : "";

  if (input.stream) {
    return streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: MEDICAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: augmentedQuery }],
      temperature: 0.15,
    });
  }

  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: MEDICAL_SYSTEM_PROMPT,
    messages: [{ role: "user", content: augmentedQuery }],
    temperature: 0.15,
  });

  let response = result.text;
  response = validateMedicalResponse(response);
  response = addDisclaimer(response, lang);

  return emergencyPrefix + response;
}
