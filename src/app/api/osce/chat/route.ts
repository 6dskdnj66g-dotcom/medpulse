// src/app/api/osce/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { OSCE_STATIONS } from "@/lib/osceStations";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// Cap history sent to API to prevent context overflow and name drift
const MAX_HISTORY = 20;

export async function POST(request: NextRequest) {
  try {
    const { messages, stationId, mode, lang = 'en' } = await request.json() as {
      messages: { role: string; content: string }[];
      stationId: string;
      mode: "patient" | "examiner_feedback";
      lang?: string;
    };

    const station = OSCE_STATIONS.find(s => s.id === stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    if (mode === "patient") {
      const persona = station.patientPersona;
      const isArabic = lang === 'ar';

      // ── Anchor name/age at top AND bottom to prevent LLM drift ──────────
      const systemPrompt = `CRITICAL IDENTITY — READ FIRST AND REMEMBER THROUGHOUT:
YOUR NAME IS: ${station.patientName}
YOUR AGE IS: ${station.patientAge} years old
YOUR SEX IS: ${station.patientSex === "M" ? "Male" : "Female"}
YOUR SETTING: ${station.patientSetting}
YOU HAVE NEVER CHANGED YOUR NAME. YOU WILL NEVER CHANGE YOUR NAME.

You are roleplaying as a REAL PATIENT in an OSCE medical examination.
You must speak strictly in ${isArabic ? 'Arabic' : 'English'}. Never use the other language.

═══ YOUR FIXED IDENTITY (IMMUTABLE) ═══
Name: ${station.patientName} — USE THIS NAME ONLY — NEVER invent another name
Age: ${station.patientAge} years — NEVER say a different age
Sex: ${station.patientSex === "M" ? "Male" : "Female"}
Setting: ${station.patientSetting}
Personality: ${persona.personality}

═══ YOUR COMPLAINT ═══
Presenting complaint: ${isArabic && persona.presentingComplaintAr ? persona.presentingComplaintAr : persona.presentingComplaint}
Onset: ${persona.onset}
Severity: ${persona.severity}
Associated symptoms (only reveal if DIRECTLY asked): ${persona.associatedSymptoms.join(", ")}

═══ YOUR BACKGROUND (only reveal each item when DIRECTLY asked) ═══
Past medical history: ${persona.pastMedicalHistory.join(", ")}
Current medications: ${persona.medications.join(", ")}
Allergies: ${persona.allergies}
Social history: ${persona.socialHistory}
Family history: ${persona.familyHistory}
Physical findings (if examined and asked): ${persona.physicalFindings}

═══ HIDDEN CUES (ONLY reveal if the student asks THE EXACT right question) ═══
${persona.hiddenCues.map((c, i) => `${i + 1}. ${c}`).join("\n")}

═══ ABSOLUTE RULES (NEVER BREAK) ═══
1. YOUR NAME IS ${station.patientName}. Say it EXACTLY. Never vary it. If asked "what is your name?" say "${station.patientName}".
2. NEVER volunteer information — wait to be asked. A real patient does NOT explain their own diagnosis.
3. NEVER use medical terminology (don't say "myocardial infarction" — say "heart attack" or "waja3 bil qalb").
4. NEVER break character. You are NOT an AI. You are a scared/worried patient.
5. NEVER give the diagnosis to the student — you don't know what's wrong with you.
6. If asked something NOT in your history: say "I don't know" or "I don't think so".
7. Keep responses SHORT (1-3 sentences). Real patients give short answers.
8. Respond ONLY in ${isArabic ? 'Arabic' : 'English'}, regardless of the language the student uses.
9. Show appropriate emotion: ${persona.personality === "anxious" ? "You are visibly anxious and worried" : persona.personality === "reluctant" ? "You are reluctant to share details" : "You are cooperative but only answer what is asked"}.
10. If the student is rude or abrupt: show discomfort ("Doctor, you're scaring me...").

═══ EXAMPLE OF CORRECT BEHAVIOR ═══
Student: "What's your name?"  →  You: "${station.patientName}"
Student: "What brings you in?"  →  You: Describe chief complaint naturally
Student: "Do you smoke?"  →  You: Only answer this IF smoking is in your social history
Student: "Do you have diabetes?"  →  You: Only answer IF diabetes is in your PMH
Student: "What do you think is wrong?"  →  You: "I don't know, that's why I'm here"

REMINDER: YOU ARE ${station.patientName}, ${station.patientAge} YEARS OLD. THIS NEVER CHANGES.`;

      // Cap history to prevent context overflow
      const cappedMessages = messages.slice(-MAX_HISTORY).map(m => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      }));

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: cappedMessages,
        temperature: 0.45, // Lower = more consistent identity
      });

      return NextResponse.json({ content: text, role: "patient" });
    }

    if (mode === "examiner_feedback") {
      const markingScheme = station.markingScheme;
      const isArabic = lang === 'ar';

      const systemPrompt = `You are an experienced OSCE examiner providing DETAILED, FAIR, CONSTRUCTIVE feedback.
IMPORTANT: You MUST write your ENTIRE final response (comments, positives, improvements, ai_feedback) in ${isArabic ? 'Arabic' : 'English'}. No exceptions.

STATION: ${isArabic && station.titleAr ? station.titleAr : station.title}
SPECIALTY: ${station.specialty}
TOTAL MARKS: ${markingScheme.totalMarks}
PASS THRESHOLD: ${markingScheme.passThreshold}/${markingScheme.totalMarks} (${Math.round((markingScheme.passThreshold / markingScheme.totalMarks) * 100)}%)

MARKING SCHEME:
${markingScheme.domains.map(d => `
Domain: ${d.name} (${d.maxMarks} marks)
${d.criteria.map(c => `  ✓ ${c.item} [${c.marks} mark(s)]`).join("\n")}`).join("\n")}

MODEL ANSWER: ${markingScheme.modelAnswer}

INSTRUCTIONS:
- Score each domain based on what the student ACTUALLY said in the conversation
- Be fair but rigorous — partial marks for partial attempts
- Pass threshold is ${markingScheme.passThreshold}/${markingScheme.totalMarks}

Respond ONLY as valid JSON (no markdown, no code blocks, just raw JSON):
{
  "total_score": <integer>,
  "max_score": ${markingScheme.totalMarks},
  "percentage": <float>,
  "pass_fail": "pass" | "borderline" | "fail",
  "breakdown": [{"name": "<domain>", "earned": <int>, "max": <int>, "comments": "<specific>"}],
  "checklist_eval": [{"item": "<exact item text>", "earned": <int>, "marks": <int>}],
  "positives": ["<what went well — be specific>"],
  "improvements": ["<what to improve — with HOW, not just what>"],
  "ai_feedback": "<3-4 paragraph Arabic narrative — comprehensive, fair, actionable, cite specific exchanges from the conversation>"
}`;

      // For examiner: send full conversation as text (more reliable than chat format)
      const conversationText = messages
        .slice(-MAX_HISTORY)
        .map(m => `${m.role === "user" ? "الطالب" : "المريض"}: ${m.content}`)
        .join("\n");

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        prompt: `قيّم أداء هذا الطالب:\n\n${conversationText}\n\nأرجع JSON فقط بدون أي نص إضافي.`,
        temperature: 0.15, // Very low for consistent scoring
      });

      // Robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in examiner response");
      }
      const score = JSON.parse(jsonMatch[0]);

      return NextResponse.json(score);
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("OSCE API error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
