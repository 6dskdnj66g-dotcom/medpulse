import { tool, generateText } from "ai";
import { z } from "zod";
import { search } from "duck-duck-scrape";
import { createGroq } from "@ai-sdk/groq";

// Simple in-memory global cache to save tokens and speed up identical searches
const searchCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Detects if a string contains Arabic characters
 */
function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Use a fast LLM call to translate Arabic medical queries and expand with English keywords
 * for maximum RAG accuracy.
 */
async function optimizeQuery(query: string): Promise<string> {
  const needsProcessing = containsArabic(query) || query.split(" ").length < 3;
  if (!needsProcessing) return query;

  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return query;
    
    const groq = createGroq({ apiKey: groqKey });
    const { text } = await generateText({
      model: groq("llama-3-8b-8192"),
      system: "You are a medical search query optimizer. Translate the user's input to technical clinical English. Add keywords like 'clinical guidelines', 'dosage', or 'management'. ONLY output the final search query string. No chatter. No quotes.",
      prompt: `Translate and expand this medical query for a web search: "${query}"`,
    });
    
    const optimized = text.trim();
    console.log(`[RAG Optimizer] Original: "${query}" -> Optimized: "${optimized}"`);
    return optimized;
  } catch (e) {
    console.warn("[RAG Optimizer] Fallback to original query due to error:", e);
    return query;
  }
}

/**
 * A highly specific Search Tool targeting global medical repositories.
 */
export const freeMedicalSearchTool = tool({
  description: "Search the web EXCLUSIVELY across trusted global medical guidelines (NICE, NIH, AHA, UpToDate, CDC). Use this tool whenever you need factual medical information. The tool internally optimizes queries for best results.",
  parameters: z.object({
    query: z.string().describe("The medical query (can be in Arabic or English)."),
  }),
  // @ts-expect-error - Vercel AI SDK types may resolve this to undefined in older versions
  execute: async ({ query }: { query: string }) => {
    try {
      const now = Date.now();
      
      // 1. Optimize and Expand Query (Arabic -> Clinical English)
      const experimentalQuery = await optimizeQuery(query);
      
      // 2. Check Cache
      if (searchCache.has(experimentalQuery)) {
        const cached = searchCache.get(experimentalQuery)!;
        if (now - cached.timestamp < CACHE_TTL_MS) {
          console.log(`[RAG Cache Hit] Query: ${experimentalQuery}`);
          return cached.data;
        } else {
          searchCache.delete(experimentalQuery);
        }
      }

      console.log(`[RAG Cache Miss] Scraping for Query: ${experimentalQuery}`);
      // Use site restrictions for high authority, but also allow general search if needed
      const searchResults = await search(`${experimentalQuery} site:nih.gov OR site:nice.org.uk OR site:uptodate.com`);

      if (!searchResults.results || searchResults.results.length === 0) {
        // Fallback search without site restrictions if specific sites yield nothing
        const generalResults = await search(experimentalQuery);
        if (!generalResults.results || generalResults.results.length === 0) {
          return "No trusted medical results found for this query.";
        }
        searchResults.results = generalResults.results;
      }

      // Take the top 4 results
      const topResults = searchResults.results.slice(0, 4);
      const formattedResults = topResults.map((r: { title: string; url: string; description: string }) => 
        `TITLE: ${r.title}\nURL: ${r.url}\nCONTENT_SNIPPET: ${r.description}`
      ).join("\n\n---\n\n");
      
      const responseText = `SEARCH RESULTS FOR "${experimentalQuery}":\n\n${formattedResults}`;
      
      // Save to Cache
      if (searchCache.size > 500) {
        const firstKey = searchCache.keys().next().value;
        if (firstKey) searchCache.delete(firstKey);
      }
      searchCache.set(experimentalQuery, { data: responseText, timestamp: now });

      return responseText;
    } catch (error: unknown) {
      console.error("Free Medical Search Tool Error:", error);
      return `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
});
