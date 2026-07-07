import { randomUUID } from 'node:crypto';
import {
  ANNOUNCEMENT_STORED,
  createAnnouncementStoredEvent,
  eventBus,
  type IEventBus,
} from '@/events';
import type { PersistedAnnouncement } from '@/interfaces/Announcement';
import type {
  IngestionCycleRunResult,
  ProviderCycleStats,
} from '@/interfaces/IngestionResult';
import type { ProviderFetchResult } from '@/interfaces/NewsProvider';
import {
  IngestionSchedulerLogger,
  ingestionSchedulerLogger,
} from '@/logger';
import type { IProviderRegistry } from '@/providers/ProviderRegistry';
import { providerRegistry } from '@/providers/ProviderRegistry';
import {
  AnnouncementService,
  announcementService,
} from '@/services/announcement.service';
import {
  DuplicateDetectionService,
  duplicateDetectionService,
} from '@/services/duplicateDetection.service';

/**
 * Orchestrates one ingestion poll cycle:
 *
 * ProviderRegistry → deduplicate → persist → event bus → structured logging
 *
 * Provider failures are isolated — the scheduler never stops.
 */
export class SchedulerService {
  private running = false;

  constructor(
    private readonly registry: IProviderRegistry = providerRegistry,
    private readonly dedup: DuplicateDetectionService = duplicateDetectionService,
    private readonly announcements: AnnouncementService = announcementService,
    private readonly bus: IEventBus = eventBus,
    private readonly schedulerLog: IngestionSchedulerLogger = ingestionSchedulerLogger,
  ) {}

  async runCycle(): Promise<IngestionCycleRunResult | null> {
    if (this.running) {
      this.schedulerLog.cycleSkipped('Ingestion scheduler already running — skipping overlapping tick');
      return null;
    }

    this.running = true;
    const cycleId = randomUUID();
    const startedAt = new Date();
    const storedAnnouncements: PersistedAnnouncement[] = [];

    this.schedulerLog.cycleStarted(cycleId, this.registry.getRegisteredNames());

    try {
      const fetchRun = await this.registry.fetchAll();
      const providerStats: ProviderCycleStats[] = [];

      for (const fetchResult of fetchRun.results) {
        const stats = await this.processProviderResult(cycleId, fetchResult, storedAnnouncements);
        providerStats.push(stats);
      }

      for (const failedProvider of fetchRun.failedProviders) {
        const alreadyLogged = providerStats.some((s) => s.provider === failedProvider);
        if (!alreadyLogged) {
          providerStats.push(this.buildFailedProviderStats(failedProvider));
        }
      }

      const completedAt = new Date();
      const result: IngestionCycleRunResult = {
        cycleId,
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        providers: providerStats,
        totals: this.buildTotals(providerStats),
        storedAnnouncements,
      };

      this.schedulerLog.cycleCompleted(result);
      return result;
    } catch (error) {
      this.schedulerLog.cycleFailedUnexpected(cycleId, error);

      const completedAt = new Date();
      return {
        cycleId,
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        providers: [],
        totals: { fetched: 0, stored: 0, duplicates: 0, skipped: 0, errors: 1 },
        storedAnnouncements,
      };
    } finally {
      this.running = false;
    }
  }

  private async processProviderResult(
    cycleId: string,
    fetchResult: ProviderFetchResult,
    storedAnnouncements: PersistedAnnouncement[],
  ): Promise<ProviderCycleStats> {
    try {
      const { unique, duplicates: prePersistDuplicates } =
        await this.dedup.filterUniqueDrafts(fetchResult.announcements);

      const persistResult = await this.announcements.persistMany(unique);
      storedAnnouncements.push(...persistResult.stored);
      this.publishStoredAnnouncements(persistResult.stored);

      const stats: ProviderCycleStats = {
        provider: fetchResult.provider,
        fetched: fetchResult.announcements.length,
        stored: persistResult.stored.length,
        duplicates: prePersistDuplicates + persistResult.duplicates,
        errors: persistResult.errors,
        durationMs: fetchResult.durationMs,
        httpStatus: fetchResult.httpStatus,
        requestUrl: fetchResult.requestUrl,
        retryCount: fetchResult.retryCount,
      };

      this.schedulerLog.providerCompleted(cycleId, stats);
      return stats;
    } catch (error) {
      this.schedulerLog.providerPipelineFailed(
        fetchResult.provider,
        fetchResult.requestUrl,
        error,
      );

      return {
        provider: fetchResult.provider,
        fetched: fetchResult.announcements.length,
        stored: 0,
        duplicates: 0,
        errors: 1,
        durationMs: fetchResult.durationMs,
        httpStatus: fetchResult.httpStatus,
        requestUrl: fetchResult.requestUrl,
        retryCount: fetchResult.retryCount,
      };
    }
  }

  private publishStoredAnnouncements(announcements: PersistedAnnouncement[]): void {
    for (const announcement of announcements) {
      this.bus.publish(
        ANNOUNCEMENT_STORED,
        createAnnouncementStoredEvent(announcement),
      );
    }
  }

  private buildFailedProviderStats(provider: string): ProviderCycleStats {
    return {
      provider,
      fetched: 0,
      stored: 0,
      duplicates: 0,
      errors: 1,
      durationMs: 0,
      requestUrl: '',
      retryCount: 0,
    };
  }

  private buildTotals(providers: ProviderCycleStats[]) {
    return providers.reduce(
      (acc, stats) => ({
        fetched: acc.fetched + stats.fetched,
        stored: acc.stored + stats.stored,
        duplicates: acc.duplicates + stats.duplicates,
        skipped: acc.skipped,
        errors: acc.errors + stats.errors,
      }),
      { fetched: 0, stored: 0, duplicates: 0, skipped: 0, errors: 0 },
    );
  }
}

export const schedulerService = new SchedulerService();
