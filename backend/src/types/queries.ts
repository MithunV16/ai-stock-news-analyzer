import { z } from 'zod';
import { Impact } from '@prisma/client';

/** Shared pagination query params for list endpoints */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const newsQuerySchema = paginationQuerySchema.extend({
  symbol: z.string().trim().toUpperCase().optional(),
  source: z.string().trim().optional(),
});

export const eventsQuerySchema = paginationQuerySchema.extend({
  symbol: z.string().trim().toUpperCase().optional(),
  impact: z.nativeEnum(Impact).optional(),
});

export const dashboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type NewsQuery = z.infer<typeof newsQuerySchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
