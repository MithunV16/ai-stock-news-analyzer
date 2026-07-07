import type { AnnouncementDraft } from '@/interfaces/Announcement';
import { NormalizationError } from '@/errors';
import type { NseAnnouncementRow } from '@/providers/nse/nse.api.types';
import { announcementNormalizer } from '@/services/announcementNormalizer.service';
import { parseAnnouncementDate } from '@/utils/announcementDates';

const PROVIDER = 'nse';
const SOURCE = 'NSE' as const;

/**
 * NSE-specific field extraction — delegates common normalization to AnnouncementNormalizerService.
 */
export class NSENormalizer {
  normalize(row: NseAnnouncementRow): AnnouncementDraft | null {
    return announcementNormalizer.safeMap(PROVIDER, row, (r) => this.mapRow(r));
  }

  normalizeOrThrow(row: NseAnnouncementRow): AnnouncementDraft {
    const draft = this.normalize(row);
    if (!draft) {
      throw new NormalizationError(PROVIDER, 'Unable to normalize NSE announcement row', row);
    }
    return draft;
  }

  normalizeMany(rows: NseAnnouncementRow[]): AnnouncementDraft[] {
    return announcementNormalizer.safeMapMany(PROVIDER, rows, (r) => this.mapRow(r));
  }

  private mapRow(row: NseAnnouncementRow): AnnouncementDraft | null {
    const symbol = (row.symbol ?? row.sm_symbol ?? '').trim();
    const headline = (row.desc ?? row.headline ?? row.subject ?? '').trim();
    const companyName = (row.sm_name ?? symbol).trim();
    const publishedAt = parseAnnouncementDate(row.an_dt ?? row.dt ?? row.sort_date, 'nse-dmy');

    return announcementNormalizer.createDraft({
      source: SOURCE,
      symbol,
      companyName,
      headline,
      descriptionParts: [row.attchmntText, row.desc, headline],
      publishedAt,
      url: this.resolveUrl(row, symbol, headline, publishedAt),
      rawData: row,
    });
  }

  private resolveUrl(
    row: NseAnnouncementRow,
    symbol: string,
    headline: string,
    publishedAt: Date,
  ): string | undefined {
    const attachment = row.attchmntFile?.trim();
    if (attachment?.startsWith('http')) {
      return attachment;
    }

    if (row.seq_id) {
      return `https://www.nseindia.com/companies-listing/corporate-filings-announcements?symbol=${symbol}&seq=${row.seq_id}`;
    }

    return `https://www.nseindia.com/announcement/${symbol}/${encodeURIComponent(headline)}-${publishedAt.getTime()}`;
  }
}

export const nseNormalizer = new NSENormalizer();
