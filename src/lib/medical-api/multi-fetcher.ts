import { MedicalSource } from "@/types/medical";

interface EuropePmcItem {
  pmid?: string;
  id?: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  pubYear: string;
  doi?: string;
  abstractText?: string;
}

interface EuropePmcResponse {
  resultList?: { result?: EuropePmcItem[] };
}

interface ClinicalTrialStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string };
    descriptionModule?: { briefSummary?: string };
  };
}

interface ClinicalTrialsResponse {
  studies?: ClinicalTrialStudy[];
}

export async function fetchGlobalEvidence(query: string): Promise<MedicalSource[]> {
  const encodedQuery = encodeURIComponent(`(${query}) AND (HAS_ABSTRACT:y)`);

  const endpoints = {
    europePmc: `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodedQuery}%20AND%20(SRC:MED)&format=json&resultType=core&pageSize=3`,
    clinicalTrials: `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodedQuery}&pageSize=2`,
  };

  const [pmcResult, trialsResult] = await Promise.allSettled([
    fetch(endpoints.europePmc, { next: { revalidate: 3600 } }).then((r) => r.json() as Promise<EuropePmcResponse>),
    fetch(endpoints.clinicalTrials, { next: { revalidate: 3600 } }).then((r) => r.json() as Promise<ClinicalTrialsResponse>),
  ]);

  const combinedSources: MedicalSource[] = [];

  if (pmcResult.status === "fulfilled" && pmcResult.value.resultList) {
    const pmcData = pmcResult.value.resultList.result ?? [];
    combinedSources.push(
      ...pmcData.map((item): MedicalSource => ({
        id: item.pmid ?? item.id ?? crypto.randomUUID(),
        title: `[MEDLINE] ${item.title}`,
        authors: item.authorString ?? "Unknown",
        journal: item.journalTitle ?? "Medical Journal",
        publicationYear: item.pubYear,
        doi: item.doi ?? "",
        url: item.doi
          ? `https://doi.org/${item.doi}`
          : `https://europepmc.org/article/MED/${item.pmid ?? item.id}`,
        summary: item.abstractText
          ? item.abstractText.replace(/(<([^>]+)>)/gi, "")
          : "No abstract",
        evidenceLevel: "2a",
      }))
    );
  }

  if (trialsResult.status === "fulfilled" && trialsResult.value.studies) {
    const trialData = trialsResult.value.studies;
    combinedSources.push(
      ...trialData.map((study): MedicalSource => {
        const id = study.protocolSection?.identificationModule;
        const desc = study.protocolSection?.descriptionModule;
        const nctId = id?.nctId ?? crypto.randomUUID();
        return {
          id: nctId,
          title: `[CLINICAL TRIAL] ${id?.briefTitle ?? "Untitled Study"}`,
          authors: "US NIH",
          journal: "ClinicalTrials.gov",
          publicationYear: new Date().getFullYear().toString(),
          doi: "",
          url: `https://clinicaltrials.gov/study/${nctId}`,
          summary: desc?.briefSummary ?? "Trial ongoing.",
          evidenceLevel: "1b",
        };
      })
    );
  }

  return combinedSources;
}
