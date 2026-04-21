/**
 * src/lib/ncbi.ts
 * NCBI E-utilities helper — server-side only.
 * Free tier: 3 req/s without key, 10/s with NCBI_API_KEY env var.
 */

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
const TIMEOUT = 12_000;

export interface NCBISearchResult {
  ids: string[];
  total: number;
  query: string;
}

export interface ArticleSection {
  title: string;
  content: string;
}

export interface ParsedArticle {
  pmcId:    string;
  title:    string;
  abstract: string;
  authors:  string[];
  journal:  string;
  year:     string;
  sections: ArticleSection[];
  keywords: string[];
}

export interface ParsedBook {
  bookId:   string;
  title:    string;
  subtitle: string;
  authors:  string[];
  year:     string;
  abstract: string;
  sections: ArticleSection[];
}

// ── Lightweight XML helpers (no dependencies) ─────────────────────────────────

function xmlText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? stripTags(m[1]).trim() : "";
}

function xmlAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(stripTags(m[1]).trim());
  return out.filter(Boolean);
}

function xmlAllRaw(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1]);
  return out;
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSections(bodyXml: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  const secBlocks = xmlAllRaw(bodyXml, "sec");
  for (const block of secBlocks) {
    const title   = xmlText(block, "title");
    const paras   = xmlAll(block, "p");
    const content = paras.join("\n\n");
    if (title || content) sections.push({ title, content });
  }
  // Fallback: if no <sec> tags, grab all <p> tags from body directly
  if (sections.length === 0) {
    const paras = xmlAll(bodyXml, "p").filter(p => p.length > 30);
    if (paras.length > 0) sections.push({ title: "", content: paras.join("\n\n") });
  }
  return sections;
}

// ── Public API functions ───────────────────────────────────────────────────────

export async function searchNCBI(
  db: "pmc" | "books",
  query: string,
  retmax = 10
): Promise<NCBISearchResult> {
  const filter = db === "pmc" ? "&filter=open+access%5Bfilter%5D" : "";
  const url = `${BASE}/esearch.fcgi?db=${db}&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json${filter}${API_KEY}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NCBI search failed: ${res.status}`);

  const data = await res.json() as {
    esearchresult: { idlist: string[]; count: string; querytranslation: string };
  };
  return {
    ids: data.esearchresult.idlist,
    total: parseInt(data.esearchresult.count ?? "0"),
    query: data.esearchresult.querytranslation ?? query,
  };
}

