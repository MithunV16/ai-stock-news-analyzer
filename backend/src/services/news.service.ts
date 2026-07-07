import { prisma } from '@/config/database';
import type { NewsQuery } from '@/types/queries';
import { newsWithCompanyInclude } from '@/utils/prismaIncludes';
import { buildPaginationMeta, paginatedResponse } from '@/types/api';

export class NewsService {
  async listNews(query: NewsQuery) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      ...(query.source ? { source: query.source } : {}),
      ...(query.symbol ? { company: { symbol: query.symbol } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: newsWithCompanyInclude,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.news.count({ where }),
    ]);

    return paginatedResponse(items, buildPaginationMeta(total, query));
  }
}

export const newsService = new NewsService();
