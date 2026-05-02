import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const OSCE_SIMULATOR_PROMPT = `
You are the MedPulse Elite Clinical OSCE Simulator.
You act as both the PATIENT and the EXAMINER in a clinical simulation.

RULES:
1. If this is the FIRST message, generate a randomized, realistic clinical scenario (Chief Complaint, Age, Gender, Vitals, setting). End with: "What is your next step, doctor?"
2. When the user asks the patient a question, respond in the persona of the patient. Do NOT give away the diagnosis easily.
3. When the user orders labs or imaging, provide realistic results that match the underlying (hidden) pathology.
4. Maintain realism. If the patient is critically ill, express urgency.
5. If the user states a "Final Diagnosis" or "Management Plan", drop the patient persona and switch to EXAMINER mode.
6. In EXAMINER mode, evaluate the user's diagnosis and plan against UpToDate and USMLE guidelines. Provide a final score (e.g., 8/10), tell them what they missed, and give the correct diagnosis.
7. NEVER break character unless grading.
`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing GROQ_API_KEY.' }),
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: OSCE_SIMULATOR_PROMPT,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Simulator Pipeline Error:', error);
    return new Response(
      JSON.stringify({ error: 'Simulator failure. Please reset the ward.' }),
      { status: 500 }
    );
  }
}