export async function fetchArticleSummaries(
  db: "pmc" | "books",
  ids: string[]
): Promise<Record<string, { title: string; authors: string[]; year: string; journal: string; abstract: string }>> {
  if (ids.length === 0) return {};
  const url = `${BASE}/esummary.fcgi?db=${db}&id=${ids.join(",")}&retmode=json${API_KEY}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`NCBI summary failed: ${res.status}`);

  const data = await res.json() as { result: Record<string, unknown> };
  const out: Record<string, { title: string; authors: string[]; year: string; journal: string; abstract: string }> = {};

  for (const id of ids) {
    const item = data.result[id] as Record<string, unknown> | undefined;
    if (!item) continue;

    const authList = (item.authors as { name?: string }[] | undefined) ?? [];
    const srcDate  = item.sortpubdate as string | undefined ?? "";
    const year     = srcDate.slice(0, 4) || (item.pubdate as string ?? "").slice(0, 4);

    out[id] = {
      title:   (item.title as string) ?? (item.booktitle as string) ?? "Untitled",
      authors: authList.map(a => a.name ?? "").filter(Boolean),
      year,
      journal: (item.fulljournalname as string) ?? (item.source as string) ?? "",
      abstract: (item.abstract as string) ?? "",
    };
  }
  return out;
}

export async function fetchPMCArticle(pmcId: string): Promise<ParsedArticle> {
  // Strip "PMC" prefix if present
  const numericId = pmcId.replace(/^PMC/i, "");
  const url = `${BASE}/efetch.fcgi?db=pmc&id=${numericId}&rettype=xml&retmode=xml${API_KEY}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NCBI efetch failed: ${res.status}`);
  const xml = await res.text();

  const title    = xmlText(xml, "article-title") || xmlText(xml, "BookTitle") || "Untitled";
  const abstract = xmlAll(xml, "abstract").flatMap(a => xmlAll(a, "p")).join("\n\n") ||
                   xmlText(xml, "abstract");

  // Authors: surname + given-names
  const contribs = xmlAllRaw(xml, "contrib");
  const authors  = contribs.map(c => {
    const surname = xmlText(c, "surname");
    const given   = xmlText(c, "given-names");
    return [given, surname].filter(Boolean).join(" ");
  }).filter(Boolean).slice(0, 6);

  const journal = xmlText(xml, "journal-title") || xmlText(xml, "source");
  const year    = xmlText(xml, "year") || new Date().getFullYear().toString();

  const keywordEls = xmlAll(xml, "kwd");

  const bodyMatch = xml.match(/<body(?:\s[^>]*)?>[\s\S]*?<\/body>/i);
  const sections  = bodyMatch ? extractSections(bodyMatch[0]) : [];

  return { pmcId: `PMC${numericId}`, title, abstract, authors, journal, year, sections, keywords: keywordEls };
}

export async function fetchBookContent(bookId: string): Promise<ParsedBook> {
  // bookId is like "NBK430685"
  const url = `${BASE}/efetch.fcgi?db=books&id=${bookId}&rettype=xml&retmode=xml${API_KEY}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`NCBI books efetch failed: ${res.status}`);
  const xml = await res.text();

  const title    = xmlText(xml, "book-title")   || xmlText(xml, "title")   || bookId;
  const subtitle = xmlText(xml, "subtitle")     || "";
  const abstract = xmlText(xml, "abstract")     || xmlText(xml, "BookAbstract") || "";
  const year     = xmlText(xml, "year")         || "";

  const contribs = xmlAllRaw(xml, "contrib");
  const authors  = contribs.map(c => {
    const surname = xmlText(c, "surname");
    const given   = xmlText(c, "given-names");
    return [given, surname].filter(Boolean).join(" ");
  }).filter(Boolean);

  const bodyMatch = xml.match(/<body(?:\s[^>]*)?>[\s\S]*?<\/body>/i);
  const sections  = bodyMatch ? extractSections(bodyMatch[0]) : [];

  return { bookId, title, subtitle, authors, year, abstract, sections };
}

// ── Curated book catalog (NCBI Bookshelf IDs) ─────────────────────────────────
export const CURATED_BOOKS = [
  {
    id:          "NBK430685",
    title:       "StatPearls",
    subtitle:    "Continuously updated clinical reviews",
    specialty:   "All Specialties",
    color:       "indigo",
    description: "Peer-reviewed clinical articles covering all medical specialties, updated continuously by board-certified clinicians.",
  },
  {
    id:          "NBK201",
    title:       "Clinical Methods",
    subtitle:    "The History, Physical, and Laboratory Examinations",
    specialty:   "Clinical Skills",
    color:       "teal",
    description: "A comprehensive reference for clinical examination techniques, history-taking, and laboratory interpretation.",
  },
  {
    id:          "NBK278955",
    title:       "Endotext",
    subtitle:    "Endocrinology reference",
    specialty:   "Endocrinology",
    color:       "amber",
    description: "Free, peer-reviewed endocrinology reference covering diabetes, thyroid, adrenal, and pituitary disorders.",
  },
  {
    id:          "NBK1116",
    title:       "GeneReviews",
    subtitle:    "Expert-authored genetic disease summaries",
    specialty:   "Genetics",
    color:       "violet",
    description: "Expert-authored summaries of genetic conditions including diagnosis, management, and genetic counseling.",
  },
  {
    id:          "NBK548272",
    title:       "Drug-Induced Liver Injury",
    subtitle:    "NCBI LiverTox database",
    specialty:   "Hepatology",
    color:       "rose",
    description: "Comprehensive resource on hepatotoxicity of drugs, supplements, and herbals with clinical case reports.",
  },
  {
    id:          "NBK470545",
    title:       "Pharmacology Review",
    subtitle:    "StatPearls pharmacology module",
    specialty:   "Pharmacology",
    color:       "sky",
    description: "Board-focused pharmacology review covering mechanisms, clinical uses, and adverse effects of key drug classes.",
  },
] as const;
