/* eslint-disable @typescript-eslint/no-explicit-any */
import { MedicalSource } from '../types';
import { ExternalAPIError } from '@/lib/utils/errors';

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';
const TIMEOUT_MS = 10000;

export async function searchDrug(drugName: string): Promise<MedicalSource[]> {
  try {
    const rxcui = await findRxcui(drugName);
    if (!rxcui) return [];

    const [props, interactions] = await Promise.all([
      fetchProperties(rxcui),
      fetchInteractions(rxcui),
    ]);

    const description = buildDrugDescription(drugName, props, interactions);

    return [{
      id: rxcui,
      source: 'rxnorm',
      category: 'drug',
      title: `${drugName} — معلومات دوائية (RxNorm)`,
      abstract: description,
      authors: ['NLM RxNorm Database'],
      year: new Date().getFullYear(),
      journal: 'RxNorm',
      doi: null,
      url: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`,
      isOpenAccess: true,
      studyType: 'drug-label',
      language: 'en',
    }];
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    throw new ExternalAPIError('RxNorm search failed', 'rxnorm', error);
  }
}

async function findRxcui(drugName: string): Promise<string | null> {
  const url = new URL(`${RXNORM_BASE}/rxcui.json`);
  url.searchParams.set('name', drugName);

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.idGroup?.rxnormId?.[0] || null;
}

async function fetchProperties(rxcui: string): Promise<any[]> {
  const res = await fetch(
    `${RXNORM_BASE}/rxcui/${rxcui}/allProperties.json?prop=all`,
    {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.propConceptGroup?.propConcept || [];
}

async function fetchInteractions(rxcui: string): Promise<string> {
  const res = await fetch(
    `${RXNORM_BASE}/interaction/interaction.json?rxcui=${rxcui}`,
    {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) return '';
  const data = await res.json();
  return formatInteractions(data);
}

function buildDrugDescription(
  drugName: string,
  props: any[],
  interactions: string
): string {
  const propMap: Record<string, string> = {};
  for (const p of props) {
    propMap[p.propName] = p.propValue;
  }

  const sections: string[] = [`Drug: ${drugName}`];
  if (propMap.RxNorm_Name) sections.push(`Standardized Name: ${propMap.RxNorm_Name}`);
  if (propMap.TTY) sections.push(`Type: ${propMap.TTY}`);
  if (interactions) sections.push(`\nDrug Interactions:\n${interactions}`);

  return sections.join('\n');
}

function formatInteractions(data: any): string {
  const groups = data.interactionTypeGroup || [];
  const interactions: string[] = [];

  for (const group of groups) {
    for (const type of group.interactionType || []) {
      for (const pair of type.interactionPair || []) {
        if (pair.description) {
          interactions.push(`• [${pair.severity || 'unknown'}] ${pair.description}`);
        }
      }
    }
  }

  return interactions.slice(0, 10).join('\n');
}