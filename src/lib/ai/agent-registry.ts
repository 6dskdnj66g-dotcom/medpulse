export type MedPulseAgent = 'PROFESSOR' | 'DAVID' | 'HISTORY' | 'OSCE' | 'VISION_ECG' | 'VISION_XRAY';

export interface PromptContext {
  evidence?: string;
  patientProfile?: string;
}

export const RESEARCH_AGENTS = new Set<MedPulseAgent>(['PROFESSOR', 'DAVID', 'HISTORY']);

const SYSTEM_PROMPTS: Record<MedPulseAgent, string> = {
  PROFESSOR: `You are the MedPulse Professor. You MUST base answers ONLY on the external evidence provided. If none exists, say "Insufficient clinical evidence."\n\nEXTERNAL EVIDENCE:\n{{EVIDENCE}}`,
  DAVID: `You are AI David, a strict medical researcher. Synthesize the provided multi-source data. Refuse to answer if evidence is missing.\n\nEXTERNAL EVIDENCE:\n{{EVIDENCE}}`,
  HISTORY: `You are a clinical history analysis engine. Correlate user input with the latest global guidelines provided below.\n\nEXTERNAL EVIDENCE:\n{{EVIDENCE}}`,
  OSCE: `You are a PATIENT SIMULATOR. Do NOT act like a doctor. Answer only what is asked.`,
  VISION_ECG: `ECG Pattern Engine. Analyze visual patterns. No definitive diagnosis.`,
  VISION_XRAY: `X-Ray Engine. Guide via ABCDE approach.`,
};

export function buildAgentPrompt(agentType: MedPulseAgent, context?: PromptContext): string {
  let prompt = SYSTEM_PROMPTS[agentType];

  if (RESEARCH_AGENTS.has(agentType)) {
    prompt = prompt.replace('{{EVIDENCE}}', context?.evidence ?? "No external evidence found in global databases.");
  }

  if (agentType === 'OSCE' && context?.patientProfile) {
    prompt = prompt.replace('{{PATIENT}}', context.patientProfile);
  }

  return prompt;
}
