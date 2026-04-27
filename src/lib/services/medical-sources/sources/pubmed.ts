/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource, FetchOptions } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const PUBMED_API_KEY = process.env.PUBMED_API_KEY;
const TIMEOUT_MS = 10000;

export async function searchPubMed(
  query: string,
  options: FetchOptions = {}
): Promise<MedicalSource[]> {
  const { maxResults = 5, minYear = 2020, studyTypes = [] } = options;

  try {
    const pmids = await fetchPmids(query, maxResults, minYear, studyTypes);
    if (pmids.length === 0) return [];

    const [summaries, abstracts] = await Promise.all([
      fetchSummaries(pmids),
      fetchAbstracts(pmids),
    ]);

    return pmids.map((pmid): MedicalSource => {
      const summary = summaries[pmid] || {};
      const pubTypes: string[] = summary.pubtype || [];

      return {
        id: pmid,
        source: 'pubmed',
        category: 'research',
        title: summary.title || 'No title',
        abstract: abstracts[pmid] || null,
        authors: (summary.authors || [])
          .map((a: { name?: string }) => a.name)
          .filter((n: string | undefined): n is string => Boolean(n))
          .slice(0, 5),
        year: parseInt(summary.pubdate?.split(' ')[0]) || 0,
        journal: summary.fulljournalname || summary.source || null,
        doi: extractDoi(summary.elocationid),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        isOpenAccess: pubTypes.some((t: string) =>
          t.toLowerCase().includes('open')
        ),
        studyType: classifyStudyType(pubTypes),
        language: 'en',
      };
    });
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('PubMed search failed', 'pubmed', error);
  }
}

async function fetchPmids(
  query: string,
  maxResults: number,
  minYear: number,
  studyTypes: string[]
): Promise<string[]> {
  let searchTerm = `${query}[Title/Abstract]`;
  if (minYear) searchTerm += ` AND ${minYear}:3000[pdat]`;
  if (studyTypes.length > 0) {
    const typeFilters = studyTypes.map((t) => `${t}[Publication Type]`).join(' OR ');
    searchTerm += ` AND (${typeFilters})`;
  }

  const url = new URL(`${PUBMED_BASE}/esearch.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('term', searchTerm);
  url.searchParams.set('retmode', 'json');
  url.searchParams.set('retmax', String(maxResults));
  url.searchParams.set('sort', 'relevance');
  if (PUBMED_API_KEY) url.searchParams.set('api_key', PUBMED_API_KEY);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new ExternalAPIError(`PubMed esearch failed: ${res.status}`, 'pubmed');
  }

  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

async function fetchSummaries(pmids: string[]): Promise<Record<string, any>> {
  const url = new URL(`${PUBMED_BASE}/esummary.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('id', pmids.join(','));
  url.searchParams.set('retmode', 'json');
  if (PUBMED_API_KEY) url.searchParams.set('api_key', PUBMED_API_KEY);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return {};
  const data = await res.json();
  return data.result || {};
}

async function fetchAbstracts(pmids: string[]): Promise<Record<string, string>> {
  const url = new URL(`${PUBMED_BASE}/efetch.fcgi`);
  url.searchParams.set('db', 'pubmed');
  url.searchParams.set('id', pmids.join(','));
  url.searchParams.set('rettype', 'abstract');
  url.searchParams.set('retmode', 'xml');
  if (PUBMED_API_KEY) url.searchParams.set('api_key', PUBMED_API_KEY);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return {};
  const xmlText = await res.text();
  return parseAbstractsFromXML(xmlText);
}

function parseAbstractsFromXML(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const articleMatches = xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g);

  for (const match of articleMatches) {
    const article = match[1];
    const pmidMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];

    const abstractMatches = article.matchAll(
      /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g
    );
    const parts: string[] = [];
    for (const m of abstractMatches) {
      const text = m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      if (text) parts.push(text);
    }

    if (parts.length > 0) result[pmid] = parts.join('\n\n');
  }

  return result;
}

function extractDoi(elocationid: string | undefined): string | null {
  if (!elocationid) return null;
  const match = elocationid.match(/10\.\d{4,}\/[\w.()/:-]+/);
  return match ? match[0] : null;
}

function classifyStudyType(pubTypes: string[]): MedicalSource['studyType'] {
  const types = pubTypes.map((t) => t.toLowerCase());
  if (types.some((t) => t.includes('randomized controlled trial'))) return 'rct';
  if (types.some((t) => t.includes('meta-analysis'))) return 'meta-analysis';
  if (types.some((t) => t.includes('systematic review'))) return 'systematic-review';
  if (types.some((t) => t.includes('practice guideline'))) return 'guideline';
  if (types.some((t) => t.includes('review'))) return 'review';
  if (types.some((t) => t.includes('case reports'))) return 'case-report';
  return 'other';
}