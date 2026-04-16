import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { AGENT_A_PROMPT, AGENT_B_PROMPT, AGENT_C_PROMPT } from '@/lib/mdt-agents';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const stream = new ReadableStream({
      async start(controller) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const send = (data: any) => controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));

        // Phase 1: Agent A (Research)
        send({ agent: 'A', status: 'researching', message: 'Agent A: Clinical Researcher is fetching medical vectors...' });
        
        // Simulating context retrieval (since index is empty in development)
        const mockContext = "Patient presents with persistent cough and low-grade fever. Standard guidelines recommend checking for macrolide resistance in endemic areas.";

        const resultA = await streamText({
          model: google('gemini-1.5-flash'),
          system: AGENT_A_PROMPT + mockContext,
          prompt: query,
          temperature: 0.1,
        });

        let agentAOutput = "";
        for await (const chunk of resultA.textStream) {
          agentAOutput += chunk;
          send({ agent: 'A', status: 'typing', chunk });
        }
        send({ agent: 'A', status: 'done', fullContent: agentAOutput });

        // Phase 2: Agent B (The Skeptic) - Cross-Examination
        send({ agent: 'B', status: 'reviewing', message: 'Agent B: MDT Reviewer is cross-examining research...' });
        
        const resultB = await streamText({
          model: google('gemini-1.5-flash'),
          system: AGENT_B_PROMPT + agentAOutput,
          prompt: "Analyze the previous research for drug interactions or outdated guidelines.",
          temperature: 0.1,
        });

        let agentBOutput = "";
        for await (const chunk of resultB.textStream) {
          agentBOutput += chunk;
          send({ agent: 'B', status: 'typing', chunk });
        }
        send({ agent: 'B', status: 'done', fullContent: agentBOutput });

        // Phase 3: Agent C (CMO) - Final Consensus
        send({ agent: 'C', status: 'synthesizing', message: 'Agent C: CMO is synthesizing final medical consensus...' });

        const resultC = await streamText({
          model: google('gemini-1.5-flash'),
          system: AGENT_C_PROMPT,
          prompt: `Synthesize the findings between Agent A: ${agentAOutput} and the critique from Agent B: ${agentBOutput}. Create a final verified article.`,
          temperature: 0.1,
        });

        let agentCOutput = "";
        for await (const chunk of resultC.textStream) {
          agentCOutput += chunk;
          send({ agent: 'C', status: 'typing', chunk });
        }
        send({ agent: 'C', status: 'done', fullContent: agentCOutput });

        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    });

  } catch (error) {
    console.error("MDT Debate Error:", error);
    return new Response(JSON.stringify({ error: "MDT System failure. Retrying self-healing protocol..." }), { status: 500 });
  }
}
