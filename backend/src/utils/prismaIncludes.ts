import { Prisma } from '@prisma/client';

/** Reusable Prisma include for event + company + news (dashboard cards) */
export const eventWithRelationsInclude = {
  company: {
    select: {
      id: true,
      symbol: true,
      companyName: true,
      sector: true,
    },
  },
  news: {
    select: {
      id: true,
      headline: true,
      source: true,
      url: true,
      publishedAt: true,
    },
  },
} satisfies Prisma.EventInclude;

export type EventWithRelationsRecord = Prisma.EventGetPayload<{
  include: typeof eventWithRelationsInclude;
}>;

/** Reusable include for news list items */
export const newsWithCompanyInclude = {
  company: {
    select: {
      id: true,
      symbol: true,
      companyName: true,
      sector: true,
    },
  },
  event: {
    select: {
      id: true,
      eventType: true,
      impact: true,
      confidence: true,
    },
  },
} satisfies Prisma.NewsInclude;

export type NewsWithCompanyRecord = Prisma.NewsGetPayload<{
  include: typeof newsWithCompanyInclude;
}>;
