import { MedicalSource } from '../types';

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

interface RxNormIdGroup {
  idGroup?: { rxnormId?: string[] };
}

interface PropConcept {
  propName?: string;
  propValue?: string;
}

interface RxNormProperties {
  propConceptGroup?: { propConcept?: PropConcept[] };
}

interface InteractionPair {
  description?: string;
  severity?: string;
}

interface InteractionType {
  interactionPair?: InteractionPair[];
}

interface InteractionTypeGroup {
  interactionType?: InteractionType[];
}

interface RxNormInteractions {
  interactionTypeGroup?: InteractionTypeGroup[];
}

export async function searchDrug(drugName: string): Promise<MedicalSource[]> {
  const findUrl = new URL(`${RXNORM_BASE}/rxcui.json`);
  findUrl.searchParams.set('name', drugName);

  const findRes = await fetch(findUrl.toString(), {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10000),
  });

  if (!findRes.ok) return [];

  const findData: RxNormIdGroup = await findRes.json();
  const rxcui = findData.idGroup?.rxnormId?.[0];

  if (!rxcui) return [];

  const [propRes, interactionRes] = await Promise.allSettled([
    fetch(`${RXNORM_BASE}/rxcui/${rxcui}/allProperties.json?prop=all`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.json() as Promise<RxNormProperties>),
    fetch(`${RXNORM_BASE}/interaction/interaction.json?rxcui=${rxcui}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.json() as Promise<RxNormInteractions>),
  ]);

  const props = propRes.status === 'fulfilled'
    ? propRes.value.propConceptGroup?.propConcept || []
    : [];

  const interactions = interactionRes.status === 'fulfilled'
    ? formatInteractions(interactionRes.value)
    : '';

  const description = buildDrugDescription(props, interactions);

  return [
    {
      id: rxcui,
      source: 'rxnorm',
      category: 'drug',
      title: `${drugName} — معلومات دوائية`,
      abstract: description,
      authors: ['NLM RxNorm'],
      year: new Date().getFullYear(),
      journal: 'RxNorm Database',
      doi: null,
      url: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`,
      isOpenAccess: true,
      studyType: 'drug-label',
      language: 'en',
    },
  ];
}

function buildDrugDescription(props: PropConcept[], interactions: string): string {
  const propMap: Record<string, string> = {};
  for (const p of props) {
    if (p.propName) propMap[p.propName] = p.propValue || '';
  }

  const sections: string[] = [];
  if (propMap.RxNorm_Name) sections.push(`الاسم: ${propMap.RxNorm_Name}`);
  if (propMap.TTY) sections.push(`النوع: ${propMap.TTY}`);
  if (interactions) sections.push(`\nالتفاعلات الدوائية:\n${interactions}`);

  return sections.join('\n');
}

function formatInteractions(data: RxNormInteractions): string {
  const groups = data.interactionTypeGroup || [];
  const interactions: string[] = [];

  for (const group of groups) {
    for (const type of group.interactionType || []) {
      for (const pair of type.interactionPair || []) {
        const desc = pair.description;
        const severity = pair.severity || 'unknown';
        if (desc) {
          interactions.push(`• [${severity}] ${desc}`);
        }
      }
    }
  }

  return interactions.slice(0, 10).join('\n');
}
