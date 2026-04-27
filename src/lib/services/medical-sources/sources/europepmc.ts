/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource, FetchOptions } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const EUROPEPMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
const TIMEOUT_MS = 10000;

export async function searchEuropePMC(
  query: string,
  options: FetchOptions & { openAccessOnly?: boolean } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3, minYear = 2020, openAccessOnly = false } = options;

  try {
    let queryString = `${query} AND PUB_YEAR:[${minYear} TO 3000]`;
    if (openAccessOnly) queryString += ' AND OPEN_ACCESS:Y';

    const url = new URL(EUROPEPMC_BASE);
    url.searchParams.set('query', queryString);
    url.searchParams.set('format', 'json');
    url.searchParams.set('pageSize', String(maxResults));
    url.searchParams.set('resultType', 'core');
    url.searchParams.set('sort', 'CITED desc');

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new ExternalAPIError(
        `Europe PMC failed: ${res.status}`,
        'europepmc'
      );
    }

    const data = await res.json();
    const results = data.resultList?.result || [];

    return results.map((item: any): MedicalSource => ({
      id: item.id || item.pmid || '',
      source: 'europepmc',
      category: 'research',
      title: item.title || 'No title',
      abstract: item.abstractText || null,
      authors: parseAuthors(item.authorString),
      year: parseInt(item.pubYear) || 0,
      journal: item.journalTitle || null,
      doi: item.doi || null,
      url: item.doi
        ? `https://doi.org/${item.doi}`
        : item.pmid
          ? `https://europepmc.org/article/MED/${item.pmid}`
          : '',
      citationCount: parseInt(item.citedByCount) || 0,
      isOpenAccess: item.isOpenAccess === 'Y',
      studyType: classifyEuropePMCType(item.pubTypeList),
      language: 'en',
    }));
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('Europe PMC search failed', 'europepmc', error);
  }
}

function parseAuthors(authorString: string | undefined): string[] {
  if (!authorString) return [];
  return authorString.split(',').map((a) => a.trim()).filter(Boolean).slice(0, 5);
}

function classifyEuropePMCType(pubTypeList: any): MedicalSource['studyType'] {
  if (!pubTypeList?.pubType) return 'other';
  const types = Array.isArray(pubTypeList.pubType)
    ? pubTypeList.pubType.map((t: string) => t.toLowerCase())
    : [String(pubTypeList.pubType).toLowerCase()];

  if (types.some((t: string) => t.includes('randomized'))) return 'rct';
  if (types.some((t: string) => t.includes('meta-analysis'))) return 'meta-analysis';
  if (types.some((t: string) => t.includes('systematic review'))) return 'systematic-review';
  if (types.some((t: string) => t.includes('practice guideline'))) return 'guideline';
  if (types.some((t: string) => t.includes('review'))) return 'review';
  return 'other';
}