/**
 * Domain types derived from Prisma models.
 * Re-export enums and model types for use across services without importing
 * @prisma/client directly in every file.
 */
export {
  Impact,
  type Company,
  type News,
  type Event,
  type Score,
  type Prisma,
} from '@prisma/client';

/** Event with related company and source news — used by dashboard API */
export type EventWithRelations = {
  id: string;
  newsId: string;
  companyId: string;
  eventType: string;
  impact: import('@prisma/client').Impact;
  confidence: number;
  summary: string;
  expectedMove: string;
  holdingPeriod: string;
  reason: string;
  createdAt: Date;
  company: {
    id: string;
    symbol: string;
    companyName: string;
    sector: string | null;
  };
  news: {
    id: string;
    headline: string;
    source: string;
    url: string;
    publishedAt: Date;
  };
};

/** Payload broadcast over Socket.io when a new event is classified */
export type EventBroadcastPayload = EventWithRelations;

/** Normalized corporate announcement — broadcast when ingestion engine stores a new row */
export type {
  AnnouncementBroadcastPayload,
} from '@/utils/announcementBroadcast';
export { toAnnouncementBroadcastPayload } from '@/utils/announcementBroadcast';
