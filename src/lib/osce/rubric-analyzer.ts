// src/lib/osce/rubric-analyzer.ts
// Separate AI call for rubric evaluation — NEVER shares rubric with patient AI
// Temperature 0.1 for deterministic, consistent scoring

import type { RubricItem } from "./patient-engine";

export interface RubricUpdate {
  coveredItems: string[];       // rubric item IDs covered by this turn
  quality: "excellent" | "good" | "adequate" | "poor";
  feedbackNote: string;
}

export interface ExaminerScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  passFail: "pass" | "borderline" | "fail";
  breakdown: { name: string; earned: number; max: number; comments: string }[];
  positives: string[];
  improvements: string[];
  aiFeedback: string;
  missedRedFlags: string[];
}

// ── Keyword-based local analyzer (no API call) ───────────────────────────────
// Fast, no latency — used for live checklist updates during simulation
export function analyzeStudentTurnLocal(
  studentMessage: string,
  rubric: RubricItem[],
  currentProgress: Record<string, boolean>
): string[] {
  const msg = studentMessage.toLowerCase();
  const newlyCovered: string[] = [];

  for (const item of rubric) {
    if (currentProgress[item.id]) continue; // already covered

    const matched = item.keywords.some(kw =>
      msg.includes(kw.toLowerCase())
    );

    if (matched) newlyCovered.push(item.id);
  }

  return newlyCovered;
}

// ── AI-based final examiner scoring ─────────────────────────────────────────
// Called once at session end — uses Groq with temperature 0.1
export async function scoreSessionWithAI(
  conversation: { role: string; content: string }[],
  rubric: RubricItem[],
  passThreshold: number,
  expectedDiagnosis: string,
  redFlags: string[],
  lang: "ar" | "en" = "ar"
): Promise<ExaminerScore> {
  const apiKey = process.env.GROQ_API_KEY;
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const model = "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const totalMaxMarks = rubric.reduce((a, r) => a + r.points, 0);
  const domains = Array.from(new Set(rubric.map(r => r.domain)));

  const rubricText = domains.map(domain => {
    const items = rubric.filter(r => r.domain === domain);
    return `
Domain: ${domain} (${items.reduce((a, i) => a + i.points, 0)} marks)
${items.map(i => `  - [${i.id}] ${i.criterion} (${i.points} mark${i.points > 1 ? "s" : ""})${i.required ? " ⭐REQUIRED" : ""}`).join("\n")}`;
  }).join("\n");

  const conversationText = conversation
    .slice(-40)
    .map(m => `${m.role === "user" ? "Student" : "Patient"}: ${m.content}`)
    .join("\n");

  const systemPrompt = `You are a strict OSCE examiner scoring a medical student's performance.
Be FAIR but RIGOROUS. Give partial marks for partial answers.
RESPOND ONLY WITH VALID JSON — no markdown, no preamble.`;

  const userPrompt = `
SCENARIO: Expected diagnosis = ${expectedDiagnosis}
Red flags that MUST be addressed: ${redFlags.join(", ")}
Pass threshold: ${passThreshold}/${totalMaxMarks}

MARKING SCHEME:
${rubricText}

STUDENT-PATIENT CONVERSATION:
${conversationText}

Score this performance and return ONLY this JSON structure:
{
  "total_score": <integer 0-${totalMaxMarks}>,
  "max_score": ${totalMaxMarks},
  "percentage": <float 0-100>,
  "pass_fail": "pass" | "borderline" | "fail",
  "breakdown": [
    {"name": "<domain>", "earned": <int>, "max": <int>, "comments": "<1-sentence specific feedback>"}
  ],
  "positives": ["<specific observed strength>", "<specific observed strength>"],
  "improvements": ["<specific gap + HOW to fix>", "<specific gap + HOW to fix>"],
  "ai_feedback": "<3 paragraphs in ${lang === "ar" ? "Arabic" : "English"}: overall assessment, key learning points, what to do differently next time>",
  "missed_red_flags": ["<red flags not addressed>"]
}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(50_000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown error");
    throw new Error(`Examiner AI failed: ${res.status} ${err}`);
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
  };

  const raw = data.choices[0]?.message?.content ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in examiner response");

  const scored = JSON.parse(jsonMatch[0]) as {
    total_score: number;
    max_score: number;
    percentage: number;
    pass_fail: "pass" | "borderline" | "fail";
    breakdown: { name: string; earned: number; max: number; comments: string }[];
    positives: string[];
    improvements: string[];
    ai_feedback: string;
    missed_red_flags: string[];
  };

  return {
    totalScore: scored.total_score,
    maxScore: scored.max_score,
    percentage: scored.percentage,
    passFail: scored.pass_fail,
    breakdown: scored.breakdown,
    positives: scored.positives,
    improvements: scored.improvements,
    aiFeedback: scored.ai_feedback,
    missedRedFlags: scored.missed_red_flags ?? [],
  };
}
