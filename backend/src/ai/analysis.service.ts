import { prisma } from '@/config/database';
import { classifierService } from '@/ai/classifier.service';
import { scoreService } from '@/services/score.service';
import { socketService } from '@/socket';
import { eventWithRelationsInclude } from '@/utils/prismaIncludes';
import { logger } from '@/utils/logger';
import { AppError } from '@/utils/errors';

/**
 * End-to-end AI pipeline for a single news item:
 * classify → persist Event → update Score → broadcast via Socket.io
 */
export class AnalysisService {
  private inFlight = new Set<string>();

  constructor(
    private readonly classifier = classifierService,
    private readonly scores = scoreService,
  ) {}

  async analyzeNews(newsId: string): Promise<void> {
    if (this.inFlight.has(newsId)) {
      logger.debug('Analysis already in progress', { newsId });
      return;
    }

    this.inFlight.add(newsId);

    try {
      const news = await prisma.news.findUnique({
        where: { id: newsId },
        include: {
          company: true,
          event: { select: { id: true } },
        },
      });

      if (!news) {
        throw AppError.notFound(`News not found: ${newsId}`);
      }

      if (news.event) {
        logger.debug('News already analyzed', { newsId });
        return;
      }

      logger.info('Starting AI analysis', {
        newsId,
        symbol: news.company.symbol,
        headline: news.headline,
      });

      const analysis = await this.classifier.classify({
        symbol: news.company.symbol,
        companyName: news.company.companyName,
        headline: news.headline,
        rawContent: news.rawContent,
        source: news.source,
        publishedAt: news.publishedAt,
      });

      const event = await prisma.event.create({
        data: {
          newsId: news.id,
          companyId: news.companyId,
          eventType: analysis.eventType,
          impact: analysis.impact,
          confidence: analysis.confidence,
          summary: analysis.summary,
          expectedMove: analysis.expectedMove,
          holdingPeriod: analysis.holdingPeriod,
          reason: analysis.reason,
        },
        include: eventWithRelationsInclude,
      });

      await this.scores.updateFromEvent(news.companyId, analysis.impact, analysis.confidence);

      socketService.broadcastNewEvent(event);

      logger.info('AI analysis complete', {
        newsId,
        eventId: event.id,
        symbol: event.company.symbol,
        impact: event.impact,
        confidence: event.confidence,
      });
    } finally {
      this.inFlight.delete(newsId);
    }
  }
}

export const analysisService = new AnalysisService();
