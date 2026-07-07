import { Impact } from '@prisma/client';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Maintains aggregated signal scores per company based on AI event classifications.
 */
export class ScoreService {
  async updateFromEvent(companyId: string, impact: Impact, confidence: number): Promise<void> {
    const delta = this.impactToDelta(impact, confidence);

    const existing = await prisma.score.findUnique({
      where: { companyId },
      select: { score: true },
    });

    const nextScore = existing
      ? this.blendScore(existing.score, delta)
      : delta;

    await prisma.score.upsert({
      where: { companyId },
      create: { companyId, score: nextScore },
      update: { score: nextScore },
    });

    logger.debug('Company score updated', { companyId, score: nextScore });
  }

  private impactToDelta(impact: Impact, confidence: number): number {
    const normalized = confidence / 100;
    switch (impact) {
      case Impact.Bullish:
        return normalized * 100;
      case Impact.Bearish:
        return -normalized * 100;
      default:
        return 0;
    }
  }

  /** Weighted moving average — recent events influence score without wild swings */
  private blendScore(current: number, delta: number): number {
    return Math.round((current * 0.6 + delta * 0.4) * 100) / 100;
  }
}

export const scoreService = new ScoreService();
