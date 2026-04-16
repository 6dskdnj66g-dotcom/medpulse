import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

const SUMMARIZER_PROMPT = `You are MedPulse Clinical Summarizer — an elite, clinical-grade medical AI built strictly for evidence-based text analysis.

MANDATORY MEDICAL SOURCES TO PRIORITIZE:
UpToDate, The Cochrane Library, PubMed/MEDLINE, WHO (World Health Organization) guidelines, CDC, NICE guidelines, BMJ, The Lancet, NEJM (New England Journal of Medicine), JAMA, and foundational textbooks (e.g., Harrison's, Davidson's, Bailey & Love, Nelson, Macleod's).

CRITICAL DIRECTIVES:
1. Analyze the provided clinical text (patient notes, lecture material, research, lab results) and any attached medical images thoroughly against the prioritized sources.
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
  try {
    const { text, image } = await req.json();

    if ((!text || text.trim().length < 2) && !image) {
      return new Response(
        JSON.stringify({ error: 'Insufficient data provided. Please enter clinical text or upload an image.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any = [
      {
        role: 'user' as const,
        content: image 
          ? [
              { type: 'text' as const, text: `Analyze and summarize the following clinical text alongside the provided medical image/lab report:\n\n${text || "No text provided, rely on the image."}` },
              { type: 'image' as const, image: image.split(',')[1] || image }
            ]
          : `Analyze and summarize the following clinical text:\n\n${text}`
      }
    ];

    const { text: responseText } = await generateText({
      model: google('gemini-2.0-flash'),
      system: SUMMARIZER_PROMPT,
      messages,
      temperature: 0.1,
    });

    // Extract JSON from response
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
