// src/lib/osce/types.ts
// Complete type system for Phase 7 OSCE station engine

export type OSCEExamType = "PLAB2" | "USMLE_STEP2CS" | "UK_CPSA" | "GENERAL";

export type OSCECategory =
  | "history-taking"
  | "focused-examination"
  | "communication-skills"
  | "breaking-bad-news"
  | "informed-consent"
  | "ethical-dilemma"
  | "telephone-consultation"
  | "emergency-management"
  | "data-interpretation"
  | "prescribing"
  | "procedure-explanation";

export type OSCEDifficulty = "fy1-level" | "fy2-level" | "registrar-level";

export interface HistoryOfPresentingIllness {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associatedSymptoms: string[];
  timing: string;
  exacerbatingFactors: string;
  relievingFactors: string;
  severity: string;
  previousEpisodes?: string;
}

export interface PastMedicalHistory {
  condition: string;
  yearDiagnosed?: number;
  controlled: boolean;
  notes?: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration?: string;
  indication?: string;
}

export interface Allergy {
  agent: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe" | "anaphylaxis";
}

export interface FamilyHistoryItem {
  relation: string;
  condition: string;
  ageAtDiagnosis?: number;
  ageAtDeath?: number;
}

export interface SocialHistory {
  smoking: { status: "never" | "ex" | "current"; packYears?: number; quitDate?: string };
  alcohol: { units: number; pattern: string };
  recreationalDrugs?: string;
  diet?: string;
  exercise?: string;
  occupation: string;
  occupationalExposure?: string;
  livingArrangement?: string;
  travel?: string;
  pets?: string;
  sexualHistory?: string;
}

export interface SystemsReview {
  cardiovascular: string;
  respiratory: string;
  gastrointestinal: string;
  genitourinary: string;
  neurological: string;
  musculoskeletal: string;
  dermatological: string;
  endocrine: string;
  haematological: string;
  psychiatric: string;
}

export interface ObGynHistory {
  parity: string;
  gravida: string;
  lmp: string;
  cycleRegularity: string;
  contraception?: string;
  cervicalScreening?: string;
}

export interface VitalSigns {
  bp: string;
  hr: number;
  rr: number;
  temp: number;
  spo2: number;
  bgl?: number;
  gcs?: number;
}

export interface ExaminationFindings {
  general: string;
  vitalSigns: VitalSigns;
  cardiovascular: string;
  respiratory: string;
  abdominal: string;
  neurological: string;
  musculoskeletal: string;
  ent?: string;
  ophthalmic?: string;
  dermatological?: string;
  obstetric?: string;
  mentalState?: string;
}

export type InvestigationType =
  | "blood-test"
  | "urinalysis"
  | "imaging-xray"
  | "imaging-ct"
  | "imaging-mri"
  | "imaging-ultrasound"
  | "ecg"
  | "spirometry"
  | "endoscopy"
  | "biopsy"
  | "swab-microbiology"
  | "csf"
  | "stool-sample";

export interface LabValue {
  value: number | string;
  unit?: string;
  range?: string;
  flag?: "H" | "L" | "C";
}

export interface InvestigationResult {
  values: Record<string, LabValue>;
  text?: string;
}

export interface Investigation {
  id: string;
  type: InvestigationType;
  name: string;
  shortName?: string;
  triggerKeywords: string[];
  result: string | InvestigationResult;
  imageUrl?: string;
  interpretation: string;
  urgency: "routine" | "urgent" | "stat";
  requiresExplicitRequest: boolean;
}

export interface PatientPersona {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "Other";
  ethnicity?: string;
  occupation: string;
  maritalStatus?: string;
  presentingComplaint: string;
  reasonForAttendance: string;
  history: {
    hpi: HistoryOfPresentingIllness;
    pmh: PastMedicalHistory[];
    drugHistory: Medication[];
    allergies: Allergy[];
    familyHistory: FamilyHistoryItem[];
    socialHistory: SocialHistory;
    systemsReview: SystemsReview;
    obstetricGynaecological?: ObGynHistory;
  };
  examination: ExaminationFindings;
  investigations: Investigation[];
  emotionalState: string;
  communicationStyle: string;
  hiddenConcerns: string[];
  doNotVolunteer: string[];
  redHerrings?: string[];
}

export interface RubricItem {
  id: string;
  criterion: string;
  detailedExpectation: string;
  weight: number;
  required: boolean;
  detectionMethod: "keyword" | "ai-evaluation" | "investigation-requested" | "diagnosis-stated";
  keywordMatchers?: {
    primary: string[];
    contextual?: string[];
    exclusions?: string[];
  };
  investigationId?: string;
}

export interface OSCERubric {
  domains: {
    dataGathering: RubricItem[];
    clinicalManagement: RubricItem[];
    interpersonalSkills: RubricItem[];
  };
  totalMaxScore: number;
  passingScore: number;
}

export interface OSCEStation {
  id: string;
  exam: OSCEExamType;
  title: string;
  category: OSCECategory;
  specialty: string;
  difficulty: OSCEDifficulty;
  durationMinutes: number;
  readingTimeMinutes: number;
  candidateInstructions: string;
  examinerNotes: string;
  patient: PatientPersona;
  primaryDiagnosis: string;
  differentialDiagnoses: string[];
  rubric: OSCERubric;
  references: { source: string; url?: string; section?: string }[];
  ukmlaContentMapIds?: string[];
  learningObjectives: string[];
  tags: string[];
}

export interface DomainScore {
  earned: number;
  max: number;
  percentage: number;
}

export interface SessionScores {
  dataGathering: DomainScore;
  clinicalManagement: DomainScore;
  interpersonalSkills: DomainScore;
  total: number;
}

export interface RubricItemProgress {
  itemId: string;
  triggered: boolean;
  triggeredAt?: number;
  triggerMessageId?: string;
  quality: "excellent" | "good" | "adequate" | "poor" | null;
  pointsAwarded: number;
}

export interface SessionMessage {
  id: string;
  role: "user" | "patient" | "system" | "examiner" | "investigation";
  content: string;
  timestamp: number;
  metadata?: {
    investigationId?: string;
    rubricItemsTriggered?: string[];
  };
}

export interface OSCESession {
  sessionId: string;
  stationId: string;
  startedAt: number;
  status: "reading" | "active" | "completed" | "abandoned" | "timed-out";
  messages: SessionMessage[];
  rubricProgress: Record<string, RubricItemProgress>;
  releasedInvestigations: string[];
  studentDiagnosis?: string;
  scores: SessionScores;
  finalFeedback?: string;
  completedAt?: number;
}
