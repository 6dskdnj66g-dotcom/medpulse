// src/lib/exams/types.ts
// Unified type system for all exam question banks (PLAB1, UKMLA, USMLE)

export type ExamType = "USMLE_STEP1" | "USMLE_STEP2CK" | "PLAB1" | "UKMLA_AKT";

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionSource = "MedQA" | "MedMCQA" | "AI-Generated" | "Manual";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionExplanation {
  correctReasoning: string;
  whyOthersWrong: Record<string, string>;
  teachingPoint: string;
  references: { source: string; url?: string }[];
}

export interface ClinicalVignette {
  id: string;
  exam: ExamType | ExamType[];
  specialty: string;
  difficulty: Difficulty;

  vignette: string;
  questionStem: string;
  options: QuestionOption[];
  correctAnswerId: string;

  explanation: QuestionExplanation;

  organSystem: string;
  topics: string[];
  ukmlaContentMapId?: string;
  usmleContentOutlineId?: string;

  source: QuestionSource;
  validatedBy?: string;
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface QuestionBlock {
  questions: ClinicalVignette[];
  totalAvailable: number;
  filters: {
    exam?: string;
    specialty?: string;
    difficulty?: string;
  };
}

// ── Adapter: convert existing USMLE format to ClinicalVignette ──────────────
export interface LegacyUSMLEQuestion {
  id: string;
  step: string;
  specialty: string;
  difficulty: "Easy" | "Medium" | "Hard";
  vignette: string;
  options: string[];
  answer: number;
  explanation: string;
  educationalObjective: string;
}

export function adaptUSMLEQuestion(q: LegacyUSMLEQuestion): ClinicalVignette {
  const optionIds = ["A", "B", "C", "D", "E"];
  return {
    id: q.id,
    exam: q.step === "Step 1" ? "USMLE_STEP1" : "USMLE_STEP2CK",
    specialty: q.specialty,
    difficulty: q.difficulty.toLowerCase() as Difficulty,
    vignette: q.vignette,
    questionStem: "What is the most likely diagnosis / most appropriate next step?",
    options: q.options.map((text, i) => ({ id: optionIds[i] ?? String(i), text })),
    correctAnswerId: optionIds[q.answer] ?? "A",
    explanation: {
      correctReasoning: q.explanation,
      whyOthersWrong: {},
      teachingPoint: q.educationalObjective,
      references: [],
    },
    organSystem: q.specialty,
    topics: [q.specialty],
    source: "MedQA",
    createdAt: "2024-01-01",
  };
}

// ── UKMLA Content Map Types ───────────────────────────────────────────────────
export type UKMLACategory = "presentation" | "condition" | "skill" | "professional-knowledge";
export type UKMLATheme =
  | "readiness-to-practice"
  | "managing-uncertainty"
  | "delivering-safe-care";

export interface UKMLAContentMapItem {
  id: string;
  category: UKMLACategory;
  title: string;
  description: string;
  organSystems: string[];
  themes: UKMLATheme[];
  relatedPresentations?: string[];
  keyGuidelines?: string[];
}
