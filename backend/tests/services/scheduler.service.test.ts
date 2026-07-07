import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchedulerService } from '@/services/scheduler.service';
import type { IProviderRegistry } from '@/providers/ProviderRegistry';
import type { DuplicateDetectionService } from '@/services/duplicateDetection.service';
import type { AnnouncementService } from '@/services/announcement.service';
import type { IEventBus } from '@/events';
import type { IngestionSchedulerLogger } from '@/logger';
import { createDraft, createPersisted } from '../fixtures/announcements';

describe('SchedulerService', () => {
  const registry = {
    getRegisteredNames: vi.fn().mockReturnValue(['nse']),
    fetchAll: vi.fn(),
  } satisfies Partial<IProviderRegistry>;

  const dedup = {
    filterUniqueDrafts: vi.fn(),
  } satisfies Partial<DuplicateDetectionService>;

  const announcements = {
    persistMany: vi.fn(),
  } satisfies Partial<AnnouncementService>;

  const bus = {
    publish: vi.fn(),
  } satisfies Partial<IEventBus>;

  const schedulerLog = {
    cycleStarted: vi.fn(),
    cycleSkipped: vi.fn(),
    cycleCompleted: vi.fn(),
    cycleFailedUnexpected: vi.fn(),
    providerCompleted: vi.fn(),
    providerPipelineFailed: vi.fn(),
  } satisfies Partial<IngestionSchedulerLogger>;

  let service: SchedulerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SchedulerService(
      registry as IProviderRegistry,
      dedup as DuplicateDetectionService,
      announcements as AnnouncementService,
      bus as IEventBus,
      schedulerLog as IngestionSchedulerLogger,
    );
  });

  it('runs fetch → dedup → persist → event publish pipeline', async () => {
    const draft = createDraft();
    const persisted = createPersisted();

    registry.fetchAll.mockResolvedValue({
      results: [
        {
          provider: 'nse',
          source: 'NSE',
          announcements: [draft],
          requestUrl: 'https://nse.test',
          httpStatus: 200,
          durationMs: 100,
          fetchedAt: new Date(),
          rawItemCount: 1,
          retryCount: 0,
        },
      ],
      totalFetched: 1,
      totalDurationMs: 100,
      failedProviders: [],
    });

    dedup.filterUniqueDrafts.mockResolvedValue({
      unique: [{ ...draft, fingerprint: 'fp1', createdAt: new Date() }],
      duplicates: 0,
    });

    announcements.persistMany.mockResolvedValue({
      stored: [persisted],
      duplicates: 0,
      errors: 0,
    });

    const result = await service.runCycle();

    expect(result?.totals.stored).toBe(1);
    expect(result?.storedAnnouncements).toHaveLength(1);
    expect(bus.publish).toHaveBeenCalledOnce();
    expect(schedulerLog.cycleCompleted).toHaveBeenCalledOnce();
  });

  it('skips overlapping cycles', async () => {
    registry.fetchAll.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                results: [],
                totalFetched: 0,
                totalDurationMs: 0,
                failedProviders: [],
              }),
            50,
          );
        }),
    );

    const first = service.runCycle();
    const second = await service.runCycle();

    expect(second).toBeNull();
    expect(schedulerLog.cycleSkipped).toHaveBeenCalledOnce();
    await first;
  });
});
