/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const FDA_BASE = 'https://api.fda.gov';
const TIMEOUT_MS = 10000;

export async function searchFDADrugLabel(
  drugName: string
): Promise<MedicalSource[]> {
  try {
    const url = new URL(`${FDA_BASE}/drug/label.json`);
    url.searchParams.set(
      'search',
      `openfda.generic_name:"${drugName}" OR openfda.brand_name:"${drugName}"`
    );
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data.results || [];

    return results.map((item: any): MedicalSource => {
      const sections: string[] = [];
      if (item.indications_and_usage?.[0])
        sections.push(`Indications:\n${item.indications_and_usage[0]}`);
      if (item.dosage_and_administration?.[0])
        sections.push(`Dosage:\n${item.dosage_and_administration[0]}`);
      if (item.contraindications?.[0])
        sections.push(`Contraindications:\n${item.contraindications[0]}`);
      if (item.warnings?.[0])
        sections.push(`Warnings:\n${item.warnings[0]}`);
      if (item.adverse_reactions?.[0])
        sections.push(`Adverse Reactions:\n${item.adverse_reactions[0]}`);

      return {
        id: item.id || item.set_id || '',
        source: 'openfda',
        category: 'drug',
        title: `${drugName} — FDA Drug Label`,
        abstract: sections.join('\n\n').substring(0, 5000),
        authors: ['U.S. Food and Drug Administration'],
        year:
          parseInt(item.effective_time?.substring(0, 4)) ||
          new Date().getFullYear(),
        journal: 'FDA Drug Label',
        doi: null,
        url: `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${item.set_id}`,
        isOpenAccess: true,
        studyType: 'drug-label',
        language: 'en',
      };
    });
  } catch (error) {
    throw new ExternalAPIError('OpenFDA search failed', 'openfda', error);
  }
}