import type { NewsProvider, ProviderFetchResult } from '@/interfaces';
import type { BseHttpFetchResult } from '@/providers/bse/bse.api.types';
import { BSEHttpClient, bseHttpClient } from '@/providers/bse/BSEHttpClient';
import { BSENormalizer, bseNormalizer } from '@/providers/bse/BSENormalizer';
import { logger } from '@/utils/logger';

/**
 * Fetches corporate announcements from BSE India.
 *
 * Endpoint: GET /BseIndiaAPI/api/CorpAnn/w (no query parameters)
 */
export class BSEProvider implements NewsProvider {
  readonly name = 'bse';
  readonly source = 'BSE';

  constructor(
    private readonly http: BSEHttpClient = bseHttpClient,
    private readonly normalizer: BSENormalizer = bseNormalizer,
  ) {}

  async fetchAnnouncements(): Promise<ProviderFetchResult> {
    logger.debug('BSE provider fetching announcements');

    const response: BseHttpFetchResult = await this.http.fetchAnnouncements();
    const announcements = this.normalizer.normalizeMany(response.rows);

    logger.info('BSE provider fetch complete', {
      httpStatus: response.httpStatus,
      rawItemCount: response.rows.length,
      normalizedCount: announcements.length,
      durationMs: response.durationMs,
    });

    return {
      provider: this.name,
      source: this.source,
      announcements,
      requestUrl: response.requestUrl,
      httpStatus: response.httpStatus,
      durationMs: response.durationMs,
      fetchedAt: new Date(),
      rawItemCount: response.rows.length,
      retryCount: 0,
    };
  }
}

export const bseProvider = new BSEProvider();
