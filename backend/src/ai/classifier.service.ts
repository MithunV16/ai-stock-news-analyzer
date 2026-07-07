import OpenAI from 'openai';
import { Impact } from '@prisma/client';
import { config } from '@/config/env';
import { getOpenAIClient } from '@/ai/openai.client';
import {
  buildClassificationUserPrompt,
  CLASSIFICATION_SYSTEM_PROMPT,
} from '@/ai/prompts';
import { aiAnalysisSchema, type AiAnalysisResult } from '@/ai/schemas';
import { logger } from '@/utils/logger';

export interface ClassificationInput {
  symbol: string;
  companyName: string;
  headline: string;
  rawContent: string;
  source: string;
  publishedAt: Date;
}

/**
 * Classifies announcements via OpenAI, with a keyword fallback when no API key is set.
 */
export class ClassifierService {
  async classify(input: ClassificationInput): Promise<AiAnalysisResult> {
    const openai = getOpenAIClient();

    if (openai) {
      try {
        return await this.classifyWithOpenAi(openai, input);
      } catch (error) {
        logger.error('OpenAI classification failed — using fallback', { error });
        return this.classifyWithHeuristics(input);
      }
    }

    logger.debug('OpenAI not configured — using heuristic classifier');
    return this.classifyWithHeuristics(input);
  }

  private async classifyWithOpenAi(
    openai: OpenAI,
    input: ClassificationInput,
  ): Promise<AiAnalysisResult> {
    const response = await openai.chat.completions.create({
      model: config.OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildClassificationUserPrompt({
            symbol: input.symbol,
            companyName: input.companyName,
            headline: input.headline,
            rawContent: input.rawContent,
            source: input.source,
            publishedAt: input.publishedAt.toISOString(),
          }),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty OpenAI response');
    }

    return this.parseAnalysisJson(content, input.symbol);
  }

  private parseAnalysisJson(raw: string, fallbackSymbol: string): AiAnalysisResult {
    const trimmed = raw.trim();
    const jsonStr = trimmed.startsWith('{') ? trimmed : this.extractJson(trimmed);

    const parsed = JSON.parse(jsonStr) as unknown;
    const result = aiAnalysisSchema.safeParse(parsed);

    if (!result.success) {
      throw new Error(`Invalid AI JSON: ${result.error.message}`);
    }

    // Ensure symbol matches if model returns a different casing
    return {
      ...result.data,
      company: result.data.company.toUpperCase() || fallbackSymbol,
    };
  }

  private extractJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error('No JSON object found in AI response');
    }
    return text.slice(start, end + 1);
  }

  /** Dev fallback when OpenAI is unavailable — keyword-based rules */
  private classifyWithHeuristics(input: ClassificationInput): AiAnalysisResult {
    const text = `${input.headline} ${input.rawContent}`.toLowerCase();

    let impact: Impact = Impact.Neutral;
    let eventType = 'Corporate Update';
    let confidence = 55;
    let expectedMove = '1-3%';
    let holdingPeriod = '2-4 Days';

    if (/dividend|buyback|order win|contract|approval|profit|growth|stake increase|partnership/i.test(text)) {
      impact = Impact.Bullish;
      eventType = /dividend|buyback/i.test(text)
        ? 'Dividend / Buyback'
        : /order|contract/i.test(text)
          ? 'Order Win'
          : 'Positive Update';
      confidence = 72;
      expectedMove = '3-6%';
      holdingPeriod = '3-5 Days';
    } else if (/loss|downgrade|penalty|investigation|resign|default|fraud|slump/i.test(text)) {
      impact = Impact.Bearish;
      eventType = 'Negative Update';
      confidence = 68;
      expectedMove = '3-7%';
      holdingPeriod = '2-5 Days';
    }

    return {
      company: input.symbol,
      eventType,
      impact,
      confidence,
      expectedMove,
      holdingPeriod,
      summary: input.headline.slice(0, 200),
      reason: `Heuristic classification based on announcement keywords (${input.source}).`,
    };
  }
}

export const classifierService = new ClassifierService();
