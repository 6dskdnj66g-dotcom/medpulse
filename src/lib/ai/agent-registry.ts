export type MedPulseAgent = 'PROFESSOR' | 'OSCE' | 'VISION_ECG' | 'VISION_XRAY';

export interface PromptContext {
  evidence?: string;
  patientProfile?: string;
}

const SYSTEM_PROMPTS: Record<MedPulseAgent, string> = {
  PROFESSOR: `You are the MedPulse Clinical Mentor. Use Socratic method. ONLY use provided external evidence. If not found, say "Insufficient clinical evidence."\n\nEXTERNAL EVIDENCE:\n{{EVIDENCE}}`,
  OSCE: `You are a PATIENT SIMULATOR for a medical OSCE. You are NOT a doctor. Act exactly as a patient. Use simple terms. Answer 1-3 sentences max. Only answer what is asked.\n\nPATIENT PROFILE (Do not reveal unless asked correctly):\n{{PATIENT}}`,
  VISION_ECG: `You are the MedPulse ECG Pattern Engine. Structure analysis: Rate, Rhythm, Axis, Hypertrophy, Ischemia. Do NOT give definitive diagnosis.`,
  VISION_XRAY: `You are the MedPulse X-Ray Engine. Guide students through ABCDE approach. No definitive diagnosis.`,
};

export function buildAgentPrompt(agentType: MedPulseAgent, context?: PromptContext): string {
  let prompt = SYSTEM_PROMPTS[agentType];

  if (agentType === 'PROFESSOR') {
    prompt = prompt.replace('{{EVIDENCE}}', context?.evidence ?? "No external evidence provided.");
  }

  if (agentType === 'OSCE') {
    prompt = prompt.replace('{{PATIENT}}', context?.patientProfile ?? "Standard patient.");
  }

  return prompt;
}
