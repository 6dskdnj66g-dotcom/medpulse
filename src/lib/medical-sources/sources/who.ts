import { MedicalSource } from '../types';

interface IRISItem {
  uuid?: string;
  name?: string;
  metadata?: Array<{ key: string; value: string[] }>;
  handle?: string;
}

interface IRISResponse {
  _embedded?: { searchResult?: { _embedded?: { objects?: IRISItem[] } } };
}

export async function searchWHO(
  query: string,
  options: { maxResults?: number } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3 } = options;

  // WHO IRIS (Institutional Repository for Information Sharing)
  const url = new URL('https://iris.who.int/rest/search');
  url.searchParams.set('query', query);
  url.searchParams.set('scope', '/');
  url.searchParams.set('rpp', String(maxResults));
  url.searchParams.set('sort_by', 'score');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('f', 'dc.type,Guidelines,equals');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return getFallbackWHO(query);

  const data: IRISResponse = await res.json();
  const items = data._embedded?.searchResult?._embedded?.objects || [];

  if (items.length === 0) return getFallbackWHO(query);

  return items.map((item): MedicalSource => {
    const handle = item.handle || '';
    const meta = extractMeta(item.metadata || []);
    const year = parseInt(meta.date?.substring(0, 4) || '0') || new Date().getFullYear();

    return {
      id: item.uuid || handle,
      source: 'who',
      category: 'guideline',
      title: meta.title || item.name || 'WHO Publication',
      abstract: meta.description || null,
      authors: meta.creator ? [meta.creator] : ['World Health Organization'],
      year,
      journal: 'WHO Publications',
      doi: meta.doi || null,
      url: handle ? `https://iris.who.int/handle/${handle}` : 'https://www.who.int/publications',
      isOpenAccess: true,
      studyType: 'guideline',
      language: 'en',
    };
  });
}

function extractMeta(metadata: Array<{ key: string; value: string[] }>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const m of metadata) {
    const key = m.key.split('.').pop() || m.key;
    if (m.value?.[0]) result[key] = m.value[0];
  }
  return result;
}

function getFallbackWHO(query: string): MedicalSource[] {
  return [
    {
      id: `who-${query.replace(/\s+/g, '-').toLowerCase()}`,
      source: 'who',
      category: 'guideline',
      title: `WHO Guidelines — ${query}`,
      abstract: `للاطلاع على إرشادات منظمة الصحة العالمية المتعلقة بـ "${query}"، يُرجى زيارة مكتبة منظمة الصحة العالمية IRIS أو صفحة المنشورات الرسمية.`,
      authors: ['World Health Organization'],
      year: new Date().getFullYear(),
      journal: 'WHO Publications',
      doi: null,
      url: `https://iris.who.int/search?query=${encodeURIComponent(query)}`,
      isOpenAccess: true,
      studyType: 'guideline',
      language: 'en',
    },
  ];
}
