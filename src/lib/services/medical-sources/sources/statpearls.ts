/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource, FetchOptions } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_API_KEY = process.env.PUBMED_API_KEY;
const TIMEOUT_MS = 10000;

export async function searchStatPearls(
  query: string,
  options: FetchOptions = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3 } = options;

  try {
    const ids = await fetchBookIds(query, maxResults);
    if (ids.length === 0) return [];

    const summaries = await fetchBookSummaries(ids);

    return ids.map((id): MedicalSource => {
      const item = summaries[id] || {};
      return {
        id,
        source: 'statpearls',
        category: 'educational',
        title: item.title || 'No title',
        abstract: item.summary || null,
        authors: (item.authors || [])
          .map((a: { name?: string }) => a.name)
          .filter(Boolean)
          .slice(0, 3),
        year: parseInt(item.pubdate?.split(' ')[0]) || new Date().getFullYear(),
        journal: 'StatPearls (NCBI Bookshelf)',
        doi: null,
        url: `https://www.ncbi.nlm.nih.gov/books/NBK${id}/`,
        isOpenAccess: true,
        studyType: 'educational',
        language: 'en',
      };
    });
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('StatPearls search failed', 'statpearls', error);
  }
}

async function fetchBookIds(query: string, maxResults: number): Promise<string[]> {
  const url = new URL(`${NCBI_BASE}/esearch.fcgi`);
  url.searchParams.set('db', 'books');
  url.searchParams.set('term', `${query} AND statpearls[book]`);
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('retmax', String(maxResults));
  if (NCBI_API_KEY) url.searchParams.set('api_key', NCBI_API_KEY);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new ExternalAPIError(`StatPearls esearch failed: ${res.status}`, 'statpearls');
  }

  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

async function fetchBookSummaries(ids: string[]): Promise<Record<string, any>> {
  const url = new URL(`${NCBI_BASE}/esummary.fcgi`);
  url.searchParams.set('db', 'books');
  url.searchParams.set('id', ids.join(','));
  url.searchParams.set('retmode', 'json');
  if (NCBI_API_KEY) url.searchParams.set('api_key', NCBI_API_KEY);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return {};
  const data = await res.json();
  return data.result || {};
}