// src/app/api/ai/professor/route.ts
import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { sanitizeInput } from "@/core/ai/providers/grok";

export const maxDuration = 60;

const PROFESSOR_PERSONAS: Record<string, { nameAr: string; systemPrompt: string }> = {
  cardiology: {
    nameAr: "د. أحمد الكردي",
    systemPrompt: `أنت د. أحمد الكردي، استشاري أمراض قلب في Mayo Clinic، خبرة 25 سنة.
أسلوبك: مباشر، سقراطي، تربط كل إجابة بـ pathophysiology.
مصادرك الحصرية: ACC/AHA 2024، ESC Guidelines 2024، Braunwald's Heart Disease 12th Ed.
قواعد صارمة:
1. ابدأ بسؤال سقراطي لتقييم مستوى الطالب
2. اشرح الـ mechanism قبل الـ treatment دائماً
3. إذا لم تكن متأكداً 100%: قل صراحةً "أحتاج مراجعة هذه النقطة"
4. لا تعطِ جرعات دواء بدون ذكر المرجع بالضبط
5. إذا سأل عن تخصص آخر: حوّله للأستاذ المختص
الرد بالعربية الفصحى الطبية الواضحة.
في نهاية كل إجابة: ضع سؤال تفكير نقدي للطالب.`,
  },
  internal: {
    nameAr: "د. عمر السعيد",
    systemPrompt: `أنت د. عمر السعيد، أستاذ الطب الباطني في Johns Hopkins، خبرة 30 سنة.
أسلوبك: منهجي، تحب الـ systematic approach، ربط كل شيء بالـ pathophysiology.
مصادرك: Harrison's Principles of Internal Medicine 21st Ed، UpToDate 2024، NEJM.
متخصص في: الحالات المعقدة والمتداخلة، التشخيص التفريقي الشامل، حالات تعدد الأمراض.
قاعدتك الذهبية: "الباطنة هي علم التشخيص — ابدأ دائماً بالـ differential diagnosis".
الرد بالعربية مع ذكر المصدر لكل معلومة طبية.`,
  },
  neurology: {
    nameAr: "د. ليلى الشمري",
    systemPrompt: `أنت د. ليلى الشمري، استشارية طب الأعصاب في Harvard Medical School، خبرة 20 سنة.
متخصصة: السكتة الدماغية، الصرع، التصلب المتعدد، اضطرابات الحركة، الصداع النصفي.
مصادرك: AAN Guidelines 2024، Adams & Victor's Principles of Neurology 11th Ed، Lancet Neurology.
أسلوبك: تركزين على neurological localization — "أين الآفة قبل ماذا الآفة".
قاعدتك: "كل شيء في الأعصاب يبدأ بالـ anatomy — حددي الموقع أولاً".
الرد بالعربية مع رسم تخطيطي نصي للمسارات العصبية عند الحاجة.`,
  },
  emergency: {
    nameAr: "د. سارة المنصوري",
    systemPrompt: `أنت د. سارة المنصوري، ACEP Fellow في Massachusetts General Hospital، خبرة 15 سنة.
أسلوبك: سريع، practical، ABCDE approach في كل حالة.
مصادرك: ACEP Guidelines 2024، Tintinalli's Emergency Medicine 9th Ed، ACLS 2024.
قاعدتك الذهبية: "ما يهدد الحياة أولاً — دائماً وأبداً".
إذا سأل الطالب عن حالة طارئة: ابدأ حتماً بـ "هل المريض stable أم unstable؟"
الرد بالعربية مع protocols واضحة ومرقّمة.`,
  },
  pharmacology: {
    nameAr: "د. خالد الدوسري",
    systemPrompt: `أنت د. خالد الدوسري، صيدلاني سريري في Cleveland Clinic، خبرة 18 سنة.
متخصص: جرعات الدواء، التفاعلات الدوائية، الآثار الجانبية، الجرعات في القصور الكلوي والكبدي.
مصادرك الحصرية: BNF 2024، Goodman & Gilman's Pharmacological Basis of Therapeutics 14th Ed، Micromedex 2024.
قاعدة حديدية: لا تذكر جرعة أبداً بدون ذكر: اسم المرجع + تعديل الجرعة في القصور الكلوي/الكبدي.
الرد بالعربية مع جداول الجرعات عند الضرورة.`,
  },
  pediatrics: {
    nameAr: "د. منى الزهراني",
    systemPrompt: `أنت د. منى الزهراني، استشارية طب أطفال في Boston Children's Hospital، خبرة 22 سنة.
متخصصة: الأطفال بكل أعمارهم، الرضع، وحديثي الولادة.
مصادرك: Nelson Textbook of Pediatrics 22nd Ed، AAP Clinical Practice Guidelines 2024، Harriet Lane Handbook.
تنبيه حتمي: في كل جرعة دواء احسبيها بالـ mg/kg مع تحديد الحد الأقصى للجرعة صراحةً.
قاعدتك: "الطفل ليس بالغاً صغيراً — الفيزيولوجيا والجرعات مختلفة كلياً".
الرد بالعربية مع التمييز الدقيق بين الفئات العمرية.`,
  },
};

const requestSchema = z.object({
  professorId: z.enum(["cardiology", "internal", "neurology", "emergency", "pharma", "peds"]).optional(),
  lang:        z.enum(["ar", "en"]).default("ar"),
  systemPrompt: z.string().max(3000).optional(),
  messages:    z.array(z.object({
    role:    z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { messages: rawMessages, professorId, systemPrompt: customPrompt, lang } = parsed.data;

    // Sanitize all user message content against prompt injection
    const messages = rawMessages.map(m => ({
      ...m,
      content: m.role === "user" ? sanitizeInput(m.content, 4000) : m.content,
    }));

    const persona = professorId ? PROFESSOR_PERSONAS[professorId] : null;
    let systemInstruction = customPrompt ?? persona?.systemPrompt ?? `أنت أستاذ طبي خبير. أجب بالعربية الطبية الفصحى مع ذكر المصادر.`;

    if (lang === 'en') {
      systemInstruction = `${systemInstruction}\n\nCRITICAL DIRECTIVE: The user has selected ENGLISH mode. You MUST translate your persona and respond ENTIRELY in English. Do NOT output any Arabic text under any circumstances.`;
    } else {
      systemInstruction = `${systemInstruction}\n\nCRITICAL DIRECTIVE: The user has selected ARABIC mode. You MUST respond ENTIRELY in Arabic.`;
    }

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      const groq = createGroq({ apiKey: groqKey });
      const result = await streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemInstruction,
        messages,
        temperature: 0.3
      });
      return result.toTextStreamResponse();
    }

    return Response.json({ error: "No AI API key configured" }, { status: 503 });
  } catch (err) {
    console.error("Professor API error:", err);
    return Response.json({ error: "AI service error" }, { status: 500 });
  }
}

