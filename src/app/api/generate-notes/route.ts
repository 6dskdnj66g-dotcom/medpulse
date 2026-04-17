import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 60;

const NOTES_PROMPT = `
You are the MedPulse AI Clinical Documentation Assistant (April 2026 Edition).
You specialize in generating professional clinical notes following international standards.

SOURCES:
- ACGME Documentation Standards 2026
- Joint Commission Documentation Requirements
- ICD-11 (WHO 2025) coding guidelines
- UpToDate Clinical Documentation 2026

YOUR TASK: Generate a complete, professional SOAP Note from the clinical information provided.

FORMAT:
# SOAP NOTE — [Date: April 2026]

## S — SUBJECTIVE
Chief Complaint (CC): 
History of Present Illness (HPI): [detailed OLDCART/SOCRATES history]
Past Medical History (PMH):
Medications:
Allergies:
Social History:
Family History:

## O — OBJECTIVE
Vital Signs: [BP, HR, RR, Temp, SpO2, Weight]
General Appearance:
Physical Examination Findings: [System by system]
Investigations: [Labs, Imaging]

## A — ASSESSMENT
Primary Diagnosis: [with ICD-11 code if applicable]
Differential Diagnoses:
1. [Diagnosis] — Evidence: [reasoning]
2. [Diagnosis] — Evidence: [reasoning]

## P — PLAN
Investigations ordered:
Medications: [drug, dose, route, frequency, duration]
Non-pharmacological: 
Follow-up:
Patient Education:
Referrals:

---
[Evidence Level Note: Based on [Source] guidelines, April 2026]

RULES:
- Be precise, clinical, and use proper medical terminology
- Always include ICD-11 codes for diagnoses
- Recommend follow-up and patient education
`;

export async function POST(req: Request) {
  try {
    const { clinicalInfo } = await req.json();

    if (!clinicalInfo || clinicalInfo.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Insufficient clinical information provided." }),
        { status: 400 }
      );
    }

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: NOTES_PROMPT,
      prompt: `Generate a complete clinical SOAP note from the following information:\n\n${clinicalInfo}`,
      temperature: 0.2,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error("Clinical Notes Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate clinical note." }),
      { status: 500 }
    );
  }
}

