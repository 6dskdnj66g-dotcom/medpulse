// src/lib/osce/patient-engine.ts
// PatientProfile interface + deterministic system-prompt builder
// The patient AI ONLY uses this prompt — rubric is NEVER included here

export interface PatientProfile {
  readonly id: string;
  readonly name: string;          // LOCKED — never changes across the session
  readonly nameAr: string;        // Arabic name variant
  readonly age: number;
  readonly gender: "M" | "F";
  readonly occupation: string;
  readonly occupationAr: string;
  readonly presentingComplaint: string;
  readonly presentingComplaintAr: string;

  readonly history: {
    hpi: Record<string, string>;         // revealed only on direct question
    pmh: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
    socialHistory: Record<string, string>;
    systemsReview: Record<string, string>;
  };

  readonly vitalsIfAsked: {
    bp?: string;
    hr?: number;
    rr?: number;
    temp?: number;
    spo2?: number;
    weight?: number;
  };

  readonly examFindings: Record<string, string>;

  readonly doNotVolunteer: string[];  // MUST NOT proactively share

  readonly emotionalState: string;
  readonly communicationStyle: string;
}

export interface RubricItem {
  id: string;
  domain: string;
  criterion: string;
  criterionAr: string;
  points: number;
  keywords: string[];     // words in student question that count as asking this
  required: boolean;      // red-flag: must be asked to pass
}

export interface OSCEScenario {
  id: string;
  title: string;
  titleAr: string;
  specialty: string;
  stationType: "history_taking" | "examination" | "management" | "communication" | "procedure";
  difficulty: "year1" | "year2" | "year3" | "year4" | "finals" | "postgrad";
  durationMinutes: number;
  setting: string;
  settingAr: string;
  patientBrief: string;
  patientBriefAr: string;
  patient: PatientProfile;
  rubric: RubricItem[];
  totalMarks: number;
  passThreshold: number;
  expectedDiagnosis: string;
  differentialDiagnoses: string[];
  learningPoints: string[];
  reference: string;
  redFlags: string[];     // must identify these to avoid automatic fail
}

// ── System-prompt builder ────────────────────────────────────────────────────
// Produces a deterministic, injection-resistant patient prompt.
// NEVER include the rubric, expected diagnosis, or pass criteria here.
export function buildPatientSystemPrompt(
  patient: PatientProfile,
  recentMessages: { role: string; content: string }[],
  lang: "ar" | "en" = "ar"
): string {
  const isAr = lang === "ar";
  const name = isAr && patient.nameAr ? patient.nameAr : patient.name;
  const complaint = isAr && patient.presentingComplaintAr
    ? patient.presentingComplaintAr
    : patient.presentingComplaint;
  const occupation = isAr && patient.occupationAr ? patient.occupationAr : patient.occupation;

  const hpiLines = Object.entries(patient.history.hpi)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const socialLines = Object.entries(patient.history.socialHistory)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const examLines = Object.entries(patient.vitalsIfAsked)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const contextWindow = recentMessages
    .slice(-30)
    .map(m => `${m.role === "user" ? (isAr ? "الطالب" : "Student") : name}: ${m.content}`)
    .join("\n");

  return `
=== PATIENT SIMULATION — OSCE PRACTICE ===
You are roleplaying as a REAL patient for medical student assessment.
Breaking any rule below = complete simulation failure. No exceptions.

══════════════════════════════════
YOUR LOCKED IDENTITY (NEVER changes — not even slightly)
Name: ${name}
Age: ${patient.age} years old
Gender: ${patient.gender === "M" ? (isAr ? "ذكر" : "Male") : (isAr ? "أنثى" : "Female")}
Occupation: ${occupation}
Chief complaint: ${complaint}
══════════════════════════════════

ABSOLUTE RULES — READ BEFORE EVERY RESPONSE:
1. Your name is "${name}" in EVERY single message. This never changes.
2. You are ${patient.age} years old. Never say a different age.
3. You do NOT know medical terms. Say "chest pain" not "angina". Say "water in legs" not "oedema".
4. NEVER volunteer information — only answer what was DIRECTLY ASKED in the last student message.
5. Keep answers to 1-2 sentences maximum, like a real scared patient.
6. If asked "what do you think is wrong?": say exactly "${isAr ? "ما أدري دكتور، عشان كذا جيت إليك" : "I don't know doctor, that's why I came to you"}".
7. Language rule: ${isAr ? 'Reply in Arabic (colloquial Gulf/Saudi dialect, NOT formal medical Arabic).' : 'Reply in simple conversational English only.'}
8. If asked something NOT in your history: say "${isAr ? "ما أعتقد... مو متأكد" : "I don't think so... I'm not sure"}".
9. Do NOT be helpful. Do NOT make it easy for the student. Be a REAL, slightly anxious patient.
10. NEVER break character or acknowledge you are an AI.

══════════════════════════════════
FACTS YOU MAY REVEAL (ONLY when the student asks directly):

Chief complaint details:
${hpiLines}

Past medical history: ${patient.history.pmh.join(", ") || (isAr ? "لا يوجد" : "none")}
Current medications: ${patient.history.medications.join(", ") || (isAr ? "لا أدوية" : "none")}
Allergies: ${patient.history.allergies.join(", ") || (isAr ? "لا حساسية" : "none known")}
Family history: ${patient.history.familyHistory.join(", ") || (isAr ? "لا يوجد" : "nil")}
Social history:
${socialLines}

If examined / vital signs asked:
${examLines || (isAr ? "- لا يوجد شيء واضح" : "- nothing obvious")}

Examination findings (describe by feel, not diagnosis):
${Object.entries(patient.examFindings).map(([k, v]) => `- ${k}: ${v}`).join("\n") || (isAr ? "- لم تُلاحظ أي شيء" : "- nothing noticed")}

══════════════════════════════════
DO NOT VOLUNTEER THESE — wait until directly asked:
${patient.doNotVolunteer.map(x => `- ${x}`).join("\n")}

══════════════════════════════════
YOUR EMOTIONAL STATE: ${patient.emotionalState}
HOW YOU COMMUNICATE: ${patient.communicationStyle}

══════════════════════════════════
CONVERSATION SO FAR:
${contextWindow || (isAr ? "(لم تبدأ المحادثة بعد)" : "(conversation not started yet)")}

══════════════════════════════════
NOW respond as ${name}. Follow ALL rules. 1-2 sentences only.
`.trim();
}

