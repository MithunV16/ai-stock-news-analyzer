import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { PersistenceError } from '@/errors';
import type { Announcement, PersistedAnnouncement } from '@/interfaces/Announcement';
import type { PersistenceResult } from '@/interfaces/IngestionResult';
import {
  DuplicateDetectionService,
  duplicateDetectionService,
} from '@/services/duplicateDetection.service';
import { mapPrismaToPersistedAnnouncement } from '@/utils/announcementMapper';
import { isUniqueConstraintViolation } from '@/utils/prismaErrors';
import { logger } from '@/utils/logger';

export interface PersistManyResult {
  stored: PersistedAnnouncement[];
  duplicates: number;
  errors: number;
}

/**
 * Persists normalized announcements from the ingestion engine.
 *
 * Responsibilities:
 * - Insert new rows into `announcements` (authoritative dedup via fingerprint unique index)
 * - Mark fingerprints seen in Redis after successful insert
 * - Map Prisma rows to PersistedAnnouncement domain objects
 *
 * Does NOT publish events — SchedulerService publishes after successful insert.
 * Does NOT broadcast Socket.io — deferred to Module 12.
 */export class AnnouncementService {
  constructor(private readonly dedup: DuplicateDetectionService = duplicateDetectionService) {}

  async findByFingerprint(fingerprint: string): Promise<PersistedAnnouncement | null> {
    const record = await prisma.announcement.findUnique({
      where: { fingerprint },
    });

    return record ? mapPrismaToPersistedAnnouncement(record) : null;
  }

  async existsByFingerprint(fingerprint: string): Promise<boolean> {
    const record = await prisma.announcement.findUnique({
      where: { fingerprint },
      select: { id: true },
    });
    return record !== null;
  }

  async persist(announcement: Announcement): Promise<PersistenceResult> {
    try {
      const record = await prisma.announcement.create({
        data: this.toCreateInput(announcement),
      });

      await this.dedup.markFingerprintSeen(announcement.fingerprint);

      return {
        stored: true,
        duplicate: false,
        announcement: mapPrismaToPersistedAnnouncement(record),
        fingerprint: announcement.fingerprint,
      };
    } catch (error) {
      if (isUniqueConstraintViolation(error, 'fingerprint')) {
        await this.dedup.markFingerprintSeen(announcement.fingerprint);
        return {
          stored: false,
          duplicate: true,
          fingerprint: announcement.fingerprint,
        };
      }

      throw new PersistenceError(
        'Failed to persist announcement',
        announcement.fingerprint,
        { error: error instanceof Error ? error.message : String(error) },
      );
    }
  }

  async persistMany(announcements: Announcement[]): Promise<PersistManyResult> {
    const stored: PersistedAnnouncement[] = [];
    let duplicates = 0;
    let errors = 0;

    for (const announcement of announcements) {
      try {
        const result = await this.persist(announcement);
        if (result.stored && result.announcement) {
          stored.push(result.announcement);
        } else if (result.duplicate) {
          duplicates += 1;
        }
      } catch (error) {
        errors += 1;
        logger.error('Announcement persistence failed', {
          fingerprint: announcement.fingerprint,
          symbol: announcement.symbol,
          source: announcement.source,
          error,
        });
      }
    }

    return { stored, duplicates, errors };
  }

  private toCreateInput(announcement: Announcement): Prisma.AnnouncementCreateInput {
    return {
      source: announcement.source,
      symbol: announcement.symbol,
      companyName: announcement.companyName,
      headline: announcement.headline,
      description: announcement.description,
      publishedAt: announcement.publishedAt,
      url: announcement.url ?? null,
      fingerprint: announcement.fingerprint,
      rawData: announcement.rawData as Prisma.InputJsonValue,
      createdAt: announcement.createdAt,
    };
  }
}

export const announcementService = new AnnouncementService();
