import { getNseAnnouncementsUrl, newsIngestionConfig } from '@/config/newsProviders';
import type { NewsProvider, ProviderFetchResult } from '@/interfaces';
import type { INSESessionManager } from '@/providers/nse/types';
import type { NseAnnouncementsApiResponse } from '@/providers/nse/nse.api.types';
import { NSENormalizer, nseNormalizer } from '@/providers/nse/NSENormalizer';
import { nseSessionManager } from '@/providers/nse/NSESessionManager';
import { logger } from '@/utils/logger';

/**
 * Fetches corporate announcements from NSE India.
 *
 * Responsibilities:
 * - Build request URL + date params from config
 * - Delegate HTTP + cookies to NSESessionManager
 * - Normalize rows via NSENormalizer
 * - Return ProviderFetchResult for ProviderRegistry
 *
 * Does NOT: deduplicate, persist, broadcast, or classify (downstream modules).
 */
export class NSEProvider implements NewsProvider {
  readonly name = 'nse';
  readonly source = 'NSE';

  constructor(
    private readonly session: INSESessionManager = nseSessionManager,
    private readonly normalizer: NSENormalizer = nseNormalizer,
  ) {}

  async fetchAnnouncements(): Promise<ProviderFetchResult> {
    const { index, dateRangeDays } = newsIngestionConfig.nse;
    const { fromDate, toDate } = this.buildDateRange(dateRangeDays);
    const url = getNseAnnouncementsUrl();

    const params = {
      index,
      from_date: fromDate,
      to_date: toDate,
    };

    logger.debug('NSE provider fetching announcements', { url, params });

    const response = await this.session.get<NseAnnouncementsApiResponse>(url, { params });

    const rows = Array.isArray(response.data?.data) ? response.data.data : [];
    const announcements = this.normalizer.normalizeMany(rows);

    logger.info('NSE provider fetch complete', {
      httpStatus: response.status,
      rawItemCount: rows.length,
      normalizedCount: announcements.length,
      durationMs: response.durationMs,
      sessionRefreshed: response.sessionRefreshed,
    });

    return {
      provider: this.name,
      source: this.source,
      announcements,
      requestUrl: response.requestUrl,
      httpStatus: response.status,
      durationMs: response.durationMs,
      fetchedAt: new Date(),
      rawItemCount: rows.length,
      retryCount: 0,
    };
  }

  private buildDateRange(daysBack: number): { fromDate: string; toDate: string } {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - daysBack);

    const format = (d: Date): string =>
      `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

    return { fromDate: format(from), toDate: format(to) };
  }
}

export const nseProvider = new NSEProvider();
