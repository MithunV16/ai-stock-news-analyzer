import { newsIngestionConfig } from '@/config/newsProviders';
import type { NewsProvider, ProviderFetchResult } from '@/interfaces';
import type { BseHttpFetchResult } from '@/providers/bse/bse.api.types';
import { BSEHttpClient, bseHttpClient } from '@/providers/bse/BSEHttpClient';
import { BSENormalizer, bseNormalizer } from '@/providers/bse/BSENormalizer';
import { logger } from '@/utils/logger';

/**
 * Fetches corporate announcements from BSE India.
 *
 * Endpoint: GET /BseIndiaAPI/api/CorpAnn/w (configurable)
 * Handles pagination until an empty page or maxPages cap.
 */
export class BSEProvider implements NewsProvider {
  readonly name = 'bse';
  readonly source = 'BSE';

  constructor(
    private readonly http: BSEHttpClient = bseHttpClient,
    private readonly normalizer: BSENormalizer = bseNormalizer,
  ) {}

  async fetchAnnouncements(): Promise<ProviderFetchResult> {
    const { dateRangeDays } = newsIngestionConfig.bse;
    const { strPrevDate, strToDate } = this.buildDateRange(dateRangeDays);

    logger.debug('BSE provider fetching announcements', { strPrevDate, strToDate });

    const response: BseHttpFetchResult = await this.http.fetchAnnouncements(
      strPrevDate,
      strToDate,
    );

    const announcements = this.normalizer.normalizeMany(response.rows);

    logger.info('BSE provider fetch complete', {
      httpStatus: response.httpStatus,
      rawItemCount: response.rows.length,
      normalizedCount: announcements.length,
      pagesFetched: response.pagesFetched,
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

  /** BSE expects YYYYMMDD date strings */
  private buildDateRange(daysBack: number): { strPrevDate: string; strToDate: string } {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - daysBack);

    return {
      strPrevDate: this.formatBseDate(from),
      strToDate: this.formatBseDate(to),
    };
  }

  private formatBseDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
}

export const bseProvider = new BSEProvider();
