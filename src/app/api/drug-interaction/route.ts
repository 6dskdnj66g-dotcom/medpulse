import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { logAIResponseAsync } from '@/core/ai/audit-log';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 60;

const ROUTE = '/api/drug-interaction';
const MODEL = 'gemini-2.5-flash';

const RequestSchema = z.object({
  drugs: z.array(z.string().min(1).max(100)).min(2).max(10),
});

const DRUG_INTERACTION_PROMPT = `
You are the MedPulse AI Drug Interaction Analyzer.
You are trained exclusively on:
- Lexicomp, Micromedex, DrugBank
- WHO Essential Medicines List
- FDA Drug Safety Communications
- BNF (British National Formulary)

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
Cite your source: [Lexicomp] / [Micromedex] / [FDA]

CRITICAL RULES:
- If any combination is CONTRAINDICATED, clearly state this at the top in bold
- Never minimize serious interactions
- Always recommend physician/pharmacist consultation
`;

function sanitize(text: string): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, '')
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .trim()
    .slice(0, 100);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Please provide between 2 and 10 drug names.', issues: parsed.error.issues }),
      { status: 400 }
    );
  }

  const sanitizedDrugs = parsed.data.drugs.map(sanitize).filter(d => d.length > 0);
  if (sanitizedDrugs.length < 2) {
    return new Response(JSON.stringify({ error: 'Please provide at least 2 valid drug names.' }), { status: 400 });
  }

  const drugList = sanitizedDrugs.join(', ');
  const promptForAudit = `drugs: ${drugList}`;

  try {
    const result = await streamText({
      model: google(MODEL),
      system: DRUG_INTERACTION_PROMPT,
      prompt: `Analyze interactions between these drugs: ${drugList}.`,
      temperature: 0.1,
      onFinish: ({ text, usage }) => {
        logAIResponseAsync({
          route: ROUTE,
          model: MODEL,
          prompt: promptForAudit,
          response: text,
          promptTokens: usage?.inputTokens,
          completionTokens: usage?.outputTokens,
          status: 'ok',
          ip,
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Drug Interaction Error:', error);
    logAIResponseAsync({
      route: ROUTE,
      model: MODEL,
      prompt: promptForAudit,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
      ip,
    });
    return new Response(JSON.stringify({ error: 'Failed to analyze drug interactions.' }), { status: 500 });
  }
}
