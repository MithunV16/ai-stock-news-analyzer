import axios, { AxiosError, type AxiosInstance } from 'axios';
import { getBseAnnouncementsUrl, newsIngestionConfig } from '@/config/newsProviders';
import { ProviderFetchError } from '@/errors';
import type {
  BseAnnouncementRow,
  BseAnnouncementsApiResponse,
  BseHttpFetchResult,
} from '@/providers/bse/bse.api.types';
import { logger } from '@/utils/logger';

/**
 * HTTP client for BSE India API.
 * Matches the browser: GET /BseIndiaAPI/api/CorpAnn/w with no query parameters.
 */
export class BSEHttpClient {
  private readonly client: AxiosInstance;

  constructor() {
    const { http, headers } = newsIngestionConfig.bse;

    this.client = axios.create({
      timeout: http.timeoutMs,
      headers: { ...headers },
      validateStatus: (status) => status >= 200 && status < 600,
    });
  }

  async fetchAnnouncements(): Promise<BseHttpFetchResult> {
    const requestUrl = getBseAnnouncementsUrl();
    const started = Date.now();

    try {
      const response = await this.client.get<BseAnnouncementsApiResponse>(requestUrl);
      const httpStatus = response.status;

      if (httpStatus >= 400) {
        throw new ProviderFetchError(
          'bse',
          `BSE request failed with HTTP ${httpStatus}`,
          httpStatus,
          requestUrl,
        );
      }

      if (!Array.isArray(response.data)) {
        throw new ProviderFetchError(
          'bse',
          'BSE response is not a JSON array',
          httpStatus,
          requestUrl,
          { responseType: typeof response.data },
        );
      }

      const rows: BseAnnouncementRow[] = response.data;

      logger.debug('BSE HTTP fetch complete', {
        rowCount: rows.length,
        httpStatus,
      });

      return {
        rows,
        requestUrl,
        httpStatus,
        durationMs: Date.now() - started,
      };
    } catch (error) {
      if (error instanceof ProviderFetchError) {
        throw error;
      }
      if (error instanceof AxiosError) {
        throw new ProviderFetchError(
          'bse',
          error.message,
          error.response?.status,
          requestUrl,
          { code: error.code },
        );
      }
      throw error;
    }
  }
}

export const bseHttpClient = new BSEHttpClient();
