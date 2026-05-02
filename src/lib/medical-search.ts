const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const FETCH_TIMEOUT_MS = 8_000;
const MAX_RESULTS = 3;
const ABSTRACT_CHAR_CAP = 4_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

interface ESearchResponse {
  esearchresult?: { idlist?: string[] };
}

interface ESummaryArticle {
  title?: string;
  source?: string;
  pubdate?: string;
  authors?: { name: string }[];
}

interface ESummaryResponse {
  result?: Record<string, ESummaryArticle>;
}

export async function searchPubMed(query: string): Promise<string> {
  if (!query || !query.trim()) return 'No query provided.';

  try {
    const searchUrl =
      `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}` +
      `&retmax=${MAX_RESULTS}&retmode=json&sort=relevance`;

    const searchRes = await withTimeout(fetch(searchUrl), FETCH_TIMEOUT_MS, 'PubMed esearch');
    if (!searchRes.ok) return `PubMed search failed: HTTP ${searchRes.status}`;

    const searchData = (await searchRes.json()) as ESearchResponse;
    const ids = searchData?.esearchresult?.idlist ?? [];
    if (ids.length === 0) return 'No PubMed results found for this query.';

    const summaryUrl =
      `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const sumRes = await withTimeout(fetch(summaryUrl), FETCH_TIMEOUT_MS, 'PubMed esummary');
    const sumData = sumRes.ok ? ((await sumRes.json()) as ESummaryResponse) : null;
    const articles = sumData?.result ?? {};

    const fetchUrl =
      `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&rettype=abstract&retmode=text`;
    const fetchRes = await withTimeout(fetch(fetchUrl), FETCH_TIMEOUT_MS, 'PubMed efetch');
    const rawAbstracts = fetchRes.ok ? (await fetchRes.text()).trim() : '';

    const blocks = ids.map((id) => {
      const a = articles[id];
      const authors = a?.authors?.slice(0, 3).map((x) => x.name).join(', ') ?? '';
      return [
        `Title: ${a?.title ?? '(no title)'}`,
        `Source: ${a?.source ?? ''}`,
        `Date: ${a?.pubdate ?? ''}`,
        authors ? `Authors: ${authors}` : null,
        `PMID: ${id}`,
        `URL: https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      ]
        .filter(Boolean)
        .join('\n');
    });

    const summaryBlock = blocks.join('\n\n');
    const abstractBlock = rawAbstracts
      ? `\n\n--- ABSTRACTS ---\n${rawAbstracts.slice(0, ABSTRACT_CHAR_CAP)}`
      : '';

    return `PUBMED RESULTS FOR "${query}":\n\n${summaryBlock}${abstractBlock}`;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[medical-search] PubMed error:', msg);
    return `Unable to fetch data from PubMed (${msg}).`;
  }
}
