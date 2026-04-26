export type EvidenceLevel = '1a' | '1b' | '2a' | '2b' | '3' | '4' | 'GPP';

export interface MedicalSource {
  id: string;
  title: string;
  authors: string;
  journal: string;
  publicationYear: string;
  doi: string;
  url: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
}

export interface ValidatedResponse {
  content: string;
  sources: MedicalSource[];
}
