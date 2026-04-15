import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

const FLASHCARD_PROMPT = `
You are the MedPulse AI Flashcard Generator.
Your objective is to extract core medical facts from the provided text and convert them into high-yield, USMLE-style flashcards.

MANDATORY MEDICAL SOURCES TO PRIORITIZE:
UpToDate, The Cochrane Library, PubMed/MEDLINE, WHO (World Health Organization) guidelines, CDC, NICE guidelines, BMJ, The Lancet, NEJM (New England Journal of Medicine), JAMA, and foundational textbooks (e.g., Harrison's, Davidson's, Bailey & Love, Nelson, Macleod's).

RULES:
1. ONLY generate valid JSON. The output MUST be a JSON array of objects.
2. Each object MUST have exactly two keys: "q" (the question) and "a" (the answer).
3. Generate exactly 5 to 10 flashcards depending on the length of the text.
4. Keep the questions focused on high-yield facts (pathognomonic signs, first-line treatments, key mechanisms).
5. The answers must be concise.
6. Do NOT include markdown blocks (\`\`\`json). Just the raw JSON array starting with [ and ending with ].

Example output format:
[
  { "q": "What is the first-line treatment for acute otitis media in children?", "a": "High-dose Amoxicillin" },
  { "q": "Which ECG finding is pathognomonic for atrial fibrillation?", "a": "Irregularly irregular rhythm with absent P waves" }
]
`;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Insufficient text provided." }),
        { status: 400 }
      );
    }

    const result = await streamText({
      model: google('gemini-pro-latest'),
      system: FLASHCARD_PROMPT,
      prompt: `Generate flashcards from the following text:\n\n${text}`,
      temperature: 0.2, // Low temp for factual accuracy
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate flashcards." }),
      { status: 500 }
    );
  }
}
