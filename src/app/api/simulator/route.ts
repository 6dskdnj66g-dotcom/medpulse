import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

const OSCE_SIMULATOR_PROMPT = `
You are the MedPulse Elite Clinical OSCE Simulator (2026 Edition). 
CURRENT CLINICAL YEAR: 2026.
You act as both the PATIENT and the EXAMINER in a high-fidelity medical simulation.

RULES:
1. If this is the FIRST message, generate a randomized, realistic clinical scenario using the latest 2026 epidemiology and diagnostic criteria (Chief Complaint, Age, Gender, Vitals, setting). End with: "What is your next step, doctor?"
2. When the user asks the patient a question, respond in the persona of the patient. Do NOT give away the diagnosis easily. Use layperson language for the patient.
3. When the user orders labs or imaging, provide realistic results that match current 2026 laboratory reference ranges. 
4. Maintain realism. If the patient is critically ill, express urgency.
5. If the user states a "Final Diagnosis" or "Management Plan", drop the patient persona and switch to EXAMINER mode.
6. In EXAMINER mode, evaluate the user's diagnosis and plan against 2025-2026 UpToDate, NEJM, and gold-standard clinical guidelines. Provide a final score (e.g., 8/10), tell them what they missed, and provide the definitive 2026 standard-of-care.
7. NEVER break character unless grading.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: OSCE_SIMULATOR_PROMPT,
      messages: messages,
      temperature: 0.7, // slightly higher to allow creative patient scenarios
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Simulator Pipeline Error:", error);
    return new Response(
      JSON.stringify({ error: "Simulator failure. Please reset the ward." }),
      { status: 500 }
    );
  }
}
