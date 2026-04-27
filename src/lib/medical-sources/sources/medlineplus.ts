import { MedicalSource } from '../types';

interface MedLinePlusEntry {
  title?: string;
  FullSummary?: string;
  url?: string;
  language?: string;
  id?: string;
}

interface MedLinePlusResponse {
  feed?: {
    entry?: MedLinePlusEntry[];
  };
}

export async function searchMedlinePlus(
  query: string,
  options: { maxResults?: number; language?: 'English' | 'Spanish' } = {}
): Promise<MedicalSource[]> {
  const { maxResults = 3, language = 'English' } = options;

  const url = new URL('https://connect.medlineplus.gov/application');
  url.searchParams.set('mainSearchCriteria.v.cs', '2.16.840.1.113883.6.177');
  url.searchParams.set('mainSearchCriteria.v.dn', query);
  url.searchParams.set('knowledgeResponseType', 'application/json');
  url.searchParams.set('informationRecipient.languageCode.c', language === 'Spanish' ? 'es' : 'en');

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data: MedLinePlusResponse = await res.json();
  const entries = data.feed?.entry?.slice(0, maxResults) || [];

  return entries.map((entry): MedicalSource => {
    const id = entry.id || entry.url || `mlp-${Date.now()}`;
    const abstract = entry.FullSummary
      ? entry.FullSummary.replace(/<[^>]+>/g, '').substring(0, 1000)
      : null;

    return {
      id,
      source: 'medlineplus',
      category: 'educational',
      title: entry.title || 'MedlinePlus Article',
      abstract,
      authors: ['MedlinePlus (NLM/NIH)'],
      year: new Date().getFullYear(),
      journal: 'MedlinePlus',
      doi: null,
      url: entry.url || 'https://medlineplus.gov',
      isOpenAccess: true,
      studyType: 'educational',
      language: 'en',
    };
  });
}
