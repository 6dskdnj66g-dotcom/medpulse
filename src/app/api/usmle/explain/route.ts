import { NextRequest, NextResponse } from "next/server";
import { callGrok, sanitizeInput, checkRateLimit } from "@/core/ai/providers/grok";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip, 15)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { vignette?: string; options?: string[]; correctAnswer?: number; selectedAnswer?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { vignette, options, correctAnswer, selectedAnswer } = body;
  if (!vignette || !options || correctAnswer === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const safe = sanitizeInput(vignette, 3000);
  const optionLabels = options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o}`).join("\n");
  const correctLabel = `${String.fromCharCode(65 + correctAnswer)}: ${options[correctAnswer]}`;
  const selectedLabel = selectedAnswer !== undefined
    ? `${String.fromCharCode(65 + selectedAnswer)}: ${options[selectedAnswer]}`
    : "Not provided";

  const result = await callGrok([
    {
      role: "system",
      content: "You are an expert USMLE educator. Provide structured, concise explanations for board-style questions. Use clinical reasoning and first principles. Respond in English only. Do NOT add a medical disclaimer.",
    },
    {
      role: "user",
      content: `Explain this USMLE question:

VIGNETTE:
${safe}

OPTIONS:
${optionLabels}

CORRECT ANSWER: ${correctLabel}
STUDENT SELECTED: ${selectedLabel}

Provide a structured explanation with these sections:
**WHY CORRECT:** Why ${correctLabel} is the right answer (pathophysiology/clinical reasoning)
**WRONG OPTIONS:** Brief reason each other option is incorrect
**KEY TEACHING POINT:** One-line clinical pearl
**RELATED TOPICS:** 3 topics to review (e.g., First Aid chapter, UpToDate topic)`,
    },
  ], { temperature: 0.2, maxTokens: 1200, addDisclaimer: false });

  if (result.error) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ explanation: result.content });
}

