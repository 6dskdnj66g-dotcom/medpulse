import { MedicalSource, StudyType } from '../types';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY;

interface ESearchResult {
  esearchresult?: { idlist?: string[] };
}

interface ESummaryArticle {
  uid?: string;
  title?: string;
  authors?: Array<{ name: string }>;
  fulljournalname?: string;
  source?: string;
  pubdate?: string;
  doi?: string;
  pubtype?: string[];
  pmcrefcount?: string;
  epubdate?: string;
  sortpubdate?: string;
}

interface ESummaryResult {
  result?: Record<string, ESummaryArticle>;
}

export async function searchPubMed(
  query: string,
  options: { maxResults?: number; minYear?: number } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 5, minYear = 2018 } = options;

  const searchUrl = new URL(`${NCBI_BASE}/esearch.fcgi`);
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('term', `${query} AND ${minYear}:3000[pdat]`);
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('retmax', String(maxResults));
  searchUrl.searchParams.set('sort', 'relevance');
  if (API_KEY) searchUrl.searchParams.set('api_key', API_KEY);

  const searchRes = await fetch(searchUrl.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!searchRes.ok) throw new Error(`PubMed search failed: ${searchRes.status}`);

  const searchData: ESearchResult = await searchRes.json();
  const ids = searchData.esearchresult?.idlist || [];

  if (ids.length === 0) return [];

  const summaryUrl = new URL(`${NCBI_BASE}/esummary.fcgi`);
  summaryUrl.searchParams.set('db', 'pubmed');
  summaryUrl.searchParams.set('id', ids.join(','));
  summaryUrl.searchParams.set('retmode', 'json');
  if (API_KEY) summaryUrl.searchParams.set('api_key', API_KEY);

  const summaryRes = await fetch(summaryUrl.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!summaryRes.ok) throw new Error(`PubMed summary failed: ${summaryRes.status}`);

  const summaryData: ESummaryResult = await summaryRes.json();

  return ids.map((id): MedicalSource => {
    const item = summaryData.result?.[id] || {};
    const doi = item.doi || '';
    const year = extractYear(item.sortpubdate || item.epubdate || item.pubdate || '');

    return {
      id,
      source: 'pubmed',
      category: 'research',
      title: item.title || 'No title',
      abstract: null,
      authors: (item.authors || []).map((a) => a.name).slice(0, 5),
      year,
      journal: item.fulljournalname || item.source || null,
      doi: doi || null,
      url: doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      citationCount: parseInt(item.pmcrefcount || '0') || 0,
      isOpenAccess: false,
      studyType: classifyPubMedType(item.pubtype || []),
      language: 'en',
    };
  });
}

function extractYear(dateStr: string): number {
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

function classifyPubMedType(pubTypes: string[]): StudyType {
  const lower = pubTypes.map(t => t.toLowerCase());
  if (lower.some(t => t.includes('randomized'))) return 'rct';
  if (lower.some(t => t.includes('meta-analysis'))) return 'meta-analysis';
  if (lower.some(t => t.includes('systematic review'))) return 'systematic-review';
  if (lower.some(t => t.includes('practice guideline'))) return 'guideline';
  if (lower.some(t => t.includes('review'))) return 'review';
  if (lower.some(t => t.includes('cohort'))) return 'cohort';
  if (lower.some(t => t.includes('case reports'))) return 'case-report';
  return 'other';
}
