import { GoogleGenAI } from "@google/genai";

export interface MarketResearchSource {
  title: string;
  url: string;
  domain: string;
}

export interface MarketResearchResult {
  report: string;
  source: "gemini-google-search" | "gemini-direct" | "fallback";
  grounded: boolean;
  model: string;
  searchedAt: string;
  searchQueries: string[];
  sources: MarketResearchSource[];
  warnings: string[];
}

export interface MarketResearchOptions {
  client: GoogleGenAI;
  prompt: string;
  model?: string;
}

/**
 * Extracts hostname domain safely from a URL string
 */
function extractDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

/**
 * Executes live market research using Gemini with Google Search tool grounding
 */
export async function executeMarketResearch({
  client,
  prompt,
  model,
}: MarketResearchOptions): Promise<MarketResearchResult> {
  const chosenModel =
    model ||
    process.env.GEMINI_MARKET_RESEARCH_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";

  const searchedAt = new Date().toISOString();
  const warnings: string[] = [];

  try {
    // Attempt generation with Google Search tool
    const response = await client.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract search queries
    const searchQueries: string[] = Array.isArray(groundingMetadata?.webSearchQueries)
      ? groundingMetadata.webSearchQueries
          .map((q: any) => (typeof q === "string" ? q.trim() : ""))
          .filter(Boolean)
      : [];

    // Extract grounding sources (deduplicated by URL)
    const sources: MarketResearchSource[] = [];
    const seenUrls = new Set<string>();

    if (Array.isArray(groundingMetadata?.groundingChunks)) {
      for (const chunk of groundingMetadata.groundingChunks) {
        const web = (chunk as any)?.web;
        if (web && typeof web.uri === "string" && web.uri.startsWith("http")) {
          const rawUrl = web.uri.trim();
          if (!seenUrls.has(rawUrl)) {
            seenUrls.add(rawUrl);
            const domain = extractDomain(rawUrl);
            const title = typeof web.title === "string" && web.title.trim()
              ? web.title.trim()
              : domain;
            sources.push({
              title,
              url: rawUrl,
              domain,
            });
          }
        }
      }
    }

    const reportText = response.text || "";
    const isGrounded = sources.length > 0 || searchQueries.length > 0;

    return {
      report: reportText,
      source: isGrounded ? "gemini-google-search" : "gemini-direct",
      grounded: isGrounded,
      model: chosenModel,
      searchedAt,
      searchQueries,
      sources,
      warnings,
    };
  } catch (err: any) {
    console.warn(`[MarketResearch] Failed with Google Search grounding (${chosenModel}):`, err?.message);
    warnings.push(`Google Search grounding note: ${err?.message || "fallback to standard generation"}`);

    // Fallback to standard generation if Google Search tool failed
    const fallbackResponse = await client.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return {
      report: fallbackResponse.text || "시장조사 보고서 생성에 실패했습니다.",
      source: "gemini-direct",
      grounded: false,
      model: chosenModel,
      searchedAt,
      searchQueries: [],
      sources: [],
      warnings,
    };
  }
}
