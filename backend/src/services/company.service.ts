import { prisma } from '@/config/database';
import { AppError } from '@/utils/errors';
import { eventWithRelationsInclude } from '@/utils/prismaIncludes';
import { successResponse } from '@/types/api';

export class CompanyService {
  async getBySymbol(symbol: string) {
    const company = await prisma.company.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: {
        score: true,
        news: {
          include: {
            event: {
              select: {
                id: true,
                eventType: true,
                impact: true,
                confidence: true,
                summary: true,
                expectedMove: true,
                holdingPeriod: true,
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
        events: {
          include: eventWithRelationsInclude,
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!company) {
      throw AppError.notFound(`Company not found: ${symbol}`);
    }

    return successResponse(company);
  }
}

export const companyService = new CompanyService();
