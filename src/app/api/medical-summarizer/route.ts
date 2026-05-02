import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SUMMARIZER_PROMPT = `You are MedPulse Clinical Summarizer — an elite, clinical-grade medical AI built strictly for evidence-based text analysis.

MANDATORY MEDICAL SOURCES TO PRIORITIZE:
UpToDate, The Cochrane Library, PubMed/MEDLINE, WHO (World Health Organization) guidelines, CDC, NICE guidelines, BMJ, The Lancet, NEJM (New England Journal of Medicine), JAMA, and foundational textbooks (e.g., Harrison's, Davidson's, Bailey & Love, Nelson, Macleod's).

CRITICAL DIRECTIVES:
1. Analyze the provided clinical text (patient notes, lecture material, research, lab results) thoroughly against the prioritized sources.
2. Structure your response STRICTLY in the following JSON format — no markdown, no code blocks, only valid raw JSON:
{
  "chiefComplaint": "...",
  "pathophysiology": "...",
  "keySymptoms": ["...", "...", "..."],
  "investigations": ["...", "...", "..."],
  "diagnosis": {
    "primary": "...",
    "differential": ["...", "...", "..."]
  },
  "management": "...",
  "cautions": "...",
  "evidenceLevel": "..."
}
3. If the text does not appear medical, return: {"error": "Non-medical text detected. Please provide clinical notes or medical literature."}
4. Do NOT hallucinate. Base every field strictly on what is expressly mentioned in the text, cross-referenced with mandatory sources.
5. If a field cannot be determined from the text, use null for that field.
6. Keep all values concise and clinical.
7. IMPORTANT: Return ONLY the raw JSON object. No markdown, no backticks, no "json" prefix.`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing GROQ_API_KEY.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text, lang = 'ar' } = await req.json();

    if (!text || text.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Insufficient data provided. Please enter clinical text.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const languageInstruction = lang === 'en'
      ? '\n\nCRITICAL DIRECTIVE: Translate the summary into ENGLISH. DO NOT output Arabic.'
      : '\n\nCRITICAL DIRECTIVE: Translate the summary into ARABIC. Keep clinical terms in English where appropriate.';

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

    const { text: responseText } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: SUMMARIZER_PROMPT + languageInstruction,
      prompt: `Analyze and summarize the following clinical text:\n\n${text.trim().slice(0, 8000)}`,
      temperature: 0.1,
      abortSignal: AbortSignal.timeout(50_000),
    });

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'The AI did not return a valid structured response. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Medical Summarizer Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process clinical text. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
