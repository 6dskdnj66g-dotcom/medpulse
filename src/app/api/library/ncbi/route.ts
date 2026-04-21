import { NextRequest, NextResponse } from "next/server";
import { searchNCBI, fetchPMCArticle, fetchBookContent, fetchArticleSummaries } from "@/lib/ncbi";
import { headers } from "next/headers";

const rateLimitStore = new Map<string, number[]>();
function checkRate(ip: string): boolean {
  const now  = Date.now();
  const hits = (rateLimitStore.get(ip) ?? []).filter(t => now - t < 60_000);
  if (hits.length >= 30) return false;
  hits.push(now);
  rateLimitStore.set(ip, hits);
  return true;
}

export async function GET(req: NextRequest) {
  const hdrs = await headers();
  const ip   = hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRate(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");   // search | fetch | summary
  const db     = (searchParams.get("db") ?? "pmc") as "pmc" | "books";
  const q      = searchParams.get("q") ?? "";
  const id     = searchParams.get("id") ?? "";
  const retmax = Math.min(parseInt(searchParams.get("retmax") ?? "10"), 50);

  try {
    if (action === "search") {
      if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });
      const result = await searchNCBI(db, q, retmax);

      // Also fetch summaries for the returned IDs
      const summaries = result.ids.length > 0
        ? await fetchArticleSummaries(db, result.ids)
        : {};

      return NextResponse.json({ ...result, summaries },
        { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
    }

    if (action === "fetch-article") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
      const article = await fetchPMCArticle(id);
      return NextResponse.json(article,
        { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" } });
    }

    if (action === "fetch-book") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
      const book = await fetchBookContent(id);
      return NextResponse.json(book,
        { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800" } });
    }

    if (action === "summary") {
      if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
      const ids = id.split(",").slice(0, 20);
      const summaries = await fetchArticleSummaries(db, ids);
      return NextResponse.json(summaries,
        { headers: { "Cache-Control": "public, s-maxage=3600" } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const msg = (err as Error).message;
    console.error("[NCBI API]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
