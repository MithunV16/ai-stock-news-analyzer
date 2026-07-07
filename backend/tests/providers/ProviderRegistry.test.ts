import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderFetchError } from '@/errors';
import { ProviderRegistry } from '@/providers/ProviderRegistry';
import type { NewsProvider, ProviderFetchResult } from '@/interfaces';
import { createDraft } from '../fixtures/announcements';

vi.mock('@/config/newsProviders', () => ({
  newsIngestionConfig: {
    enabledProviders: ['good', 'bad'],
    scheduler: {
      maxRetries: 1,
      retryBaseMs: 1,
      retryMaxMs: 5,
    },
    logging: {
      logProviderTiming: false,
    },
  },
}));

vi.mock('@/logger', () => ({
  ingestionSchedulerLogger: {
    providerFetchCompleted: vi.fn(),
    providerFetchFailed: vi.fn(),
    providerFetchRetryScheduled: vi.fn(),
  },
}));

function buildFetchResult(provider: string, source: 'NSE' | 'BSE'): ProviderFetchResult {
  return {
    provider,
    source,
    announcements: [createDraft({ source })],
    requestUrl: `https://example.com/${provider}`,
    httpStatus: 200,
    durationMs: 10,
    fetchedAt: new Date(),
    rawItemCount: 1,
    retryCount: 0,
  };
}

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  it('fetches from all enabled providers and isolates failures', async () => {
    const good: NewsProvider = {
      name: 'good',
      source: 'NSE',
      fetchAnnouncements: vi.fn().mockResolvedValue(buildFetchResult('good', 'NSE')),
    };
    const bad: NewsProvider = {
      name: 'bad',
      source: 'BSE',
      fetchAnnouncements: vi
        .fn()
        .mockRejectedValue(new ProviderFetchError('bad', 'HTTP 503', 503, 'https://bse.test')),
    };

    registry.register(good);
    registry.register(bad);

    const result = await registry.fetchAll();

    expect(result.results).toHaveLength(1);
    expect(result.failedProviders).toEqual(['bad']);
    expect(result.totalFetched).toBe(1);
  });

  it('retries retryable provider errors before failing', async () => {
    const flaky: NewsProvider = {
      name: 'good',
      source: 'NSE',
      fetchAnnouncements: vi
        .fn()
        .mockRejectedValueOnce(new ProviderFetchError('good', 'HTTP 503', 503, 'https://nse.test'))
        .mockResolvedValueOnce(buildFetchResult('good', 'NSE')),
    };
    const idle: NewsProvider = {
      name: 'bad',
      source: 'BSE',
      fetchAnnouncements: vi.fn().mockResolvedValue({
        ...buildFetchResult('bad', 'BSE'),
        announcements: [],
        rawItemCount: 0,
      }),
    };

    registry.register(flaky);
    registry.register(idle);

    const result = await registry.fetchAll();

    expect(flaky.fetchAnnouncements).toHaveBeenCalledTimes(2);
    expect(result.results[0]?.retryCount).toBe(1);
    expect(result.failedProviders).toHaveLength(0);
  });
});
