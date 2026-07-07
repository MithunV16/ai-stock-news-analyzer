import axios, { AxiosError, type AxiosInstance } from 'axios';
import { getBseAnnouncementsUrl, newsIngestionConfig } from '@/config/newsProviders';
import { ProviderFetchError } from '@/errors';
import type {
  BseAnnouncementRow,
  BseAnnouncementsApiResponse,
  BseHttpFetchResult,
  BseQueryParams,
} from '@/providers/bse/bse.api.types';
import { logger } from '@/utils/logger';

/**
 * HTTP client for BSE India API with pagination support.
 * All BSE HTTP logic is isolated here — BSEProvider does not use Axios directly.
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

  async fetchAnnouncements(
    strPrevDate: string,
    strToDate: string,
  ): Promise<BseHttpFetchResult> {
    const url = getBseAnnouncementsUrl();
    const started = Date.now();
    const rows: BseAnnouncementRow[] = [];
    let lastStatus = 0;
    let pagesFetched = 0;

    const baseParams: BseQueryParams = {
      Pageno: 1,
      strCat: '-1',
      strPrevDate,
      strScrip: '',
      strSearch: 'P',
      strToDate,
      strType: 'C',
    };

    const { maxPages } = newsIngestionConfig.bse;

    for (let page = 1; page <= maxPages; page++) {
      const params = { ...baseParams, Pageno: page };

      try {
        const response = await this.client.get<BseAnnouncementsApiResponse>(url, { params });
        lastStatus = response.status;
        pagesFetched += 1;

        if (response.status >= 400) {
          throw new ProviderFetchError(
            'bse',
            `BSE request failed with HTTP ${response.status}`,
            response.status,
            this.buildRequestUrl(url, params),
          );
        }

        const table = response.data?.Table ?? [];
        if (table.length === 0) {
          break;
        }

        rows.push(...table);
      } catch (error) {
        if (error instanceof ProviderFetchError) {
          throw error;
        }
        if (error instanceof AxiosError) {
          throw new ProviderFetchError(
            'bse',
            error.message,
            error.response?.status,
            this.buildRequestUrl(url, params),
            { code: error.code, page },
          );
        }
        throw error;
      }
    }

    const requestUrl = this.buildRequestUrl(url, { ...baseParams, Pageno: 1 });

    logger.debug('BSE HTTP fetch complete', {
      pagesFetched,
      rowCount: rows.length,
      httpStatus: lastStatus,
    });

    return {
      rows,
      requestUrl,
      httpStatus: lastStatus,
      durationMs: Date.now() - started,
      pagesFetched,
    };
  }

  private buildRequestUrl(url: string, params: BseQueryParams): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      search.set(key, String(value));
    }
    return `${url}?${search.toString()}`;
  }
}

export const bseHttpClient = new BSEHttpClient();
