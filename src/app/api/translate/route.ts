import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text, direction = "auto" } = await req.json();

    const prompt = `You are an expert medical translator and clinical linguist specializing in English and Arabic.
Translate the following medical text/terms while preserving strict clinical accuracy.
Direction: ${direction} (detect if auto).

Text to translate: "${text}"

Rules:
1. Use standard Arab Medical Union terminology for Arabic.
2. Provide the translation clearly.
3. Add a "Clinical Context" section explaining the term or its significance in both languages.
4. If it's a diagnostic term, include common abbreviations.
5. FORMAT: Use clean Markdown.

Example Output:
# Translation
**[Term in Target Language]**

## Clinical Context
Brief explanation...`;

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: "You are a professional medical translator.",
      prompt: prompt,
      temperature: 0.2,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      }
    });
  } catch (error) {
    console.error("Translation API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process translation." }), { status: 500 });
  }
}
