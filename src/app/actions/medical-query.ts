/* eslint-disable @typescript-eslint/no-explicit-any */
﻿"use server";

import { classifyQuery, aggregateSourcesSmart, synthesizeMultiSource } from "@/lib/medical-sources";
import { MedPulseAgent, RESEARCH_AGENTS } from "@/lib/ai/agent-registry";
import { ValidatedResponse, EvidenceLevel, MedicalSource as UISource } from "@/types/medical";

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

  const timeoutGuard = new Promise<any[]>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 4000)
  );

  let rawSources: any[];
  try {
    rawSources = (await Promise.race([
      aggregateSourcesSmart(classification),
      timeoutGuard
    ])) as any[];
  } catch (error) {
    rawSources = [];
  }

  // Slice aggregated sources array to a strict MAXIMUM OF 5 TOP-SCORED SOURCES
  const limitedSources = rawSources.slice(0, 5);

  const synthesized = await synthesizeMultiSource(userQuery, limitedSources);

  const mappedSources: UISource[] = synthesized.sources.map((src: any) => ({
    id: src.id,
    title: src.title,
    authors: src.authors ? src.authors.join(", ") : "Unknown",
    journal: src.journal || src.source,
    publicationYear: src.year ? src.year.toString() : "N/A",
    doi: src.doi || '',
    url: src.url,
    summary: src.abstract || 'No abstract available',
    evidenceLevel: mapStudyTypeToEvidenceLevel(src.studyType)
  }));

  return {
    content: synthesized.answer,
    sources: mappedSources,
  };
}
