/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource, FetchOptions } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const OPENALEX_BASE = 'https://api.openalex.org/works';
const OPENALEX_EMAIL = process.env.OPENALEX_EMAIL || 'dev@medpulse.ai';
const TIMEOUT_MS = 10000;

export async function searchOpenAlex(
  query: string,
  options: FetchOptions = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3, minYear = 2020 } = options;

  try {
    const url = new URL(OPENALEX_BASE);
    url.searchParams.set('search', query);
    url.searchParams.set(
      'filter',
      [`publication_year:${minYear}-`, 'type:article', 'has_abstract:true'].join(',')
    );
    url.searchParams.set('per-page', String(maxResults));
    url.searchParams.set('sort', 'cited_by_count:desc');
    url.searchParams.set('mailto', OPENALEX_EMAIL);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new ExternalAPIError(
        `OpenAlex search failed: ${res.status}`,
        'openalex'
      );
    }

    const data = await res.json();
    const works: any[] = data.results || [];

    return works.map((work): MedicalSource => ({
      id: work.id?.replace('https://openalex.org/', '') || '',
      source: 'openalex',
      category: 'research',
      title: work.title || work.display_name || 'No title',
      abstract: reconstructAbstract(work.abstract_inverted_index),
      authors: (work.authorships || [])
        .slice(0, 5)
        .map((a: any) => a.author?.display_name)
        .filter(Boolean),
      year: work.publication_year || 0,
      journal: work.primary_location?.source?.display_name || null,
      doi: work.doi?.replace('https://doi.org/', '') || null,
      url: work.doi || work.id || '',
      citationCount: work.cited_by_count || 0,
      isOpenAccess: work.open_access?.is_oa || false,
      studyType: 'other',
      language: 'en',
    }));
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('OpenAlex search failed', 'openalex', error);
  }
}

function reconstructAbstract(
  invertedIndex: Record<string, number[]> | null
): string | null {
  if (!invertedIndex) return null;

  const wordsByPosition: Record<number, string> = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordsByPosition[pos] = word;
    }
  }

  const sortedPositions = Object.keys(wordsByPosition)
    .map(Number)
    .sort((a, b) => a - b);

  const text = sortedPositions.map((pos) => wordsByPosition[pos]).join(' ');
  return text.length > 50 ? text : null;
}