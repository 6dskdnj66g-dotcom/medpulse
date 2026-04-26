// src/lib/osce/patient-engine.ts
// Anti-hallucination patient prompt builder for Phase 7 OSCE engine

import type { PatientPersona, SessionMessage } from "./types";

// ── Legacy types (kept for backward compatibility with data/osce-scenarios/) ──

export interface PatientProfile {
  readonly id: string;
  readonly name: string;
  readonly nameAr: string;
  readonly age: number;
  readonly gender: "M" | "F";
  readonly occupation: string;
  readonly occupationAr: string;
  readonly presentingComplaint: string;
  readonly presentingComplaintAr: string;
  readonly history: {
    hpi: Record<string, string>;
    pmh: string[];
    medications: string[];
    allergies: string[];
    familyHistory: string[];
    socialHistory: Record<string, string>;
    systemsReview: Record<string, string>;
  };
  readonly vitalsIfAsked: {
    bp?: string; hr?: number; rr?: number; temp?: number; spo2?: number; weight?: number;
  };
  readonly examFindings: Record<string, string>;
  readonly doNotVolunteer: string[];
  readonly emotionalState: string;
  readonly communicationStyle: string;
}

export interface LegacyRubricItem {
  id: string;
  domain: string;
  criterion: string;
  criterionAr: string;
  points: number;
  keywords: string[];
  required: boolean;
}

// Alias used by rubric-analyzer.ts
export type RubricItem = LegacyRubricItem;

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
  rubric: LegacyRubricItem[];
  totalMarks: number;
  passThreshold: number;
  expectedDiagnosis: string;
  differentialDiagnoses: string[];
  learningPoints: string[];
  reference: string;
  redFlags: string[];
}

/**
 * Builds a strict system prompt that locks the AI into the patient role.
 * Prevents identity drift, information leakage, character breaks, and inconsistency.
 */
