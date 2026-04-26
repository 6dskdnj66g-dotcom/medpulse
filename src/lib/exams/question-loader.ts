// src/lib/exams/question-loader.ts
// Server-side loader for all exam question banks
// Only call from API routes or server components

import * as fs from "fs";
import * as path from "path";
import type { ClinicalVignette } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "exams");
const cache = new Map<string, ClinicalVignette[]>();

function loadFile(filePath: string): ClinicalVignette[] {
  if (cache.has(filePath)) return cache.get(filePath)!;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ClinicalVignette[];
    cache.set(filePath, data);
    return data;
  } catch {
    return [];
  }
}

export function getPLAB1Questions(): ClinicalVignette[] {
  const dir = path.join(DATA_DIR, "plab1");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .flatMap(f => loadFile(path.join(dir, f)));
}

export function getUKMLAQuestions(): ClinicalVignette[] {
  const dir = path.join(DATA_DIR, "ukmla");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .flatMap(f => loadFile(path.join(dir, f)));
}

export function filterQuestions(
  questions: ClinicalVignette[],
  filters: {
    specialty?: string;
    difficulty?: string;
    organSystem?: string;
    ukmlaContentMapId?: string;
  }
): ClinicalVignette[] {
  return questions.filter(q => {
    if (filters.specialty && filters.specialty !== "all" && q.specialty !== filters.specialty) return false;
    if (filters.difficulty && filters.difficulty !== "all" && q.difficulty !== filters.difficulty) return false;
    if (filters.organSystem && filters.organSystem !== "all" && q.organSystem !== filters.organSystem) return false;
    if (filters.ukmlaContentMapId && q.ukmlaContentMapId !== filters.ukmlaContentMapId) return false;
    return true;
  });
}

export function shuffleAndLimit<T>(arr: T[], limit: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, limit);
}

export function clearCache(): void {
  cache.clear();
}
