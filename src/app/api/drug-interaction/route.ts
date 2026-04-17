import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 60;

const DRUG_INTERACTION_PROMPT = `
You are the MedPulse AI Drug Interaction Analyzer (April 2026 Edition).
You are trained exclusively on:
- Lexicomp 2026, Micromedex 2026, DrugBank 2026
- WHO Essential Medicines List 2026
- FDA Drug Safety Communications 2026
- BNF (British National Formulary) 2026

YOUR TASK: Analyze drug interactions between the provided medications.

RESPONSE FORMAT (MANDATORY):
## Interaction Summary
State the overall interaction severity: CONTRAINDICATED / MAJOR / MODERATE / MINOR / NO KNOWN INTERACTION

## Interaction Details
For each drug pair, describe:
- Mechanism of interaction
- Clinical consequences
- Severity rating: [CONTRAINDICATED/MAJOR/MODERATE/MINOR]

## Clinical Management
- What to monitor
- Dose adjustments if needed
- Alternative drugs if interaction is dangerous

## Evidence Level
Cite your source: [Lexicomp 2026] / [Micromedex 2026] / [FDA 2026]

CRITICAL RULES:
- If any combination is CONTRAINDICATED, clearly state this at the top in bold
- Never minimize serious interactions
- Always recommend physician/pharmacist consultation
- Current date: April 2026
`;

export async function POST(req: Request) {
  try {
    const { drugs } = await req.json();

    if (!drugs || drugs.length < 2) {
      return new Response(
        JSON.stringify({ error: "Please provide at least 2 drugs to check interactions." }),
        { status: 400 }
      );
    }

    const drugList = drugs.join(', ');

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: DRUG_INTERACTION_PROMPT,
      prompt: `Analyze interactions between these drugs: ${drugList}. Patient context: April 2026.`,
      temperature: 0.1,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error("Drug Interaction Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze drug interactions." }),
      { status: 500 }
    );
  }
}

