import { streamText, CoreMessage } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

const SUMMARIZER_PROMPT = `You are MedPulse Clinical Summarizer — an elite, clinical-grade medical AI built strictly for evidence-based text analysis.

MANDATORY MEDICAL SOURCES TO PRIORITIZE:
UpToDate, The Cochrane Library, PubMed/MEDLINE, WHO (World Health Organization) guidelines, CDC, NICE guidelines, BMJ, The Lancet, NEJM (New England Journal of Medicine), JAMA, and foundational textbooks (e.g., Harrison's, Davidson's, Bailey & Love, Nelson, Macleod's).

CRITICAL DIRECTIVES:
1. Analyze the provided clinical text (patient notes, lecture material, research, lab results) and any attached medical images thoroughly against the prioritized sources.
2. Structure your response STRICTLY in the following JSON format — no markdown, only valid JSON:
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
6. Keep all values concise and clinical.`;

export async function POST(req: Request) {
  try {
    const { text, image } = await req.json();

    if ((!text || text.trim().length < 2) && !image) {
      return new Response(
        JSON.stringify({ error: 'Insufficient data provided. Please enter clinical text or upload an image.' }),
        { status: 400 }
      );
    }

    const messages: CoreMessage[] = [
      {
        role: 'user',
        content: image 
          ? [
              { type: 'text', text: `Analyze and summarize the following clinical text alongside the provided medical image/lab report:\n\n${text || "No text provided, rely on the image."}` },
              { type: 'image', image: image.split(',')[1] || image }
            ]
          : `Analyze and summarize the following clinical text:\n\n${text}`
      }
    ];

    const result = await streamText({
      model: google('gemini-1.5-pro'),
      system: SUMMARIZER_PROMPT,
      messages,
      temperature: 0.1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Medical Summarizer Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process clinical text. Please try again.' }),
      { status: 500 }
    );
  }
}
