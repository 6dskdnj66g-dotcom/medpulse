import { MedicalSource, StudyType } from '../types';

const OPENALEX_BASE = 'https://api.openalex.org';

interface OpenAlexWork {
  id?: string;
  title?: string;
  authorships?: Array<{ author?: { display_name?: string } }>;
  publication_year?: number;
  primary_location?: {
    source?: { display_name?: string };
    is_oa?: boolean;
  };
  doi?: string;
  cited_by_count?: number;
  type?: string;
  type_crossref?: string;
  open_access?: { is_oa?: boolean };
  abstract_inverted_index?: Record<string, number[]>;
}

interface OpenAlexResponse {
  results?: OpenAlexWork[];
}

export async function searchOpenAlex(
  query: string,
  options: { maxResults?: number; minYear?: number } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3, minYear = 2018 } = options;

  const url = new URL(`${OPENALEX_BASE}/works`);
  url.searchParams.set('search', query);
  url.searchParams.set('filter', `from_publication_date:${minYear}-01-01,type:article`);
  url.searchParams.set('per-page', String(maxResults));
  url.searchParams.set('sort', 'cited_by_count:desc');
  url.searchParams.set('select', 'id,title,authorships,publication_year,primary_location,doi,cited_by_count,type,open_access,abstract_inverted_index');
  url.searchParams.set('mailto', 'research@medpulse.ai');

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`OpenAlex failed: ${res.status}`);

  const data: OpenAlexResponse = await res.json();
  const works = data.results || [];

  return works.map((work): MedicalSource => {
    const doi = work.doi?.replace('https://doi.org/', '') || null;
    const isOA = work.open_access?.is_oa || work.primary_location?.is_oa || false;
    const abstract = reconstructAbstract(work.abstract_inverted_index);

    return {
      id: work.id?.replace('https://openalex.org/', '') || '',
      source: 'openalex',
      category: 'research',
      title: work.title || 'No title',
      abstract: abstract || null,
      authors: (work.authorships || [])
        .map(a => a.author?.display_name || '')
        .filter(Boolean)
        .slice(0, 5),
      year: work.publication_year || 0,
      journal: work.primary_location?.source?.display_name || null,
      doi,
      url: doi ? `https://doi.org/${doi}` : (work.id || ''),
      citationCount: work.cited_by_count || 0,
      isOpenAccess: isOA,
      studyType: classifyOpenAlexType(work.type || work.type_crossref || ''),
      language: 'en',
    };
  });
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string | null {
  if (!invertedIndex) return null;
  const wordPositions: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push([pos, word]);
    }
  }
  wordPositions.sort((a, b) => a[0] - b[0]);
  return wordPositions.map(([, word]) => word).join(' ');
}

function classifyOpenAlexType(type: string): StudyType {
  const t = type.toLowerCase();
  if (t.includes('review')) return 'review';
  if (t.includes('article')) return 'other';
  return 'other';
}
