import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import type { NewsProvider, RawAnnouncement } from '@/jobs/providers/types';

const MOCK_HEADLINES = [
  'Company wins major government defence contract worth Rs 2,500 crore',
  'Board approves interim dividend of Rs 5 per share',
  'Receives order worth Rs 800 crore from domestic client',
  'Q4 results: Net profit rises 18% YoY',
  'Signs MoU with PSU for strategic partnership',
  'Promoter group increases stake via open market purchase',
  'Gets regulatory approval for new manufacturing facility',
] as const;

/**
 * Development/demo provider — generates announcements for seeded companies.
 * Disabled in production via ENABLE_MOCK_NEWS env flag.
 */
export class MockNewsProvider implements NewsProvider {
  readonly name = 'mock';

  async fetchLatest(): Promise<RawAnnouncement[]> {
    const companies = await prisma.company.findMany({
      select: { symbol: true, companyName: true },
      take: 5,
      orderBy: { symbol: 'asc' },
    });

    if (companies.length === 0) {
      return [];
    }

    const now = Date.now();
    const pick = companies[now % companies.length];
    const headline = MOCK_HEADLINES[now % MOCK_HEADLINES.length];

    const announcement: RawAnnouncement = {
      symbol: pick.symbol,
      headline: `${pick.companyName}: ${headline}`,
      source: this.name,
      url: `https://mock.stock-news.local/${pick.symbol}/${now}`,
      publishedAt: new Date(),
      rawContent: `Mock announcement for ${pick.symbol} generated at ${new Date().toISOString()}`,
    };

    logger.debug('Mock provider generated announcement', {
      symbol: announcement.symbol,
    });

    return [announcement];
  }
}

export const mockNewsProvider = new MockNewsProvider();
