"use server";

import { classifyQuery, aggregateSourcesSmart, synthesizeMultiSource } from "@/lib/medical-sources";
import { MedPulseAgent, RESEARCH_AGENTS } from "@/lib/ai/agent-registry";
import { ValidatedResponse, EvidenceLevel, MedicalSource as UISource } from "@/types/medical";

interface RawSource {
  id: string;
  title: string;
  authors?: string[];
  journal?: string;
  source?: string;
  year?: number | string;
  doi?: string;
  url: string;
  abstract?: string;
  studyType?: string;
}

interface SynthesizedResult {
  answer: string;
  sources: RawSource[];
}

function mapStudyTypeToEvidenceLevel(studyType: string): EvidenceLevel {
  switch (studyType) {
    case 'meta-analysis':
    case 'systematic-review':
    case 'guideline':
      return '1a';
    case 'rct':
      return '1b';
    case 'cohort':
      return '2b';
    case 'case-control':
      return '3';
    case 'case-report':
    case 'review':
      return '4';
    default:
      return 'GPP';
  }
}

export async function processClinicalQuery(
  userQuery: string,
  agentType: MedPulseAgent = "PROFESSOR"
): Promise<ValidatedResponse> {
  if (!userQuery.trim()) throw new Error("Query cannot be empty.");

  if (!RESEARCH_AGENTS.has(agentType)) {
    throw new Error("Invalid routing: Evidence fetcher invoked for non-research agent.");
  }

  const classification = await classifyQuery(userQuery);

  const timeoutGuard = new Promise<RawSource[]>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 4000)
  );

  let rawSources: RawSource[];
  try {
    rawSources = (await Promise.race([
      aggregateSourcesSmart(classification),
      timeoutGuard
    ])) as RawSource[];
  } catch {
    rawSources = [];
  }

  // Slice aggregated sources array to a strict MAXIMUM OF 5 TOP-SCORED SOURCES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const limitedSources = (rawSources as unknown as any[]).slice(0, 5);

  const synthesized = await synthesizeMultiSource(userQuery, limitedSources) as SynthesizedResult;

  const mappedSources: UISource[] = synthesized.sources.map((src: RawSource) => ({
    id: src.id,
    title: src.title,
    authors: src.authors ? src.authors.join(", ") : "Unknown",
    journal: src.journal || src.source || 'Unknown Journal',
    publicationYear: src.year ? src.year.toString() : "N/A",
    doi: src.doi || '',
    url: src.url,
    summary: src.abstract || 'No abstract available',
    evidenceLevel: mapStudyTypeToEvidenceLevel(src.studyType || '')
  }));

  return {
    content: synthesized.answer,
    sources: mappedSources,
  };
}
