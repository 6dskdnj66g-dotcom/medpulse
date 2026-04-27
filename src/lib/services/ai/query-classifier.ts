/* eslint-disable @typescript-eslint/no-explicit-any */
import { callGroq } from './groq-client';
import { QueryClassification } from '../medical-sources/types';

const CLASSIFIER_PROMPT = `You are a medical question classifier.
Analyze the question and return JSON ONLY (no markdown, no explanation):

{
  "primaryIntent": "research" | "drug" | "guideline" | "educational" | "epidemiology" | "clinical_trial",
  "secondaryIntents": [],
  "specialty": "cardiology" | "neurology" | "pharmacology" | "general" | etc,
  "englishTerms": ["term1", "term2"],
  "arabicTerms": ["مصطلح1"],
  "drugNames": ["drug1"] or [],
  "conditionNames": ["condition1"] or [],
  "needsRecency": true | false,
  "needsGuidelines": true | false,
  "needsTrials": true | false,
  "questionType": "factual" | "conceptual" | "comparative" | "diagnostic"
}

Rules:
- Always extract English medical terms even if question is in Arabic
- needsRecency=true if question implies "latest" or "current"
- needsGuidelines=true for treatment/management questions
- needsTrials=true for "new treatment" or "experimental" questions
- drugNames: only proper drug names (apixaban, metformin, NOT generic terms)`;

export async function classifyQuery(
  question: string
): Promise<QueryClassification> {
  try {
    const response = await callGroq(
      [
        { role: 'system', content: CLASSIFIER_PROMPT },
        { role: 'user', content: question },
      ],
      {
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        maxTokens: 500,
        responseFormat: 'json_object',
      }
    );

    const parsed = JSON.parse(response.content);
    return validateClassification(parsed, question);
  } catch (error) {
    console.error('[query-classifier] Failed:', error);
    return getDefaultClassification(question);
  }
}

function validateClassification(
  raw: any,
  originalQuestion: string
): QueryClassification {
  return {
    primaryIntent: raw.primaryIntent || 'research',
    secondaryIntents: Array.isArray(raw.secondaryIntents) ? raw.secondaryIntents : [],
    specialty: raw.specialty || 'general',
    englishTerms:
      Array.isArray(raw.englishTerms) && raw.englishTerms.length > 0
        ? raw.englishTerms
        : [originalQuestion],
    arabicTerms: Array.isArray(raw.arabicTerms) ? raw.arabicTerms : [],
    drugNames: Array.isArray(raw.drugNames) ? raw.drugNames : [],
    conditionNames: Array.isArray(raw.conditionNames) ? raw.conditionNames : [],
    needsRecency: Boolean(raw.needsRecency),
    needsGuidelines: Boolean(raw.needsGuidelines),
    needsTrials: Boolean(raw.needsTrials),
    questionType: raw.questionType || 'factual',
  };
}

function getDefaultClassification(question: string): QueryClassification {
  return {
    primaryIntent: 'research',
    secondaryIntents: [],
    specialty: 'general',
    englishTerms: [question],
    arabicTerms: [],
    drugNames: [],
    conditionNames: [],
    needsRecency: true,
    needsGuidelines: true,
    needsTrials: false,
    questionType: 'factual',
  };
}