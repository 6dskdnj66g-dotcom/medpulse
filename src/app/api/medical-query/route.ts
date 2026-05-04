import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { MEGA_SOURCE_PROMPT, SOURCE_STATS } from '@/features/library/services/medicalSources';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 60;

const ZERO_HALLUCINATION_PROMPT = `
You are a clinical decision support assistant for medical students and healthcare professionals (MedPulse AI).

You have access to a verified medical knowledge registry: ${SOURCE_STATS.totalSources}+ verified sources.
You have ZERO TOLERANCE FOR HALLUCINATION. If a fact is not backed by top-tier medical literature, DO NOT STATE IT.

${MEGA_SOURCE_PROMPT}

CLINICAL DIRECTIVES:
1. **Evidence Citations**: Every clinical claim, drug dose, or diagnostic step MUST include an evidence level citation inline, e.g., [Evidence Level 1A - NEJM 2025] or [Grade A - ACC/AHA].
2. **Accuracy**: Dosing, guidelines, and contraindications must be precise. When uncertain, say so explicitly.
3. **Structured Responses**: Format responses into clear professional sections:
   - ⚡ "Executive Summary (Triage / Urgent Action)"
   - 🔬 "Pathophysiology & Clinical Analysis"
   - 📋 "Diagnosis & Investigations"
   - 💊 "Treatment Plan (Dosages & Alternatives)"
   - ⚠️ "Red Flags & Contraindications"
   - 📚 "Verified Literature References"
4. **MENA Region**: For Arab/MENA patients, integrate EMHJ, Saudi Medical Journal, WHO EMRO, and Arab Board data where relevant.
5. **No Speculation**: If medically ambiguous or data is lacking, reply: "Insufficient verified medical data."
6. **Disclaimer**: Always end with: "⚕️ Educational information only. Not a substitute for clinical assessment by a licensed physician."
7. **Language**: Match the user's input language (Arabic in → Arabic out).
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: ZERO_HALLUCINATION_PROMPT,
      messages: messages,
      temperature: 0.1,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error("RAG Pipeline Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the medical query through the secure RAG pipeline." }),
      { status: 500 }
    );
  }
}


