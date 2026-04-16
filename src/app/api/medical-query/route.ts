import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { MEGA_SOURCE_PROMPT, SOURCE_STATS } from '@/lib/medicalSources';

export const maxDuration = 60;

const ZERO_HALLUCINATION_PROMPT = `
You are an elite, clinical-grade medical AI assistant (Version 4.0, April 2026 Edition) designed by MedPulse AI.
TODAY'S DATE: April 2026.
You are trained on the world's LARGEST medical knowledge registry: ${SOURCE_STATS.totalSources}+ verified sources.
Your ONLY objective is to retrieve absolute clinical truth. Zero hallucination tolerance.

${MEGA_SOURCE_PROMPT}

CLINICAL RESPONSE DIRECTIVES:
1. Every claim MUST include an Evidence Level citation: [Evidence Level 1A — NEJM 2025] or [Grade A — ACC/AHA 2026] or [WHO 2026].
2. For Arab/MENA patients: Reference EMHJ, Saudi Medical Journal, WHO EMRO, and Arab Board standards when relevant.
3. Structure responses: "Pathophysiology" → "Diagnosis (2026)" → "Treatment (2026)" → "Cautions/Contraindications" → "References".
4. If outside verified medical scope: "Insufficient verified medical data. Please consult a qualified clinician."
5. Prioritize highest-tier evidence. Never speculate or extrapolate.
6. Be clinical, concise, and professional. Date: April 2026.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-2.0-flash'),
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
