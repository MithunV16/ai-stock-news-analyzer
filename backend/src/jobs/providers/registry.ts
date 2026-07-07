import type { NewsProvider } from '@/jobs/providers/types';

/**
 * Registry of active news providers.
 * New sources (BSE, Moneycontrol, etc.) register here without changing the collector.
 */
class NewsProviderRegistry {
  private providers = new Map<string, NewsProvider>();

  register(provider: NewsProvider): void {
    this.providers.set(provider.name, provider);
  }

  clear(): void {
    this.providers.clear();
  }

  getAll(): NewsProvider[] {
    return Array.from(this.providers.values());
  }

  get(name: string): NewsProvider | undefined {
    return this.providers.get(name);
  }
}

export const newsProviderRegistry = new NewsProviderRegistry();
