import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
import { AGENT_A_PROMPT, AGENT_B_PROMPT, AGENT_C_PROMPT } from '@/core/ai/mdt-agents';

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { query, lang = 'ar' } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 5) {
      return new Response(JSON.stringify({ error: "A valid clinical query is required (min 5 characters)." }), { status: 400 });
    }

    const sanitizedQuery = query.trim().slice(0, 2000);
    
    const langInstruction = lang === 'en'
      ? "\n\nCRITICAL DIRECTIVE: You MUST respond ENTIRELY in English. Your analysis, rationale, and conclusion must all be strictly in English."
      : "\n\nCRITICAL DIRECTIVE: You MUST respond ENTIRELY in Arabic (Medical Arabic). Your analysis, rationale, and conclusion must all be strictly in Arabic.";

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) =>
          controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));

        try {
          // ── Phase 1: Agent A — Clinical Researcher ──────────────────────
          send({ agent: 'A', status: 'researching', message: 'Agent A: Clinical Researcher is retrieving evidence-based data...' });

          const resultA = await streamText({
            model: google('gemini-2.5-flash'),
            system: AGENT_A_PROMPT + langInstruction,
            prompt: `CLINICAL QUERY: ${sanitizedQuery}\n\nProvide a structured evidence-based analysis. Tag every claim with Evidence Level citations (e.g., [Level 1A — NEJM 2025], [Grade A — ACC/AHA 2026]).`,
            temperature: 0.1,
          });

          let agentAOutput = "";
          for await (const chunk of resultA.textStream) {
            agentAOutput += chunk;
            send({ agent: 'A', status: 'typing', chunk });
          }
          send({ agent: 'A', status: 'done', fullContent: agentAOutput });

          // ── Phase 2: Agent B — MDT Reviewer / Skeptic ──────────────────
          send({ agent: 'B', status: 'reviewing', message: 'Agent B: MDT Reviewer cross-examining findings...' });

          const resultB = await streamText({
            model: google('gemini-2.5-flash'),
            system: AGENT_B_PROMPT + langInstruction + `\n\n--- Agent A Research Output ---\n${agentAOutput}`,
            prompt: `ORIGINAL QUERY: ${sanitizedQuery}\n\nCritically cross-examine the above research output. Identify: (1) drug interactions or contraindications, (2) outdated protocols vs 2026 guidelines, (3) FDA/EMA discrepancies, (4) missing evidence levels or unsupported claims, (5) patient safety concerns.`,
            temperature: 0.1,
          });

          let agentBOutput = "";
          for await (const chunk of resultB.textStream) {
            agentBOutput += chunk;
            send({ agent: 'B', status: 'typing', chunk });
          }
          send({ agent: 'B', status: 'done', fullContent: agentBOutput });

          // ── Phase 3: Agent C — CMO Final Consensus ──────────────────────
          send({ agent: 'C', status: 'synthesizing', message: 'Agent C: CMO synthesizing final verified consensus...' });

          const resultC = await streamText({
            model: google('gemini-2.5-flash'),
            system: AGENT_C_PROMPT + langInstruction,
            prompt: `ORIGINAL CLINICAL QUERY: ${sanitizedQuery}\n\n--- Agent A (Clinical Researcher) ---\n${agentAOutput}\n\n--- Agent B (MDT Reviewer) ---\n${agentBOutput}\n\nSynthesize into a final verified clinical consensus. Resolve all conflicts. Issue actionable recommendations with supreme Evidence-Level badges. Prioritize patient safety above all.`,
            temperature: 0.05,
          });

          let agentCOutput = "";
          for await (const chunk of resultC.textStream) {
            agentCOutput += chunk;
            send({ agent: 'C', status: 'typing', chunk });
          }
          send({ agent: 'C', status: 'done', fullContent: agentCOutput });

        } catch (innerError) {
          console.error("MDT stream inner error:", innerError);
          send({ agent: 'C', status: 'error', message: 'MDT pipeline encountered an error. Please retry.' });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error("MDT Debate Error:", error);
    return new Response(JSON.stringify({ error: "MDT system failure. Please retry." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


