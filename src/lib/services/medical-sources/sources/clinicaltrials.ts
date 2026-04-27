/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource, FetchOptions } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const CT_BASE = 'https://clinicaltrials.gov/api/v2/studies';
const TIMEOUT_MS = 10000;

export async function searchClinicalTrials(
  query: string,
  options: FetchOptions & { status?: string[] } = {}
): Promise<MedicalSource[]> {
  const {
    maxResults = 3,
    status = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'COMPLETED'],
  } = options;

  try {
    const url = new URL(CT_BASE);
    url.searchParams.set('query.term', query);
    url.searchParams.set('filter.overallStatus', status.join('|'));
    url.searchParams.set('pageSize', String(maxResults));
    url.searchParams.set('format', 'json');
    url.searchParams.set('sort', 'LastUpdatePostDate:desc');

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new ExternalAPIError(
        `ClinicalTrials failed: ${res.status}`,
        'clinicaltrials'
      );
    }

    const data = await res.json();
    const studies = data.studies || [];

    return studies.map((study: any): MedicalSource => {
      const protocol = study.protocolSection || {};
      const id = protocol.identificationModule?.nctId || '';

      return {
        id,
        source: 'clinicaltrials',
        category: 'clinical_trial',
        title: protocol.identificationModule?.briefTitle || 'No title',
        abstract:
          protocol.descriptionModule?.briefSummary ||
          protocol.descriptionModule?.detailedDescription ||
          null,
        authors: extractInvestigators(protocol),
        year: extractStartYear(protocol),
        journal: 'ClinicalTrials.gov',
        doi: null,
        url: `https://clinicaltrials.gov/study/${id}`,
        isOpenAccess: true,
        studyType: 'rct',
        language: 'en',
      };
    });
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('ClinicalTrials search failed', 'clinicaltrials', error);
  }
}

function extractInvestigators(protocol: any): string[] {
  const officials = protocol.contactsLocationsModule?.overallOfficials || [];
  return officials
    .map((o: { name?: string }) => o.name)
    .filter(Boolean)
    .slice(0, 3);
}

function extractStartYear(protocol: any): number {
  const startDate = protocol.statusModule?.startDateStruct?.date;
  if (!startDate) return 0;
  return parseInt(startDate.split('-')[0]) || 0;
}