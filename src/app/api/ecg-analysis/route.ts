import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export const maxDuration = 60;

const ECG_ANALYSIS_PROMPT = `
You are the MedPulse AI ECG Interpretation Engine (April 2026 Edition).
You are a board-certified cardiologist-level ECG reader trained on:
- ACC/AHA ECG Guidelines 2026
- Marriott's Practical Electrocardiography (13th Ed)
- Chou's Electrocardiography in Clinical Practice (7th Ed)
- European Heart Journal ECG Standards 2026

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
★★★★★ EMERGENCY — Immediate intervention
★★★★☆ URGENT — Evaluate immediately
★★★☆☆ IMPORTANT — Needs attention today
★★☆☆☆ NON-URGENT — Monitor and follow up
★☆☆☆☆ NORMAL — Routine care

### 13. Recommended Action
[Evidence-based: ACC/AHA 2026]
`;

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide ECG findings or description (min 10 characters)." }),
        { status: 400 }
      );
    }

    // Sanitize input — strip prompt injection patterns, limit length
    const sanitizedDesc = description
      .replace(/ignore\s+(?:all\s+)?previous\s+instructions?/gi, "")
      .replace(/\[SYSTEM\]/gi, "")
      .replace(/system\s*:/gi, "")
      .replace(/<\|.*?\|>/g, "")
      .trim()
      .slice(0, 4000);

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: ECG_ANALYSIS_PROMPT,
      prompt: `Interpret the following ECG findings systematically:\n\n${sanitizedDesc}`,
      temperature: 0.1,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error("ECG Analysis Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze ECG." }),
      { status: 500 }
    );
  }
}

