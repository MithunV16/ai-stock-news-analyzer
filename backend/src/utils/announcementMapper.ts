import type {
  Announcement as PrismaAnnouncement,
  ProcessingStatus as PrismaProcessingStatus,
} from '@prisma/client';
import type { PersistedAnnouncement, ProcessingStatus } from '@/interfaces/Announcement';
import type { NewsSource } from '@/types/newsIngestion';

const PROCESSING_STATUS_MAP: Record<PrismaProcessingStatus, ProcessingStatus> = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
  skipped: 'skipped',
};

/** Maps a Prisma Announcement row to the domain PersistedAnnouncement contract */
export function mapPrismaToPersistedAnnouncement(
  record: PrismaAnnouncement,
): PersistedAnnouncement {
  return {
    id: record.id,
    source: record.source as NewsSource,
    symbol: record.symbol,
    companyName: record.companyName,
    headline: record.headline,
    description: record.description,
    publishedAt: record.publishedAt,
    url: record.url ?? undefined,
    fingerprint: record.fingerprint,
    rawData: record.rawData,
    createdAt: record.createdAt,
    eventType: record.eventType,
    impact: record.impact,
    confidence: record.confidence,
    score: record.score,
    processingStatus: PROCESSING_STATUS_MAP[record.processingStatus],
    aiVersion: record.aiVersion,
  };
}
