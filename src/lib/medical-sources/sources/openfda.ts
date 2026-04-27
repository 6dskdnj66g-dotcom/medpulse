import { MedicalSource } from '../types';

interface FDALabelItem {
  id?: string;
  set_id?: string;
  effective_time?: string;
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  contraindications?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
}

interface FDAEventResult {
  term?: string;
  count?: number;
}

export async function searchFDADrugLabel(drugName: string): Promise<MedicalSource[]> {
  const url = new URL('https://api.fda.gov/drug/label.json');
  url.searchParams.set('search', `openfda.generic_name:"${drugName}" OR openfda.brand_name:"${drugName}"`);
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const results: FDALabelItem[] = data.results || [];

  return results.map((item): MedicalSource => {
    const sections: string[] = [];
    if (item.indications_and_usage?.[0])
      sections.push(`الاستخدامات:\n${item.indications_and_usage[0]}`);
    if (item.dosage_and_administration?.[0])
      sections.push(`الجرعة:\n${item.dosage_and_administration[0]}`);
    if (item.contraindications?.[0])
      sections.push(`موانع الاستعمال:\n${item.contraindications[0]}`);
    if (item.warnings?.[0])
      sections.push(`التحذيرات:\n${item.warnings[0]}`);
    if (item.adverse_reactions?.[0])
      sections.push(`الأعراض الجانبية:\n${item.adverse_reactions[0]}`);

    return {
      id: item.id || item.set_id || '',
      source: 'openfda',
      category: 'drug',
      title: `${drugName} — FDA Label`,
      abstract: sections.join('\n\n').substring(0, 5000),
      authors: ['FDA'],
      year: parseInt(item.effective_time?.substring(0, 4) || '0') || new Date().getFullYear(),
      journal: 'FDA Drug Label',
      doi: null,
      url: `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${item.set_id}`,
      isOpenAccess: true,
      studyType: 'drug-label',
      language: 'en',
    };
  });
}

export async function searchFDAAdverseEvents(drugName: string): Promise<MedicalSource[]> {
  const url = new URL('https://api.fda.gov/drug/event.json');
  url.searchParams.set(
    'search',
    `patient.drug.medicinalproduct:"${drugName}"`
  );
  url.searchParams.set('count', 'patient.reaction.reactionmeddrapt.exact');
  url.searchParams.set('limit', '15');

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const reactions: FDAEventResult[] = data.results || [];

  if (reactions.length === 0) return [];

  const description =
    `أكثر الأعراض الجانبية المبلّغ عنها لـ ${drugName} (من قاعدة بيانات FDA Adverse Event Reporting):\n\n` +
    reactions
      .slice(0, 15)
      .map((r, i) => `${i + 1}. ${r.term} — ${r.count} حالة مُبلّغة`)
      .join('\n');

  return [
    {
      id: `fda-aers-${drugName}`,
      source: 'openfda',
      category: 'drug',
      title: `${drugName} — Adverse Events Report`,
      abstract: description,
      authors: ['FDA Adverse Event Reporting System'],
      year: new Date().getFullYear(),
      journal: 'FDA FAERS',
      doi: null,
      url: 'https://www.fda.gov/drugs/questions-and-answers-fdas-adverse-event-reporting-system-faers/fda-adverse-event-reporting-system-faers-public-dashboard',
      isOpenAccess: true,
      studyType: 'drug-label',
      language: 'en',
    },
  ];
}
