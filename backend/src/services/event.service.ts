import { prisma } from '@/config/database';
import type { EventsQuery } from '@/types/queries';
import { eventWithRelationsInclude } from '@/utils/prismaIncludes';
import { buildPaginationMeta, paginatedResponse } from '@/types/api';

export class EventService {
  async listEvents(query: EventsQuery) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      ...(query.impact ? { impact: query.impact } : {}),
      ...(query.symbol ? { company: { symbol: query.symbol } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: eventWithRelationsInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.event.count({ where }),
    ]);

    return paginatedResponse(items, buildPaginationMeta(total, query));
  }
}

export const eventService = new EventService();
