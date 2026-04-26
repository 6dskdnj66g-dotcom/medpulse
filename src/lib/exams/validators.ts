// src/lib/exams/validators.ts
// Question validation pipeline — run before accepting any question into bank

import type { ClinicalVignette, ValidationResult } from "./types";

const UK_SOURCES = ["NICE", "BNF", "GMC", "RCP", "RCS", "RCEM", "BTS", "RCOG", "RCPCH", "RCPsych"];
const FUTURE_DATE_PATTERN = /\b(202[7-9]|20[3-9]\d|2[1-9]\d\d)\b/;
const US_JARGON = ["medicare", "medicaid", "attending physician", "acetaminophen", "epinephrine auto-injector", "ER ", "ED ", "primary care physician", "PCP"];

export function validateQuestion(q: ClinicalVignette): ValidationResult {
  const issues: string[] = [];

  // 1. Correct answer exists in options
  if (!q.options.find(o => o.id === q.correctAnswerId)) {
    issues.push(`Correct answer ID "${q.correctAnswerId}" not found in options`);
  }

  // 2. Exactly 5 options for PLAB/UKMLA, 4-5 for USMLE
  if (q.options.length < 4 || q.options.length > 5) {
    issues.push(`Invalid option count: ${q.options.length} (expected 4-5)`);
  }

  // 3. All wrong options have explanations
  for (const opt of q.options) {
    if (opt.id !== q.correctAnswerId && !q.explanation.whyOthersWrong[opt.id]) {
      issues.push(`Missing explanation for wrong option ${opt.id}`);
    }
  }

  // 4. Has at least one reference
  if (!q.explanation.references || q.explanation.references.length === 0) {
    issues.push("No references provided");
  }

  // 5. PLAB/UKMLA questions must reference UK sources
  if (
    (q.exam === "PLAB1" ||
      q.exam === "UKMLA_AKT" ||
      (Array.isArray(q.exam) && (q.exam.includes("PLAB1") || q.exam.includes("UKMLA_AKT"))))
  ) {
    const hasUKSource = q.explanation.references.some(r =>
      UK_SOURCES.some(uk => r.source.toUpperCase().includes(uk))
    );
    if (!hasUKSource) {
      issues.push("PLAB/UKMLA question lacks UK reference (NICE/BNF/GMC/RCP)");
    }

    // Check for US jargon in PLAB questions
    const fullText = (q.vignette + q.questionStem + q.options.map(o => o.text).join(" ")).toLowerCase();
    for (const jargon of US_JARGON) {
      if (fullText.includes(jargon.toLowerCase())) {
        issues.push(`US jargon found: "${jargon}" — use UK equivalent`);
      }
    }
  }

  // 6. No fabricated future dates
  const allText = JSON.stringify(q);
  if (FUTURE_DATE_PATTERN.test(allText)) {
    issues.push("Contains future/fabricated dates beyond 2026");
  }

  // 7. Vignette and question stem are present
  if (!q.vignette || q.vignette.length < 50) {
    issues.push("Vignette too short (minimum 50 characters)");
  }
  if (!q.questionStem || q.questionStem.length < 10) {
    issues.push("Question stem too short");
  }

  // 8. Teaching point present
  if (!q.explanation.teachingPoint || q.explanation.teachingPoint.length < 10) {
    issues.push("Missing or too-short teaching point");
  }

  return { valid: issues.length === 0, issues };
}

export function validateBatch(questions: ClinicalVignette[]): {
  passed: ClinicalVignette[];
  failed: { question: ClinicalVignette; issues: string[] }[];
  summary: string;
} {
  const passed: ClinicalVignette[] = [];
  const failed: { question: ClinicalVignette; issues: string[] }[] = [];

  for (const q of questions) {
    const result = validateQuestion(q);
    if (result.valid) {
      passed.push(q);
    } else {
      failed.push({ question: q, issues: result.issues });
    }
  }

  return {
    passed,
    failed,
    summary: `${passed.length}/${questions.length} passed validation. ${failed.length} failed.`,
  };
}
