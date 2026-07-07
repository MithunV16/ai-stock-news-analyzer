import type { PersistedAnnouncement } from '@/interfaces/Announcement';
import type { ProcessingStatus } from '@/interfaces/Announcement';

/** JSON-serializable announcement payload broadcast over Socket.io */
export type AnnouncementBroadcastPayload = {
  id: string;
  source: 'NSE' | 'BSE';
  symbol: string;
  companyName: string;
  headline: string;
  description: string;
  publishedAt: string;
  url?: string;
  fingerprint: string;
  createdAt: string;
  eventType: string | null;
  impact: string | null;
  confidence: number | null;
  score: number | null;
  processingStatus: ProcessingStatus;
  aiVersion: string | null;
};

export function toAnnouncementBroadcastPayload(
  announcement: PersistedAnnouncement,
): AnnouncementBroadcastPayload {
  return {
    id: announcement.id,
    source: announcement.source,
    symbol: announcement.symbol,
    companyName: announcement.companyName,
    headline: announcement.headline,
    description: announcement.description,
    publishedAt: announcement.publishedAt.toISOString(),
    url: announcement.url,
    fingerprint: announcement.fingerprint,
    createdAt: announcement.createdAt.toISOString(),
    eventType: announcement.eventType,
    impact: announcement.impact,
    confidence: announcement.confidence,
    score: announcement.score,
    processingStatus: announcement.processingStatus,
    aiVersion: announcement.aiVersion,
  };
}
