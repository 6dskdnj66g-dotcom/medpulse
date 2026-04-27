import { MedicalSource } from '../types';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const NCBI_API_KEY = process.env.PUBMED_API_KEY;

interface BookSummaryItem {
  title?: string;
  summary?: string;
  authors?: Array<{ name: string }>;
  pubdate?: string;
  bookname?: string;
}

interface ESearchResult {
  esearchresult?: { idlist?: string[] };
}

interface ESummaryResult {
  result?: Record<string, BookSummaryItem>;
}

export async function searchStatPearls(
  query: string,
  options: { maxResults?: number } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3 } = options;

  const searchUrl = new URL(`${NCBI_BASE}/esearch.fcgi`);
  searchUrl.searchParams.set('db', 'books');
  searchUrl.searchParams.set('term', `${query} AND statpearls[book]`);
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('retmax', String(maxResults));
  if (NCBI_API_KEY) searchUrl.searchParams.set('api_key', NCBI_API_KEY);

  const searchRes = await fetch(searchUrl.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!searchRes.ok) throw new Error(`StatPearls search failed: ${searchRes.status}`);

  const searchData: ESearchResult = await searchRes.json();
  const ids: string[] = searchData.esearchresult?.idlist || [];

  if (ids.length === 0) return [];

  const summaryUrl = new URL(`${NCBI_BASE}/esummary.fcgi`);
  summaryUrl.searchParams.set('db', 'books');
  summaryUrl.searchParams.set('id', ids.join(','));
  summaryUrl.searchParams.set('retmode', 'json');
  if (NCBI_API_KEY) summaryUrl.searchParams.set('api_key', NCBI_API_KEY);

  const summaryRes = await fetch(summaryUrl.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  const summaryData: ESummaryResult = await summaryRes.json();

  return ids.map((id): MedicalSource => {
    const item = summaryData.result?.[id] || {};
    return {
      id,
      source: 'statpearls',
      category: 'educational',
      title: item.title || 'No title',
      abstract: item.summary || null,
      authors: (item.authors || []).map((a) => a.name).slice(0, 3),
      year: parseInt(item.pubdate?.split(' ')[0] || '0') || new Date().getFullYear(),
      journal: 'StatPearls (NCBI Bookshelf)',
      doi: null,
      url: `https://www.ncbi.nlm.nih.gov/books/${item.bookname || 'NBK430685'}/`,
      isOpenAccess: true,
      studyType: 'educational',
      language: 'en',
    };
  });
}