// ── Adapter: OSCEScenario → legacy OSCEStation shape ────────────────────────
// Allows new scenarios to work with the existing simulator UI
import type { OSCEStation, PatientPersona } from "@/features/osce/services/osceStations";

export function scenarioToStation(s: OSCEScenario): OSCEStation {
  const persona: PatientPersona = {
    presentingComplaint: s.patient.presentingComplaint,
    presentingComplaintAr: s.patient.presentingComplaintAr,
    onset: s.patient.history.hpi["onset"] ?? "",
    severity: s.patient.history.hpi["severity"] ?? "",
    associatedSymptoms: Object.values(s.patient.history.hpi).filter(Boolean),
    pastMedicalHistory: s.patient.history.pmh,
    medications: s.patient.history.medications,
    allergies: s.patient.history.allergies.join(", ") || "NKDA",
    socialHistory: Object.entries(s.patient.history.socialHistory).map(([k,v]) => `${k}: ${v}`).join("; "),
    familyHistory: s.patient.history.familyHistory.join("; "),
    systemsReview: s.patient.history.systemsReview,
    personality: (s.patient.emotionalState.toLowerCase().includes("anxiety") || s.patient.emotionalState.toLowerCase().includes("anxious"))
      ? "anxious"
      : (s.patient.communicationStyle.toLowerCase().includes("reluctant") ? "reluctant" : "cooperative"),
    hiddenCues: s.patient.doNotVolunteer,
    physicalFindings: Object.entries(s.patient.examFindings).map(([k,v]) => `${k}: ${v}`).join("; "),
  };

  const domains = Array.from(new Set(s.rubric.map(r => r.domain))).map(domain => {
    const criteria = s.rubric.filter(r => r.domain === domain);
    return {
      name: domain,
      nameAr: domain,
      maxMarks: criteria.reduce((a, c) => a + c.points, 0),
      criteria: criteria.map(c => ({ item: c.criterion, marks: c.points, category: domain })),
    };
  });

  return {
    id: s.id,
    title: s.title,
    titleAr: s.titleAr,
    specialty: s.specialty,
    stationType: s.stationType === "management" ? "mixed" : s.stationType,
    difficulty: s.difficulty,
    durationMinutes: s.durationMinutes,
    patientBrief: s.patientBriefAr || s.patientBrief,
    patientName: s.patient.nameAr || s.patient.name,
    patientAge: s.patient.age,
    patientSex: s.patient.gender,
    patientSetting: s.settingAr || s.setting,
    patientPersona: persona,
    markingScheme: {
      domains,
      totalMarks: s.totalMarks,
      passThreshold: s.passThreshold,
      modelAnswer: `${s.expectedDiagnosis}. DDx: ${s.differentialDiagnoses.join(", ")}. Ref: ${s.reference}`,
    },
    learningPoints: s.learningPoints,
    relatedTopics: s.differentialDiagnoses,
    tags: [s.specialty.toLowerCase(), s.stationType],
  };
}

