import type { AnnouncementDraft } from '@/interfaces/Announcement';
import type { NewsSource } from '@/types/newsIngestion';

/** Input to the shared normalizer — provider mappers produce this shape */
export interface AnnouncementNormalizerInput {
  source: NewsSource;
  symbol: string;
  companyName: string;
  headline: string;
  descriptionParts: ReadonlyArray<string | undefined | null>;
  publishedAt: Date;
  url?: string;
  rawData: unknown;
}

/** Provider-specific row mapper signature */
export type RowMapper<T> = (row: T) => AnnouncementDraft | null;
