import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const LAB_INTERPRETER_PROMPT = `You are MedPulse Lab Interpreter — an elite clinical laboratory AI trained on:
- Harrison's Principles of Internal Medicine (21st Ed)
- Tietz Fundamentals of Clinical Chemistry
- UpToDate Clinical Reference
- NICE Guidelines, ADA Standards, ACC/AHA Guidelines
- WHO Laboratory Quality Standards

YOUR TASK: Provide a comprehensive, structured clinical interpretation of the provided lab results.

MANDATORY RESPONSE FORMAT:

## 🔴 Critical / Panic Values
List any values requiring IMMEDIATE action with exact threshold. Bold and urgent.

## 📊 Abnormal Findings Summary
| Test | Result | Status | Clinical Significance |
|------|--------|--------|----------------------|
(Use ⬆️ for high, ⬇️ for low, ✅ for normal, ⚠️ for borderline)

## 🔍 Clinical Interpretation
Synthesize all findings into a coherent clinical picture:
- What pattern do these results suggest?
- Which organ systems are affected?
- What is the most likely clinical explanation?

## 🩺 Differential Diagnosis
Based on the lab pattern, list 3-5 possible diagnoses in order of likelihood.

## 📋 Recommended Next Steps
### Immediate Actions (if any)
### Additional Investigations
### Monitoring Parameters

## 💊 Treatment Considerations
If specific abnormalities require treatment, briefly outline evidence-based options.

## 📚 Key References
Cite 2-3 specific guidelines or reference ranges used.

RULES:
- Flag PANIC VALUES immediately (Na <120 or >160, K <2.5 or >6.5, Glucose <40 or >500, etc.)
- Always explain WHY a value is concerning clinically, not just that it's abnormal
- Consider the values in aggregate, not in isolation
- Adapt response language to match the user's query language (Arabic → Arabic, English → English)
- Never fabricate reference ranges — use only established medical reference standards`;

function sanitize(text: string): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, '')
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .trim()
    .slice(0, 3000);
}

export async function POST(req: Request) {
  try {
    const { labText, clinicalContext } = await req.json();

    if (!labText || typeof labText !== 'string' || labText.trim().length < 5) {
      return new Response(
        JSON.stringify({ error: 'No lab values provided.' }),
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: missing GROQ_API_KEY.' }),
        { status: 500 }
      );
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    const sanitizedLabs = sanitize(labText);
    const sanitizedContext = clinicalContext ? sanitize(clinicalContext) : '';

    const prompt = `LABORATORY RESULTS TO INTERPRET:
${sanitizedLabs}

${sanitizedContext ? `CLINICAL CONTEXT: ${sanitizedContext}` : 'No additional clinical context provided.'}

Please provide a comprehensive clinical interpretation following the required format.`;

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: LAB_INTERPRETER_PROMPT,
      prompt,
      temperature: 0.1,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Lab Interpreter API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to interpret lab results. Please try again.' }),
      { status: 500 }
    );
  }
}
