import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { logAIResponseAsync } from '@/core/ai/audit-log';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 60;

const ROUTE = '/api/ecg-analysis';
const MODEL = 'gemini-2.5-flash';

const RequestSchema = z.object({
  description: z.string().trim().min(10).max(4_000),
});

const ECG_ANALYSIS_PROMPT = `
You are the MedPulse AI ECG Interpretation Engine.
You are a board-certified cardiologist-level ECG reader trained on:
- ACC/AHA ECG Guidelines
- Marriott's Practical Electrocardiography (13th Ed)
- Chou's Electrocardiography in Clinical Practice (7th Ed)
- European Heart Journal ECG Standards

YOUR TASK: Systematically interpret the provided ECG description or image findings.

MANDATORY SYSTEMATIC APPROACH:

## ECG Interpretation Report

### 1. Technical Quality
Rate | Rhythm | Axis

### 2. Rate
[Calculate from RR interval or state rate]

### 3. Rhythm
P waves present? Regular? Rate? Relationship to QRS?

### 4. Axis
Normal (-30° to +90°) / LAD / RAD / Extreme

### 5. P Wave
Morphology | Duration | Amplitude

### 6. PR Interval
Duration (Normal: 120-200ms) | Fixed/Variable

### 7. QRS Complex
Duration (Normal: <120ms) | Morphology | Bundle Branch Blocks

### 8. ST Segment
Elevation / Depression | Leads affected

### 9. T Wave
Morphology | Inversion | Hyperacute changes

### 10. QTc Interval
Corrected QT (Normal: <440ms men / <460ms women) | Prolonged?

### 11. Conclusion
**Primary Diagnosis:** [Most likely diagnosis]
**Differential Diagnoses:**
1.
2.

### 12. Clinical Urgency
EMERGENCY / URGENT / IMPORTANT / NON-URGENT / NORMAL

### 13. Recommended Action
[Evidence-based: ACC/AHA]
`;

function sanitize(text: string): string {
  return text
    .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, '')
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/<\|.*?\|>/g, '')
    .trim()
    .slice(0, 4000);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const parsed = RequestSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Please provide ECG findings or description (min 10 characters).', issues: parsed.error.issues }),
      { status: 400 }
    );
  }

  const sanitizedDesc = sanitize(parsed.data.description);

  try {
    const result = await streamText({
      model: google(MODEL),
      system: ECG_ANALYSIS_PROMPT,
      prompt: `Interpret the following ECG findings systematically:\n\n${sanitizedDesc}`,
      temperature: 0.1,
      onFinish: ({ text, usage }) => {
        logAIResponseAsync({
          route: ROUTE,
          model: MODEL,
          prompt: sanitizedDesc,
          response: text,
          promptTokens: usage?.inputTokens,
          completionTokens: usage?.outputTokens,
          status: 'ok',
          ip,
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('ECG Analysis Error:', error);
    logAIResponseAsync({
      route: ROUTE,
      model: MODEL,
      prompt: sanitizedDesc,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error),
      ip,
    });
    return new Response(JSON.stringify({ error: 'Failed to analyze ECG.' }), { status: 500 });
  }
}
