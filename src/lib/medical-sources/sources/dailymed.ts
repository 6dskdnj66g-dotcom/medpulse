import { MedicalSource } from '../types';

const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

interface DailyMedSPL {
  setid?: string;
  title?: string;
  published?: string;
}

interface DailyMedSearchResponse {
  data?: DailyMedSPL[];
}

export async function searchDailyMed(drugName: string): Promise<MedicalSource[]> {
  const url = new URL(`${DAILYMED_BASE}/spls.json`);
  url.searchParams.set('drug_name', drugName);
  url.searchParams.set('pagesize', '2');

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data: DailyMedSearchResponse = await res.json();
  const spls = data.data || [];

  if (spls.length === 0) return [];

  return spls.map((spl): MedicalSource => {
    const setId = spl.setid || '';
    const year = spl.published
      ? parseInt(spl.published.substring(0, 4)) || new Date().getFullYear()
      : new Date().getFullYear();

    return {
      id: setId,
      source: 'dailymed',
      category: 'drug',
      title: spl.title || `${drugName} — DailyMed Label`,
      abstract: `بطاقة الدواء الرسمية من DailyMed (NLM) للدواء: ${drugName}. تتضمن دواعي الاستعمال، الجرعات، موانع الاستعمال، والتحذيرات.`,
      authors: ['NLM DailyMed'],
      year,
      journal: 'DailyMed (NLM)',
      doi: null,
      url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`,
      isOpenAccess: true,
      studyType: 'drug-label',
      language: 'en',
    };
  });
}
