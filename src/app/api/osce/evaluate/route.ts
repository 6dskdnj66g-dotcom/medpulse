import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export const maxDuration = 60;

const requestSchema = z.object({
  stationId: z.string(),
  transcript: z.string().min(10).max(20000), // Protect against too large payload
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
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { transcript } = parsed.data;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return Response.json({ error: "No GROQ_API_KEY configured" }, { status: 503 });
    }

    const groq = createGroq({ apiKey: groqKey });
    
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"), // Powerful enough for clinical evaluation
      system: EXAMINER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `نص محادثة الـ OSCE للتقييم:\n\n${transcript}` }],
      temperature: 0.1, // Near deterministic
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("OSCE Evaluate API error:", err);
    return Response.json({ error: "Evaluation service failed" }, { status: 500 });
  }
}
