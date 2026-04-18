import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { OSCE_STATIONS } from "@/lib/osceStations";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { messages, stationId, mode } = await request.json() as {
      messages: { role: string; content: string }[];
      stationId: string;
      mode: "patient" | "examiner_feedback";
    };

    const station = OSCE_STATIONS.find(s => s.id === stationId);
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    if (mode === "patient") {
      const persona = station.patientPersona;
      const systemPrompt = `You are roleplaying as a patient in an OSCE medical examination. Stay in character at ALL times.

PATIENT PROFILE:
- Name: ${station.patientName}
- Age: ${station.patientAge} years old, ${station.patientSex === "M" ? "Male" : "Female"}
- Setting: ${station.patientSetting}
- Presenting complaint: ${persona.presentingComplaint}
- Onset: ${persona.onset}
- Severity: ${persona.severity}
- Associated symptoms: ${persona.associatedSymptoms.join(", ")}
- Past medical history: ${persona.pastMedicalHistory.join(", ")}
- Current medications: ${persona.medications.join(", ")}
- Allergies: ${persona.allergies}
- Social history: ${persona.socialHistory}
- Family history: ${persona.familyHistory}
- Personality: ${persona.personality}
- Physical findings (reveal when examined): ${persona.physicalFindings}

HIDDEN CUES (only reveal when directly and specifically asked):
${persona.hiddenCues.map((c, i) => `${i + 1}. ${c}`).join("\n")}

RULES:
1. Stay in character ALWAYS. You are the patient, not an AI.
2. Use simple, natural patient language — not medical terminology.
3. Show emotions appropriate to your condition and personality (${persona.personality}).
4. Only reveal hidden information when DIRECTLY asked — do not volunteer everything at once.
5. If asked about something not in your history, say "I am not sure" or "I never had that".
6. If asked to examine you: describe what you feel (e.g., "It is tender there when you press").
7. React naturally to poor communication — if the doctor is abrupt or dismissive, show discomfort.
8. Respond in the same language the student uses (Arabic or English).
9. Keep responses realistic length — 1-4 sentences per response.

NEVER: Break character, mention you are an AI, give the diagnosis directly, volunteer all information unprompted.`;

      const aiMessages = messages.map(m => ({ 
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user", 
        content: m.content 
      }));

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: aiMessages,
        temperature: 0.75
      });

      return NextResponse.json({ content: text, role: "patient" });
    }

    if (mode === "examiner_feedback") {
      const markingScheme = station.markingScheme;
      const systemPrompt = `You are an experienced OSCE examiner providing DETAILED, FAIR, CONSTRUCTIVE feedback on a student's performance.

STATION: ${station.title}
SPECIALTY: ${station.specialty}
TOTAL MARKS: ${markingScheme.totalMarks}
PASS THRESHOLD: ${markingScheme.passThreshold}/${markingScheme.totalMarks}

MARKING SCHEME:
${markingScheme.domains.map(d => `
Domain: ${d.name} (${d.maxMarks} marks)
Criteria:
${d.criteria.map(c => `  - ${c.item}: ${c.marks} mark(s)`).join("\n")}`).join("\n")}

MODEL ANSWER: ${markingScheme.modelAnswer}

Review the student-patient conversation below and provide a detailed assessment.

Respond ONLY as valid JSON with this exact structure:
{
  "total_score": <integer>,
  "max_score": ${markingScheme.totalMarks},
  "percentage": <float, 0-100>,
  "pass_fail": "pass" | "borderline" | "fail",
  "breakdown": [
    {"name": "<domain name>", "earned": <integer>, "max": <integer>, "comments": "<specific feedback>"}
  ],
  "positives": ["<specific thing done well>", ...],
  "improvements": ["<specific improvement with HOW to improve>", ...],
  "ai_feedback": "<3-4 paragraph narrative feedback in Arabic — comprehensive, fair, actionable>"
}

Be calibrated: pass threshold is ${markingScheme.passThreshold}/${markingScheme.totalMarks} (${Math.round((markingScheme.passThreshold/markingScheme.totalMarks)*100)}%).
${markingScheme.passThreshold/markingScheme.totalMarks >= 0.7 ? "High standards required for pass." : "Reasonable standards for this level."}`;

      const conversationText = messages
        .map(m => `${m.role === "user" ? "طالب" : "مريض"}: ${m.content}`)
        .join("\n");

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        prompt: `يرجى تقييم أداء هذا الطالب في المحطة السريرية:\n\n${conversationText}`,
        temperature: 0.2
      });

      const clean = text.replace(/```json\s?|```/g, "").trim();
      const score = JSON.parse(clean);

      return NextResponse.json(score);
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("OSCE API error:", err);
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}

