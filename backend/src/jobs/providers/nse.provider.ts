import { logger } from '@/utils/logger';
import type { NewsProvider, RawAnnouncement } from '@/jobs/providers/types';

/** NSE corporate announcements API response (partial) */
interface NseAnnouncementRow {
  symbol?: string;
  sm_symbol?: string;
  desc?: string;
  headline?: string;
  subject?: string;
  dt?: string;
  an_dt?: string;
  attchmntFile?: string;
  sm_name?: string;
}

interface NseApiResponse {
  data?: NseAnnouncementRow[];
}

/**
 * Fetches latest corporate announcements from NSE India.
 *
 * NSE requires browser-like headers. Failures are logged and return []
 * so other providers / the scheduler can continue.
 */
export class NseNewsProvider implements NewsProvider {
  readonly name = 'nse';

  async fetchLatest(): Promise<RawAnnouncement[]> {
    try {
      const { fromDate, toDate } = this.getDateRange();
      const url =
        `https://www.nseindia.com/api/corporate-announcements` +
        `?index=equities&from_date=${fromDate}&to_date=${toDate}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        logger.warn('NSE provider HTTP error', { status: response.status });
        return [];
      }

      const json = (await response.json()) as NseApiResponse;
      const rows = json.data ?? [];

      return rows
        .map((row) => this.mapRow(row))
        .filter((item): item is RawAnnouncement => item !== null);
    } catch (error) {
      logger.warn('NSE provider fetch failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  private mapRow(row: NseAnnouncementRow): RawAnnouncement | null {
    const symbol = (row.symbol ?? row.sm_symbol ?? '').trim().toUpperCase();
    const headline = (row.desc ?? row.headline ?? row.subject ?? '').trim();

    if (!symbol || !headline) {
      return null;
    }

    const publishedAt = this.parseDate(row.dt ?? row.an_dt);
    const attachment = row.attchmntFile?.trim();
    const url =
      attachment && attachment.startsWith('http')
        ? attachment
        : `https://www.nseindia.com/announcement/${symbol}/${encodeURIComponent(headline)}-${publishedAt.getTime()}`;

    return {
      symbol,
      headline,
      source: this.name,
      url,
      publishedAt,
      rawContent: JSON.stringify(row),
    };
  }

  private parseDate(value?: string): Date {
    if (!value) return new Date();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private getDateRange(): { fromDate: string; toDate: string } {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 1);

    const format = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

    return { fromDate: format(from), toDate: format(to) };
  }
}

export const nseNewsProvider = new NseNewsProvider();
