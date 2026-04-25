// RAG retrieval layer — grounds AI responses in the medical KB
import fs from "fs";
import path from "path";

export interface RagContext {
  source: string;
  title: string;
  content: string;
  evidenceLevel?: string;
  specialty?: string;
}

const KB_ROOT = path.join(process.cwd(), "data", "medical-kb");

function loadJsonSafe<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  cardiology: ["heart", "cardiac", "MI", "ACS", "CHF", "arrhythmia", "AF", "قلب", "نبض", "أمراض القلب"],
  pulmonology: ["lung", "COPD", "asthma", "pneumonia", "respiratory", "رئة", "تنفس", "ربو"],
  nephrology: ["kidney", "CKD", "GFR", "creatinine", "dialysis", "كلية", "غسيل كلوي"],
  endocrinology: ["diabetes", "thyroid", "HbA1c", "insulin", "سكري", "غدة درقية"],
  neurology: ["stroke", "seizure", "epilepsy", "dementia", "دماغ", "صداع", "صرع", "سكتة"],
  gastroenterology: ["liver", "hepatitis", "IBD", "GERD", "كبد", "معدة", "قولون"],
  infectious: ["infection", "antibiotic", "sepsis", "HIV", "عدوى", "مضادات حيوية"],
};

export function inferSpecialty(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return specialty;
    }
  }
  return null;
}

export function extractMedicalKeywords(query: string): string[] {
  const stopwords = new Set(["the", "a", "an", "is", "are", "was", "were", "في", "من", "إلى", "على", "هل"]);
  return query
    .split(/\s+/)
    .map((w) => w.replace(/[.,?!؟]/g, "").toLowerCase())
    .filter((w) => w.length > 3 && !stopwords.has(w));
}

export async function retrieveRelevantContext(query: string): Promise<RagContext[]> {
  const contexts: RagContext[] = [];

  // Load guideline summaries matching the inferred specialty
  const specialty = inferSpecialty(query);
  if (specialty) {
    const guidelinesDir = path.join(KB_ROOT, "guidelines");
    try {
      const files = fs.readdirSync(guidelinesDir).filter((f) =>
        f.includes(specialty) && f.endsWith(".json")
      );
      for (const file of files.slice(0, 2)) {
        const doc = loadJsonSafe<RagContext>(path.join(guidelinesDir, file));
        if (doc) contexts.push(doc);
      }
    } catch {
      // KB not populated yet — fail gracefully
    }
  }

  // Load lab reference ranges if query mentions lab values
  const labKeywords = ["lab", "result", "level", "مختبر", "نتيجة", "قيمة"];
  if (labKeywords.some((kw) => query.toLowerCase().includes(kw))) {
    const labRef = loadJsonSafe<RagContext>(
      path.join(KB_ROOT, "lab-references", "normal-ranges.json")
    );
    if (labRef) contexts.push(labRef);
  }

  return contexts.slice(0, 5);
}

export function buildAugmentedPrompt(query: string, contexts: RagContext[]): string {
  if (contexts.length === 0) return query;

  const contextBlock = contexts
    .map((c) => `[${c.source}] ${c.title}:\n${c.content}`)
    .join("\n\n");

  return `RELEVANT CLINICAL CONTEXT:\n${contextBlock}\n\nUSER QUERY:\n${query}`;
}
