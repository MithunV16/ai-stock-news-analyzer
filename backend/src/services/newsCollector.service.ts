import { prisma } from '@/config/database';
import { analysisService } from '@/ai/analysis.service';
import { newsProviderRegistry } from '@/jobs/providers/registry';
import type { CollectorRunResult, RawAnnouncement } from '@/jobs/providers/types';
import { duplicateDetectionService } from '@/services/duplicateDetection.service';
import { logger } from '@/utils/logger';

/**
 * Orchestrates the news ingestion pipeline:
 * fetch → deduplicate → resolve company → persist → trigger AI analysis
 */
export class NewsCollectorService {
  private running = false;

  constructor(
    private readonly dedup = duplicateDetectionService,
    private readonly analysis = analysisService,
  ) {}

  async run(): Promise<CollectorRunResult> {
    if (this.running) {
      logger.debug('News collector already running — skipping overlapping tick');
      return { fetched: 0, inserted: 0, duplicates: 0, skipped: 0, errors: 0 };
    }

    this.running = true;
    const result: CollectorRunResult = {
      fetched: 0,
      inserted: 0,
      duplicates: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      const providers = newsProviderRegistry.getAll();

      if (providers.length === 0) {
        logger.warn('No news providers registered');
        return result;
      }

      for (const provider of providers) {
        try {
          const announcements = await provider.fetchLatest();
          result.fetched += announcements.length;

          for (const item of announcements) {
            await this.processAnnouncement(item, result);
          }
        } catch (error) {
          result.errors += 1;
          logger.error('Provider fetch failed', {
            provider: provider.name,
            error,
          });
        }
      }

      if (result.inserted > 0) {
        logger.info('News collector cycle complete', result);
      } else {
        logger.debug('News collector cycle complete', result);
      }

      return result;
    } finally {
      this.running = false;
    }
  }

  private async processAnnouncement(
    item: RawAnnouncement,
    result: CollectorRunResult,
  ): Promise<void> {
    try {
      if (await this.dedup.isDuplicate(item.url)) {
        result.duplicates += 1;
        return;
      }

      const company = await prisma.company.findUnique({
        where: { symbol: item.symbol.toUpperCase() },
        select: { id: true, symbol: true },
      });

      if (!company) {
        result.skipped += 1;
        logger.debug('Skipping announcement — unknown symbol', { symbol: item.symbol });
        return;
      }

      const news = await prisma.news.create({
        data: {
          companyId: company.id,
          headline: item.headline,
          source: item.source,
          url: item.url,
          publishedAt: item.publishedAt,
          rawContent: item.rawContent,
        },
      });

      await this.dedup.markSeen(item.url);
      result.inserted += 1;

      // Fire-and-forget — AI analysis runs async (Step 10)
      void this.analysis.analyzeNews(news.id).catch((error) => {
        logger.error('AI analysis failed', { newsId: news.id, error });
      });
    } catch (error) {
      result.errors += 1;
      logger.error('Failed to process announcement', {
        symbol: item.symbol,
        url: item.url,
        error,
      });
    }
  }
}

export const newsCollectorService = new NewsCollectorService();
