import { Impact } from '@prisma/client';
import { prisma } from '@/config/database';
import type { DashboardQuery } from '@/types/queries';
import { eventWithRelationsInclude } from '@/utils/prismaIncludes';
import { successResponse } from '@/types/api';

export class DashboardService {
  async getDashboard(query: DashboardQuery) {
    const [recentEvents, stats, topScores] = await Promise.all([
      prisma.event.findMany({
        include: eventWithRelationsInclude,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
      }),
      this.getStats(),
      prisma.score.findMany({
        include: {
          company: {
            select: { symbol: true, companyName: true, sector: true },
          },
        },
        orderBy: { score: 'desc' },
        take: 10,
      }),
    ]);

    return successResponse({
      recentEvents,
      stats,
      topScores,
    });
  }

  private async getStats() {
    const [totalCompanies, totalNews, totalEvents, impactCounts] = await Promise.all([
      prisma.company.count(),
      prisma.news.count(),
      prisma.event.count(),
      prisma.event.groupBy({
        by: ['impact'],
        _count: { impact: true },
      }),
    ]);

    const byImpact = Object.values(Impact).reduce(
      (acc, impact) => {
        acc[impact] = impactCounts.find((g) => g.impact === impact)?._count.impact ?? 0;
        return acc;
      },
      {} as Record<Impact, number>,
    );

    return {
      totalCompanies,
      totalNews,
      totalEvents,
      byImpact,
    };
  }
}

export const dashboardService = new DashboardService();
