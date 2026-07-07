import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DuplicateDetectionService } from '@/services/duplicateDetection.service';
import { createDraft } from '../fixtures/announcements';

vi.mock('@/config/redis', () => ({
  checkRedisConnection: vi.fn().mockResolvedValue(true),
  announcementFingerprintKey: (fingerprint: string) => `fp:${fingerprint}`,
  newsDedupKey: (url: string) => `url:${url}`,
  redis: {
    exists: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.mock('@/config/database', () => ({
  prisma: {
    news: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    announcement: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { redis } from '@/config/redis';

describe('DuplicateDetectionService', () => {
  beforeEach(() => {
    vi.mocked(redis.exists).mockReset().mockResolvedValue(0);
  });

  it('assigns a fingerprint when building an announcement', () => {
    const service = new DuplicateDetectionService(60, async () => false);
    const draft = createDraft();

    const announcement = service.buildAnnouncement(draft);

    expect(announcement.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(announcement.createdAt).toBeInstanceOf(Date);
  });

  it('filters duplicates within the same batch', async () => {
    const service = new DuplicateDetectionService(60, async () => false);
    const draft = createDraft();

    const result = await service.filterUniqueDrafts([draft, draft, draft]);

    expect(result.unique).toHaveLength(1);
    expect(result.duplicates).toBe(2);
  });

  it('skips fingerprints already seen in Redis', async () => {
    const service = new DuplicateDetectionService(60, async () => false);
    vi.mocked(redis.exists).mockResolvedValue(1);

    const result = await service.filterUniqueDrafts([createDraft()]);

    expect(result.unique).toHaveLength(0);
    expect(result.duplicates).toBe(1);
  });

  it('skips fingerprints found by DB lookup', async () => {
    const dbLookup = vi.fn().mockResolvedValue(true);
    const service = new DuplicateDetectionService(60, dbLookup);

    const duplicate = await service.isDuplicateFingerprint('known-fingerprint');

    expect(duplicate).toBe(true);
    expect(dbLookup).toHaveBeenCalledWith('known-fingerprint');
  });
});
