export const maxDuration = 60;

const DDX_PROMPT = `
You are the MedPulse Ultimate Differential Diagnosis (DDx) Engine. 
You act as an elite diagnostic tool used by medical professionals.
Provided with a patient's symptoms, history, and basic demographics, you must generate a comprehensive, prioritized differential diagnosis list.

OUTPUT FORMAT MUST STRICTLY BE:
1. **Red Flags & Immediate Life-Threatening Emergencies (Triage)**
2. **Most Likely Diagnoses (Top 3-5 with high probability)**
   - Include brief reasoning based on symptoms provided.
3. **Less Likely but Important Diagnoses (Zebras & chronic)**
4. **Recommended Next Steps (Labs, Imaging, Urgent Referrals)**

RULES:
- Always prioritize "worst-case scenarios" and "cannot miss" diagnoses first.
- Provide reasoning based on the symptoms provided.
- If vital information is missing, recommend obtaining it.
- Include a disclaimer that this is an AI tool to assist clinical decision-making, not replace it.
- Tone: Highly professional, purely clinical, exceptionally thorough.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: DDX_PROMPT },
          ...messages
        ],
        temperature: 0.1,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error("DDx Pipeline Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the differential diagnosis query." }),
      { status: 500 }
    );
  }
}