import Groq from 'groq-sdk';
import { QueryClassification, SourceCategory } from './types';

const ROUTER_PROMPT = `أنت مصنّف أسئلة طبية. مهمتك تحديد:
1. نوع السؤال (research/drug/guideline/educational/clinical_trial/epidemiology)
2. التخصص الطبي
3. المصطلحات الطبية بالإنجليزية للبحث
4. هل يحتاج guidelines حديثة؟
5. هل يحتاج تجارب سريرية حالية؟
6. أسماء الأدوية المذكورة (إن وجدت)
7. أسماء الأمراض المذكورة

أرجع JSON فقط، بهذا الشكل بالضبط:
{
  "primaryIntent": "research",
  "secondaryIntents": ["guideline"],
  "specialty": "cardiology",
  "englishTerms": ["atrial fibrillation", "anticoagulation"],
  "arabicTerms": ["الرجفان الأذيني"],
  "drugNames": ["apixaban", "warfarin"],
  "conditionNames": ["atrial fibrillation"],
  "needsRecency": true,
  "needsGuidelines": true,
  "needsTrials": false,
  "questionType": "comparative"
}`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function classifyQuery(question: string): Promise<QueryClassification> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: ROUTER_PROMPT },
        { role: 'user', content: question },
      ],
      temperature: 0,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    return validateClassification(parsed, question);
  } catch {
    return getDefaultClassification(question);
  }
}

function validateClassification(raw: unknown, originalQuestion: string): QueryClassification {
  const r = raw as Record<string, unknown>;
  return {
    primaryIntent: (r.primaryIntent as SourceCategory) || 'research',
    secondaryIntents: Array.isArray(r.secondaryIntents) ? (r.secondaryIntents as SourceCategory[]) : [],
    specialty: (r.specialty as string) || 'general',
    englishTerms: Array.isArray(r.englishTerms) && (r.englishTerms as string[]).length > 0
      ? (r.englishTerms as string[])
      : [originalQuestion],
    arabicTerms: Array.isArray(r.arabicTerms) ? (r.arabicTerms as string[]) : [],
    drugNames: Array.isArray(r.drugNames) ? (r.drugNames as string[]) : [],
    conditionNames: Array.isArray(r.conditionNames) ? (r.conditionNames as string[]) : [],
    needsRecency: Boolean(r.needsRecency),
    needsGuidelines: Boolean(r.needsGuidelines),
    needsTrials: Boolean(r.needsTrials),
    questionType: (r.questionType as QueryClassification['questionType']) || 'factual',
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

export function decideSources(classification: QueryClassification): SourceCategory[] {
  const sources = new Set<SourceCategory>();
  sources.add(classification.primaryIntent);
  classification.secondaryIntents.forEach(s => sources.add(s));

  if (classification.drugNames && classification.drugNames.length > 0) {
    sources.add('drug');
  }
  if (classification.needsTrials) {
    sources.add('clinical_trial');
  }
  if (classification.needsGuidelines) {
    sources.add('guideline');
  }
  if (classification.questionType === 'conceptual') {
    sources.add('educational');
  }

  return Array.from(sources);
}
