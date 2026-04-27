import { MedicalSource } from './types';

export function scoreSource(source: MedicalSource): number {
  let score = 5;
  const currentYear = new Date().getFullYear();

  const typeScores: Record<string, number> = {
    'guideline': 4,
    'meta-analysis': 3.5,
    'systematic-review': 3,
    'rct': 2.5,
    'cohort': 1.5,
    'case-control': 1,
    'review': 1,
    'cross-sectional': 0.5,
    'case-report': -1,
    'drug-label': 2,
    'educational': 1,
    'other': 0,
  };
  score += typeScores[source.studyType] || 0;

  const age = currentYear - source.year;
  if (age <= 1) score += 1.5;
  else if (age <= 3) score += 1;
  else if (age <= 5) score += 0.5;
  else if (age > 10) score -= 1;

  if (source.citationCount && source.citationCount > 0) {
    const citationBoost = Math.min(2, Math.log10(source.citationCount) * 0.5);
    score += citationBoost;
  }

  const authoritySources: Record<string, number> = {
    'pubmed': 0.5,
    'cochrane': 1,
    'who': 1,
    'cdc': 0.8,
    'nice': 1,
    'dailymed': 0.8,
    'openfda': 0.8,
  };
  score += authoritySources[source.source] || 0;

  if (source.journal) {
    const topJournals = [
      'new england journal of medicine',
      'lancet',
      'jama',
      'bmj',
      'nature medicine',
      'cell',
      'circulation',
      'annals of internal medicine',
    ];
    const journalLower = source.journal.toLowerCase();
    if (topJournals.some(j => journalLower.includes(j))) {
      score += 1;
    }
  }

  if (source.isOpenAccess) score += 0.3;

  return Math.max(0, Math.min(10, score));
}
