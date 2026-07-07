import { newsIngestionConfig } from '@/config/newsProviders';
import { bseProvider } from '@/providers/bse';
import { nseProvider } from '@/providers/nse';
import type { IProviderRegistry } from '@/providers/ProviderRegistry';
import { logger } from '@/utils/logger';
/**
 * Composition root for ingestion providers.
 *
 * Providers are registered here — NOT inside ProviderRegistry or the scheduler.
 */
export function registerIngestionProviders(registry: IProviderRegistry): void {
  if (!newsIngestionConfig.scheduler.enabled) {
    logger.info('News ingestion engine disabled — skipping provider registration');
    return;
  }

  if (newsIngestionConfig.nse.enabled) {
    registry.register(nseProvider);
  }

  if (newsIngestionConfig.bse.enabled) {
    registry.register(bseProvider);
  }

  const enabled = newsIngestionConfig.enabledProviders;
  const registered = registry.getRegisteredNames();

  logger.info('Ingestion provider registration complete', {
    enabled,
    registered,
    pending: enabled.filter((name) => !registered.includes(name)),
  });
}
