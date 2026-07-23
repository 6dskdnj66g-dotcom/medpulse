// src/app/api/osce/evaluate/route.ts
// Post-session OSCE examiner analysis — GROQ ONLY (project rule #1: Gemini quota exhausted, do not use).
// Streams a markdown-formatted Arabic examiner report back to the FinalReport UI.

import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export const maxDuration = 60;

const requestSchema = z.object({
  stationId: z.string().min(1).max(100),
  transcript: z.string().min(10).max(20000),
});

const EXAMINER_SYSTEM_PROMPT = `أنت بروفيسور طبي في لجنة الـ OSCE وحكم طبي صارم (Examiner).
لقد انتهى الطالب للتو من مقابلة حالة (محاكاة لمريض). سأرفق لك تالياً "نص المحادثة بالكامل" التي تمت بينهم.
مهمتك هي قراءة المحادثة، وتقييم أداء الطالب كطبيب متدرب.

عليك الرد بتقرير مفصل ومكتوب بـ Markdown أنيق للغاية، باللغة العربية، يحتوي على الأقسام التالية:
1. ### 📊 الدرجة النهائية (مثال: 85/100)
2. ### ✅ ما أبدع فيه الطالب (Communication and Clinical approach)
3. ### ❌ ما نسي الطالب سؤاله (Red flags or key DDx elements missed)
4. ### 📋 التشخيص التفريقي (Differential Diagnosis) الأقرب بناءً على ما ظهر في المحادثة
5. ### 💡 نصيحة البروفيسور السريرية للمستقبل

كن صارماً وعلمياً في تقييمك. لا تجامل أبداً. إياك أن تهلوس، قيم فقط بناءً على نص المحادثة المرفق.`;

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { transcript } = parsed.data;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured on the server" },
        { status: 503 }
      );
    }

    const groq = createGroq({ apiKey: groqApiKey });

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: EXAMINER_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `نص محادثة الـ OSCE للتقييم:\n\n${transcript}` },
      ],
      temperature: 0.15,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("OSCE Evaluate API error:", err);
    return Response.json({ error: "Evaluation service failed" }, { status: 500 });
  }
}
