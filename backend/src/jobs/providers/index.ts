import { config } from '@/config/env';
import { mockNewsProvider } from '@/jobs/providers/mock.provider';
import { nseNewsProvider } from '@/jobs/providers/nse.provider';
import { newsProviderRegistry } from '@/jobs/providers/registry';

const availableProviders = [nseNewsProvider, mockNewsProvider];

/**
 * Registers news providers based on environment configuration.
 * NEWS_PROVIDERS=nse,mock (comma-separated) overrides defaults.
 */
export function registerNewsProviders(): void {
  newsProviderRegistry.clear();

  const configured = config.NEWS_PROVIDERS?.split(',').map((p) => p.trim()).filter(Boolean);

  let toRegister = availableProviders;

  if (configured && configured.length > 0) {
    toRegister = availableProviders.filter((p) => configured.includes(p.name));
  } else {
    toRegister = availableProviders.filter(
      (p) => p.name !== 'mock' || config.ENABLE_MOCK_NEWS,
    );
  }

  for (const provider of toRegister) {
    newsProviderRegistry.register(provider);
  }
}

export { newsProviderRegistry } from '@/jobs/providers/registry';
export type { NewsProvider, RawAnnouncement } from '@/jobs/providers/types';
