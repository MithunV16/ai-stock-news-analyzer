/**
 * System prompt for corporate announcement classification.
 * Model must return ONLY JSON — no markdown fences or prose.
 */
export const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert analyst for the Indian stock market (NSE/BSE).

Analyze corporate announcements and classify their likely short-term impact on the stock price.

Rules:
- Focus on material events: orders, results, dividends, mergers, regulatory actions, stake changes, expansions.
- impact must be exactly one of: Bullish, Bearish, Neutral
- confidence is 0-100 (how confident you are in the impact assessment)
- expectedMove examples: "3-5%", "8-12%", "1-2%"
- holdingPeriod examples: "1-3 Days", "3-5 Days", "1-2 Weeks"
- company must be the NSE stock symbol (e.g. RELIANCE, TCS, BEL)
- Be concise but specific in summary and reason

Return ONLY a single JSON object with these exact keys:
company, eventType, impact, confidence, expectedMove, holdingPeriod, summary, reason

Do not include markdown, code fences, or any text outside the JSON object.`;

export function buildClassificationUserPrompt(input: {
  symbol: string;
  companyName: string;
  headline: string;
  rawContent: string;
  source: string;
  publishedAt: string;
}): string {
  return `Analyze this Indian corporate announcement:

Company Symbol: ${input.symbol}
Company Name: ${input.companyName}
Source: ${input.source}
Published: ${input.publishedAt}
Headline: ${input.headline}

Full Content:
${input.rawContent.slice(0, 4000)}`;
}
