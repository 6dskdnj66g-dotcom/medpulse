import { tool } from "ai";
import { z } from "zod";
import { search } from "duck-duck-scrape";

/**
 * A highly specific Search Tool targeting global medical repositories.
 * Uses completely free, keyless DuckDuckGo web scraping.
 */
export const freeMedicalSearchTool = tool({
  description: "Search the web EXCLUSIVELY across trusted global medical guidelines and repositories (NICE, NIH, AHA, UpToDate, Mayo, CDC) to retrieve evidence-based clinical answers. Use this tool WHENEVER you need factual medical information to answer a clinical question or calculate a rigorous dose.",
  parameters: z.object({
    query: z.string().describe("The precise medical search query in English. Add terms like 'site:nih.gov' or 'guidelines' to focus the search (e.g., 'Aspirin dosage Kawasaki disease AHA guidelines')."),
  }),
  execute: async ({ query }) => {
    try {
      const searchResults = await search(query, {
        safeSearch: "moderate"
      });

      if (!searchResults.results || searchResults.results.length === 0) {
        return "No trusted medical results found for this query. Inform the user that there is no solid medical guideline found for this specific query right now.";
      }

      // Take the top 4 results to save tokens
      const topResults = searchResults.results.slice(0, 4);
      
      const formattedResults = topResults.map((r: any) => `TITLE: ${r.title}\nURL: ${r.url}\nCONTENT_SNIPPET: ${r.description}`).join("\n\n---\n\n");
      
      return `SEARCH RESULTS FOR "${query}":\n\n${formattedResults}`;
    } catch (error: unknown) {
      console.error("Free Medical Search Tool Error:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      return `Search failed due to a network or scraping error: ${msg}`;
    }
  },
});
