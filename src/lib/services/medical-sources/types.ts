/**
 * Core types for the multi-source medical evidence system.
 */

export type SourceType =
  | 'pubmed'
  | 'openalex'
  | 'europepmc'
  | 'clinicaltrials'
  | 'statpearls'
  | 'rxnorm'
  | 'openfda';

export type SourceCategory =
  | 'guideline'
  | 'research'
  | 'drug'
  | 'educational'
  | 'epidemiology'
  | 'clinical_trial';

export type StudyType =
  | 'rct'
  | 'meta-analysis'
  | 'systematic-review'
  | 'review'
  | 'guideline'
  | 'case-report'
  | 'cohort'
  | 'case-control'
  | 'cross-sectional'
  | 'drug-label'
  | 'educational'
  | 'other';

export type QuestionType = 'factual' | 'conceptual' | 'comparative' | 'diagnostic';
export type Confidence = 'high' | 'medium' | 'low';

export interface MedicalSource {
  id: string;
  source: SourceType;
  category: SourceCategory;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number;
  journal: string | null;
  doi: string | null;
  url: string;
  citationCount?: number;
  isOpenAccess: boolean;
  studyType: StudyType;
  qualityScore?: number;
  language: 'en' | 'ar' | 'other';
}

export interface QueryClassification {
  primaryIntent: SourceCategory;
  secondaryIntents: SourceCategory[];
  specialty: string;
  englishTerms: string[];
  arabicTerms: string[];
  drugNames: string[];
  conditionNames: string[];
  needsRecency: boolean;
  needsGuidelines: boolean;
  needsTrials: boolean;
  questionType: QuestionType;
}

export interface SynthesizedAnswer {
  answer: string;
  sources: MedicalSource[];
  classification?: QueryClassification;
  disclaimer: string;
  confidence: Confidence;
  cached: boolean;
  cost: number;
  responseTimeMs?: number;
}

export interface FetchOptions {
  maxResults?: number;
  minYear?: number;
  studyTypes?: string[];
}