import { MedicalSource } from "@/types/medical";

interface EuropePmcItem {
  pmid?: string;
  id?: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  bookOrReportDetails?: { publisher?: string };
  pubYear: string;
  doi?: string;
  abstractText?: string;
}

export async function fetchClinicalEvidence(query: string, limit: number = 4): Promise<MedicalSource[]> {
  const encodedQuery = encodeURIComponent(`(${query}) AND (HAS_ABSTRACT:y) AND (SRC:MED)`);
  const endpoint = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodedQuery}&format=json&resultType=core&pageSize=${limit}`;

  try {
    const response = await fetch(endpoint, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`Europe PMC API failed: ${response.status}`);
    }

    const data = await response.json();
    const results: EuropePmcItem[] = data.resultList?.result || [];

    return results.map((item): MedicalSource => ({
      id: item.pmid ?? item.id ?? crypto.randomUUID(),
      title: item.title,
      authors: item.authorString || "Unknown Authors",
      journal: item.journalTitle || item.bookOrReportDetails?.publisher || "Unknown Journal",
      publicationYear: item.pubYear,
      doi: item.doi || "",
      summary: item.abstractText
        ? item.abstractText.replace(/(<([^>]+)>)/gi, "")
        : "No abstract available.",
      url: item.doi
        ? `https://doi.org/${item.doi}`
        : `https://europepmc.org/article/MED/${item.pmid || item.id}`,
      evidenceLevel: "2a",
    }));
  } catch (error) {
    console.error("[MedPulse Fetcher Error]:", error);
    return [];
  }
}
