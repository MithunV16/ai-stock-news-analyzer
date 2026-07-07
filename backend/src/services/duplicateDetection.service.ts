import { newsIngestionConfig } from '@/config/newsProviders';
import { prisma } from '@/config/database';
import {
  announcementFingerprintKey,
  checkRedisConnection,
  newsDedupKey,
  redis,
} from '@/config/redis';
import type { Announcement, AnnouncementDraft } from '@/interfaces/Announcement';
import type { FingerprintInput } from '@/interfaces/IngestionResult';
import { FingerprintError } from '@/errors';
import { generateSha256Fingerprint } from '@/utils/fingerprint';
import { logger } from '@/utils/logger';

/** Optional DB lookup — wired in Module 9 when the Announcement table exists */
export type FingerprintDbLookup = (fingerprint: string) => Promise<boolean>;

export interface FingerprintDedupResult {
  /** Announcements with fingerprints assigned, not seen in cache/DB */
  unique: Announcement[];
  /** Total duplicates skipped (in-batch + cache + DB) */
  duplicates: number;
}

const defaultDbLookup: FingerprintDbLookup = async () => false;

async function lookupFingerprintInDb(fingerprint: string): Promise<boolean> {
  const existing = await prisma.announcement.findUnique({
    where: { fingerprint },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Duplicate detection for both pipelines:
 *
 * Legacy collector (Step 9):
 *   URL-based — Redis cache + PostgreSQL `news.url` unique constraint
 *
 * News Ingestion Engine (Module 8+):
 *   SHA-256 fingerprint from source + symbol + headline + publishedAt
 *   Redis cache + DB lookup (authoritative unique constraint added in Module 9)
 */
export class DuplicateDetectionService {
  constructor(
    private readonly cacheTtlSeconds = newsIngestionConfig.duplicateDetection.cacheTtlSeconds,
    private readonly dbLookup: FingerprintDbLookup = defaultDbLookup,
  ) {}

  // ---------------------------------------------------------------------------
  // Legacy URL dedup (unchanged — used by newsCollector.service.ts)
  // ---------------------------------------------------------------------------

  async isDuplicate(url: string): Promise<boolean> {
    if (await this.isUrlSeenInRedis(url)) {
      return true;
    }

    const existing = await prisma.news.findUnique({
      where: { url },
      select: { id: true },
    });

    if (existing) {
      await this.markSeen(url);
      return true;
    }

    return false;
  }

  async markSeen(url: string): Promise<void> {
    const redisUp = await checkRedisConnection();
    if (!redisUp) return;

    try {
      await redis.set(newsDedupKey(url), '1', 'EX', this.cacheTtlSeconds);
    } catch (error) {
      logger.debug('Redis URL dedup cache write failed', { url, error });
    }
  }

  // ---------------------------------------------------------------------------
  // Ingestion engine — SHA-256 fingerprint dedup
  // ---------------------------------------------------------------------------

  generateFingerprint(input: FingerprintInput): string {
    try {
      return generateSha256Fingerprint(input);
    } catch (error) {
      throw new FingerprintError('Failed to generate announcement fingerprint', {
        input,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  buildAnnouncement(draft: AnnouncementDraft): Announcement {
    const fingerprint = this.generateFingerprint({
      source: draft.source,
      symbol: draft.symbol,
      headline: draft.headline,
      publishedAt: draft.publishedAt,
    });

    return {
      ...draft,
      fingerprint,
      createdAt: new Date(),
    };
  }

  async isDuplicateFingerprint(fingerprint: string): Promise<boolean> {
    if (await this.isFingerprintSeenInRedis(fingerprint)) {
      return true;
    }

    if (await this.dbLookup(fingerprint)) {
      await this.markFingerprintSeen(fingerprint);
      return true;
    }

    return false;
  }

  async markFingerprintSeen(fingerprint: string): Promise<void> {
    const redisUp = await checkRedisConnection();
    if (!redisUp) return;

    try {
      await redis.set(
        announcementFingerprintKey(fingerprint),
        '1',
        'EX',
        this.cacheTtlSeconds,
      );
    } catch (error) {
      logger.debug('Redis fingerprint cache write failed', { fingerprint, error });
    }
  }

  /**
   * Assigns fingerprints, removes in-batch duplicates, then filters against
   * Redis + optional DB lookup. Does NOT persist — persistence marks seen after insert.
   */
  async filterUniqueDrafts(drafts: AnnouncementDraft[]): Promise<FingerprintDedupResult> {
    const unique: Announcement[] = [];
    const seenInBatch = new Set<string>();
    let duplicates = 0;

    for (const draft of drafts) {
      const announcement = this.buildAnnouncement(draft);

      if (seenInBatch.has(announcement.fingerprint)) {
        duplicates += 1;
        continue;
      }
      seenInBatch.add(announcement.fingerprint);

      if (await this.isDuplicateFingerprint(announcement.fingerprint)) {
        duplicates += 1;
        continue;
      }

      unique.push(announcement);
    }

    return { unique, duplicates };
  }

  private async isUrlSeenInRedis(url: string): Promise<boolean> {
    const redisUp = await checkRedisConnection();
    if (!redisUp) return false;

    try {
      const hit = await redis.exists(newsDedupKey(url));
      return hit === 1;
    } catch {
      return false;
    }
  }

  private async isFingerprintSeenInRedis(fingerprint: string): Promise<boolean> {
    const redisUp = await checkRedisConnection();
    if (!redisUp) return false;

    try {
      const hit = await redis.exists(announcementFingerprintKey(fingerprint));
      return hit === 1;
    } catch {
      return false;
    }
  }
}

export const duplicateDetectionService = new DuplicateDetectionService(
  newsIngestionConfig.duplicateDetection.cacheTtlSeconds,
  lookupFingerprintInDb,
);
