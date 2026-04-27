import { MedicalSource, QueryClassification } from './types';
import { searchPubMed } from './sources/pubmed';
import { searchOpenAlex } from './sources/openalex';
import { searchEuropePMC } from './sources/europepmc';
import { searchClinicalTrials } from './sources/clinicaltrials';
import { searchStatPearls } from './sources/statpearls';
import { searchDrug } from './sources/rxnorm';
import { searchFDADrugLabel, searchFDAAdverseEvents } from './sources/openfda';
import { scoreSource } from './scorer';

export async function aggregateSourcesSmart(
  classification: QueryClassification,
  options: { maxTotal?: number } = {}
): Promise<MedicalSource[]> {
  const { maxTotal = 10 } = options;
  const minYear = classification.needsRecency ? 2022 : 2018;
  const searchQuery = classification.englishTerms.join(' ');

  const fetchPromises: Promise<MedicalSource[]>[] = [];

  // Core sources — always included
  fetchPromises.push(searchPubMed(searchQuery, { maxResults: 5, minYear }));
  fetchPromises.push(searchOpenAlex(searchQuery, { maxResults: 3, minYear }));

  // Educational → StatPearls
  if (
    classification.primaryIntent === 'educational' ||
    classification.questionType === 'conceptual'
  ) {
    fetchPromises.push(searchStatPearls(searchQuery, { maxResults: 3 }));
  }

  // Comparative or guidelines → Europe PMC open access
  if (classification.questionType === 'comparative' || classification.needsGuidelines) {
    fetchPromises.push(
      searchEuropePMC(searchQuery, { maxResults: 3, minYear, openAccessOnly: true })
    );
  }

  // Clinical trials
  if (classification.needsTrials || classification.primaryIntent === 'clinical_trial') {
    fetchPromises.push(searchClinicalTrials(searchQuery, { maxResults: 3 }));
  }

  // Drug queries
  if (classification.drugNames && classification.drugNames.length > 0) {
    for (const drug of classification.drugNames.slice(0, 2)) {
      fetchPromises.push(searchDrug(drug));
      fetchPromises.push(searchFDADrugLabel(drug));
      if (classification.questionType === 'factual') {
        fetchPromises.push(searchFDAAdverseEvents(drug));
      }
    }
  }

  const results = await Promise.allSettled(fetchPromises);

  const allSources: MedicalSource[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    } else {
      console.error('[aggregator] Source failed:', result.reason);
    }
  }

  for (const source of allSources) {
    source.qualityScore = scoreSource(source);
  }

  const seen = new Set<string>();
  const unique = allSources.filter(s => {
    const key = s.doi || s.url || `${s.source}-${s.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

  return unique.slice(0, maxTotal);
}
