import type { AnnouncementDraft } from '@/interfaces/Announcement';
import { NormalizationError } from '@/errors';
import type { BseAnnouncementRow } from '@/providers/bse/bse.api.types';
import { announcementNormalizer } from '@/services/announcementNormalizer.service';
import { parseAnnouncementDate } from '@/utils/announcementDates';

const PROVIDER = 'bse';
const SOURCE = 'BSE' as const;

/**
 * BSE-specific field extraction — delegates common normalization to AnnouncementNormalizerService.
 */
export class BSENormalizer {
  normalize(row: BseAnnouncementRow): AnnouncementDraft | null {
    return announcementNormalizer.safeMap(PROVIDER, row, (r) => this.mapRow(r));
  }

  normalizeOrThrow(row: BseAnnouncementRow): AnnouncementDraft {
    const draft = this.normalize(row);
    if (!draft) {
      throw new NormalizationError(PROVIDER, 'Unable to normalize BSE announcement row', row);
    }
    return draft;
  }

  normalizeMany(rows: BseAnnouncementRow[]): AnnouncementDraft[] {
    return announcementNormalizer.safeMapMany(PROVIDER, rows, (r) => this.mapRow(r));
  }

  private mapRow(row: BseAnnouncementRow): AnnouncementDraft | null {
    const symbol = this.resolveSymbol(row);
    const headline = (row.Subject ?? row.NEWSSUB ?? row.HEADLINE ?? '').trim();
    const companyName = (row.SLONGNAME ?? row.LONGNAME ?? symbol).trim();
    const publishedAt = parseAnnouncementDate(row.DissemDT ?? row.NEWS_DT, 'bse-iso');

    return announcementNormalizer.createDraft({
      source: SOURCE,
      symbol,
      companyName,
      headline,
      descriptionParts: [row.MORE, row.CATEGORYNAME, headline],
      publishedAt,
      url: this.resolveUrl(row),
      rawData: row,
    });
  }

  private resolveSymbol(row: BseAnnouncementRow): string {
    const raw = row.SCRIP_CD ?? row.scrip_cd;
    if (raw === undefined || raw === null) return '';
    return String(raw).trim();
  }

  private resolveUrl(row: BseAnnouncementRow): string | undefined {
    const candidates = [row.NSURL, row.URL, row.ATTACHMENTNAME].filter(
      (v): v is string => typeof v === 'string' && v.trim().startsWith('http'),
    );
    if (candidates.length > 0) {
      return candidates[0].trim();
    }

    if (row.Newsid ?? row.NEWSID) {
      const newsId = String(row.Newsid ?? row.NEWSID);
      return `https://www.bseindia.com/stock-share-price/announcements/${newsId}`;
    }

    return undefined;
  }
}

export const bseNormalizer = new BSENormalizer();