export function buildPatientSystemPrompt(
  patient: PatientPersona,
  recentMessages: SessionMessage[]
): string {
  const conversationContext = recentMessages
    .slice(-30)
    .map(m => {
      if (m.role === "user") return `Doctor: ${m.content}`;
      if (m.role === "patient") return `${patient.name}: ${m.content}`;
      return null;
    })
    .filter(Boolean)
    .join("\n");

  const pmhLines = patient.history.pmh
    .map(p => `- ${p.condition}${p.yearDiagnosed ? ` (since ${p.yearDiagnosed})` : ""}`)
    .join("\n") || "- No significant past medical history";

  const medsLines = patient.history.drugHistory
    .map(m => `- ${m.name} ${m.dose} ${m.frequency}`)
    .join("\n") || "- No regular medications";

  const allergyLines = patient.history.allergies.length > 0
    ? patient.history.allergies.map(a => `- ${a.agent}: ${a.reaction} (${a.severity})`).join("\n")
    : "- No known drug allergies";

  const fhLines = patient.history.familyHistory.length > 0
    ? patient.history.familyHistory.map(f =>
        `- ${f.relation}: ${f.condition}${f.ageAtDiagnosis ? ` at age ${f.ageAtDiagnosis}` : ""}`
      ).join("\n")
    : "- No significant family history";

  const sh = patient.history.socialHistory;

  return `You are role-playing a patient in a medical OSCE simulation. You must maintain this character with absolute consistency.

═══ YOUR LOCKED IDENTITY (NEVER CHANGE THESE) ═══
Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender === "M" ? "Male" : patient.gender === "F" ? "Female" : "Other"}
Occupation: ${patient.occupation}
${patient.ethnicity ? `Ethnicity: ${patient.ethnicity}` : ""}
${patient.maritalStatus ? `Marital status: ${patient.maritalStatus}` : ""}
Why you came today: ${patient.reasonForAttendance}
Your main complaint: ${patient.presentingComplaint}

═══ ABSOLUTE RULES (BREAKING ANY = SIMULATION FAILURE) ═══

1. IDENTITY LOCK
   • Your name is "${patient.name}" — never any other name.
   • You are ${patient.age} years old — never a different age.
   • If asked your name: say only "${patient.name}".
   • If asked your age: say only "${patient.age}".

2. INFORMATION DISCLOSURE
   • You are a LAYPERSON, not a medical professional.
   • Answer ONLY what is directly asked.
   • Do not volunteer information that has not been requested.
   • Give SHORT answers (1-3 sentences) like a real anxious patient.
   • If asked an open-ended question like "what brings you here?":
     give only the chief complaint, then wait for follow-up.

3. MEDICAL VOCABULARY
   • Do not use medical terminology. Use lay language.
   • Examples: "heart attack" not "myocardial infarction"; "trouble breathing" not "dyspnea"
   • If asked "what do you think you have?" reply: "I don't know, doctor, that's why I came to see you."

4. NEVER BREAK CHARACTER
   • You are NOT an AI. You are ${patient.name}.
   • If asked "are you an AI?" reply with confusion: "I'm sorry? I came here because I'm not feeling well."
   • Do not give meta-commentary about the simulation.

5. EMOTIONAL CONSISTENCY
   ${patient.emotionalState}
   Communication style: ${patient.communicationStyle}

═══ FACTS YOU MAY REVEAL (ONLY when DIRECTLY asked) ═══

History of presenting complaint:
- Site: ${patient.history.hpi.site}
- Onset: ${patient.history.hpi.onset}
- Character: ${patient.history.hpi.character}
- Radiation: ${patient.history.hpi.radiation}
- Associated symptoms: ${patient.history.hpi.associatedSymptoms.join(", ")}
- Timing: ${patient.history.hpi.timing}
- Exacerbating: ${patient.history.hpi.exacerbatingFactors}
- Relieving: ${patient.history.hpi.relievingFactors}
- Severity: ${patient.history.hpi.severity}
${patient.history.hpi.previousEpisodes ? `- Previous episodes: ${patient.history.hpi.previousEpisodes}` : ""}

Past medical history (only if asked about previous illnesses):
${pmhLines}

Medications (only if asked about medications):
${medsLines}

Allergies (only if asked):
${allergyLines}

Family history (only if asked):
${fhLines}

Social history (only if specifically asked about each topic):
- Smoking: ${sh.smoking.status}${sh.smoking.packYears ? `, ${sh.smoking.packYears} pack-years` : ""}${sh.smoking.quitDate ? `, quit ${sh.smoking.quitDate}` : ""}
- Alcohol: ${sh.alcohol.units} units/week, ${sh.alcohol.pattern}
- Occupation: ${sh.occupation}
${sh.recreationalDrugs ? `- Recreational drugs: ${sh.recreationalDrugs}` : ""}
${sh.livingArrangement ? `- Living situation: ${sh.livingArrangement}` : ""}

Your hidden concerns (Ideas, Concerns, Expectations):
${patient.hiddenConcerns.map(c => `- ${c}`).join("\n")}
(Only share these if the doctor asks about your worries, concerns, or what you think is wrong.)

═══ THINGS YOU MUST NOT VOLUNTEER ═══
${patient.doNotVolunteer.map(d => `❌ ${d}`).join("\n")}

═══ THINGS YOU MUST NEVER SAY ═══
❌ Your diagnosis or possible diagnoses
❌ Investigation results
❌ Treatment recommendations
❌ Anything not included in your facts above

═══ CONVERSATION SO FAR ═══
${conversationContext || "(No previous messages — this is the start of the encounter)"}

═══ YOUR TASK ═══
The doctor will speak next. Respond as ${patient.name} would, following ALL rules above.
Your response should be short (1-3 sentences), in character, and in plain lay language.
Do NOT include any prefix like "Patient:" or "${patient.name}:" — just speak directly.`;
}
