import { newsIngestionConfig } from '@/config/newsProviders';
import type { NewsProvider, ProviderFetchResult, ProviderRegistryRunResult } from '@/interfaces';
import { isIngestionError, isRetryableProviderError, ProviderFetchError } from '@/errors';
import { ingestionSchedulerLogger } from '@/logger';
import { computeBackoffMs, sleep } from '@/utils/backoff';
import { logger } from '@/utils/logger';

/**
 * Registry contract — enables DI and unit testing with mock providers.
 */
export interface IProviderRegistry {
  register(provider: NewsProvider): void;
  unregister(name: string): boolean;
  get(name: string): NewsProvider | undefined;
  getRegisteredNames(): string[];
  fetchAll(): Promise<ProviderRegistryRunResult>;
}

/**
 * Central registry for news providers.
 *
 * Design:
 * - Providers are registered at composition root (registerIngestionProviders) — never constructed here.
 * - Scheduler calls fetchAll() only — never talks to NSE/BSE directly.
 * - One provider failure does not block others.
 * - Transient failures retry with exponential backoff from config.
 */
export class ProviderRegistry implements IProviderRegistry {
  private readonly providers = new Map<string, NewsProvider>();

  register(provider: NewsProvider): void {
    if (this.providers.has(provider.name)) {
      logger.warn('Overwriting registered news provider', { provider: provider.name });
    }
    this.providers.set(provider.name, provider);
    logger.info('News provider registered', {
      provider: provider.name,
      source: provider.source,
    });
  }

  unregister(name: string): boolean {
    return this.providers.delete(name);
  }

  get(name: string): NewsProvider | undefined {
    return this.providers.get(name);
  }

  getRegisteredNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Fetches from all config-enabled providers sequentially.
   * Failures are isolated — remaining providers still run.
   */
  async fetchAll(): Promise<ProviderRegistryRunResult> {
    const cycleStarted = Date.now();
    const enabled = newsIngestionConfig.enabledProviders;
    const results: ProviderFetchResult[] = [];
    const failedProviders: string[] = [];

    for (const name of enabled) {
      const provider = this.providers.get(name);

      if (!provider) {
        logger.warn('Enabled provider not registered — skipping', {
          provider: name,
          registered: this.getRegisteredNames(),
        });
        failedProviders.push(name);
        continue;
      }

      try {
        const result = await this.fetchWithRetry(provider);
        results.push(result);
        ingestionSchedulerLogger.providerFetchCompleted(result);
      } catch (error) {
        failedProviders.push(name);
        ingestionSchedulerLogger.providerFetchFailed(provider.name, error, {
          requestUrl: error instanceof ProviderFetchError ? error.requestUrl : undefined,
          httpStatus: error instanceof ProviderFetchError ? error.httpStatus : undefined,
          code: isIngestionError(error) ? error.code : undefined,
        });
      }
    }

    const totalFetched = results.reduce((sum, r) => sum + r.announcements.length, 0);

    return {
      results,
      totalFetched,
      totalDurationMs: Date.now() - cycleStarted,
      failedProviders,
    };
  }

  private async fetchWithRetry(provider: NewsProvider): Promise<ProviderFetchResult> {
    const { maxRetries, retryBaseMs, retryMaxMs } = newsIngestionConfig.scheduler;
    let lastError: unknown;
    let retryCount = 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await provider.fetchAnnouncements();
        return { ...result, retryCount };
      } catch (error) {
        lastError = error;

        const canRetry = attempt < maxRetries && isRetryableProviderError(error);
        if (!canRetry) {
          throw error;
        }

        retryCount += 1;
        const delayMs = computeBackoffMs(attempt, retryBaseMs, retryMaxMs);
        ingestionSchedulerLogger.providerFetchRetryScheduled({
          provider: provider.name,
          attempt: attempt + 1,
          maxRetries,
          delayMs,
          error: isIngestionError(error) ? error.message : String(error),
        });
        await sleep(delayMs);
      }
    }

    throw lastError;
  }
}

/** Application singleton — providers registered via registerIngestionProviders() */
export const providerRegistry = new ProviderRegistry();
