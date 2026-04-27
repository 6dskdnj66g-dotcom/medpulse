import {
  MedicalSource,
  QueryClassification,
} from './types';
import { searchPubMed } from './sources/pubmed';
import { searchOpenAlex } from './sources/openalex';
import { searchEuropePMC } from './sources/europepmc';
import { searchClinicalTrials } from './sources/clinicaltrials';
import { searchStatPearls } from './sources/statpearls';
import { searchDrug } from './sources/rxnorm';
import { searchFDADrugLabel } from './sources/openfda';
import { scoreSource } from './scorer';

interface AggregateOptions {
  maxTotal?: number;
}

export async function aggregateSources(
  classification: QueryClassification,
  options: AggregateOptions = {}
): Promise<MedicalSource[]> {
  const { maxTotal = 10 } = options;
  const minYear = classification.needsRecency ? 2022 : 2018;
  const searchQuery = classification.englishTerms.join(' ');

  const fetchPromises: Promise<MedicalSource[]>[] = [];

  // Always: PubMed + OpenAlex (core foundation)
  fetchPromises.push(
    searchPubMed(searchQuery, { maxResults: 5, minYear }).catch((e) => {
      console.error('[aggregator] PubMed:', e);
      return [];
    })
  );
  fetchPromises.push(
    searchOpenAlex(searchQuery, { maxResults: 3, minYear }).catch((e) => {
      console.error('[aggregator] OpenAlex:', e);
      return [];
    })
  );

  // Educational/conceptual → StatPearls
  if (
    classification.primaryIntent === 'educational' ||
    classification.questionType === 'conceptual'
  ) {
    fetchPromises.push(
      searchStatPearls(searchQuery, { maxResults: 3 }).catch((e) => {
        console.error('[aggregator] StatPearls:', e);
        return [];
      })
    );
  }

  // Comparative or guideline-needed → Europe PMC (full text)
  if (
    classification.questionType === 'comparative' ||
    classification.needsGuidelines
  ) {
    fetchPromises.push(
      searchEuropePMC(searchQuery, {
        maxResults: 3,
        minYear,
        openAccessOnly: true,
      }).catch((e) => {
        console.error('[aggregator] EuropePMC:', e);
        return [];
      })
    );
  }

  // Clinical trials needed
  if (
    classification.needsTrials ||
    classification.primaryIntent === 'clinical_trial'
  ) {
    fetchPromises.push(
      searchClinicalTrials(searchQuery, { maxResults: 3 }).catch((e) => {
        console.error('[aggregator] ClinicalTrials:', e);
        return [];
      })
    );
  }

  // Drug-related queries
  if (classification.drugNames && classification.drugNames.length > 0) {
    for (const drug of classification.drugNames.slice(0, 2)) {
      fetchPromises.push(
        searchDrug(drug).catch((e) => {
          console.error('[aggregator] RxNorm:', e);
          return [];
        })
      );
      fetchPromises.push(
        searchFDADrugLabel(drug).catch((e) => {
          console.error('[aggregator] OpenFDA:', e);
          return [];
        })
      );
    }
  }

  // Execute in parallel
  const results = await Promise.all(fetchPromises);
  const allSources = results.flat();

  // Score sources
  for (const source of allSources) {
    source.qualityScore = scoreSource(source);
  }

  // Deduplicate by DOI/URL
  const seen = new Set<string>();
  const unique = allSources.filter((s) => {
    const key = s.doi || s.url || `${s.source}-${s.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by quality score
  unique.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

  return unique.slice(0, maxTotal);
}