import { MedicalSource } from '../types';

interface CTProtocol {
  identificationModule?: { nctId?: string; briefTitle?: string };
  descriptionModule?: { briefSummary?: string; detailedDescription?: string };
  statusModule?: { startDateStruct?: { date?: string } };
  contactsLocationsModule?: { overallOfficials?: Array<{ name?: string }> };
}

interface CTStudy {
  protocolSection?: CTProtocol;
}

export async function searchClinicalTrials(
  query: string,
  options: { maxResults?: number; status?: string[] } = {}
): Promise<MedicalSource[]> {
  const {
    maxResults = 5,
    status = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'COMPLETED'],
  } = options;

  const url = new URL('https://clinicaltrials.gov/api/v2/studies');
  url.searchParams.set('query.term', query);
  url.searchParams.set('filter.overallStatus', status.join('|'));
  url.searchParams.set('pageSize', String(maxResults));
  url.searchParams.set('format', 'json');
  url.searchParams.set('sort', 'LastUpdatePostDate:desc');

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`ClinicalTrials failed: ${res.status}`);

  const data = await res.json();
  const studies: CTStudy[] = data.studies || [];

  return studies.map((study): MedicalSource => {
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
}

function extractInvestigators(protocol: CTProtocol): string[] {
  const officials = protocol.contactsLocationsModule?.overallOfficials || [];
  return officials
    .map((o) => o.name || '')
    .filter(Boolean)
    .slice(0, 3);
}

function extractStartYear(protocol: CTProtocol): number {
  const startDate = protocol.statusModule?.startDateStruct?.date;
  if (!startDate) return 0;
  return parseInt(startDate.split('-')[0]) || 0;
}
