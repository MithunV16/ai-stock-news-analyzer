import type { AnnouncementDraft } from '@/interfaces/Announcement';
import type {
  AnnouncementNormalizerInput,
  RowMapper,
} from '@/interfaces/normalizer.types';
import { NormalizationError } from '@/errors';
import { logger } from '@/utils/logger';

const MAX_DESCRIPTION_LENGTH = 8_000;
const MAX_HEADLINE_LENGTH = 1_000;
const MAX_SYMBOL_LENGTH = 20;

/**
 * Shared announcement normalization service.
 *
 * Responsibilities:
 * - Validate and sanitize common fields (symbol, headline, companyName)
 * - Compose deduplicated descriptions from multiple text parts
 * - Build consistent AnnouncementDraft objects
 *
 * Provider normalizers (NSE/BSE) extract raw fields, then delegate here.
 * Future providers (Moneycontrol, ET) follow the same pattern.
 */
export class AnnouncementNormalizerService {
  /**
   * Validates input and returns a normalized draft, or null if required fields are missing.
   */
  createDraft(input: AnnouncementNormalizerInput): AnnouncementDraft | null {
    const symbol = this.normalizeSymbol(input.symbol);
    const headline = this.normalizeText(input.headline, MAX_HEADLINE_LENGTH);
    const companyName = this.normalizeText(input.companyName || symbol, 200);

    if (!symbol || !headline) {
      return null;
    }

    return {
      source: input.source,
      symbol,
      companyName,
      headline,
      description: this.composeDescription(input.descriptionParts),
      publishedAt: input.publishedAt,
      url: input.url?.trim() || undefined,
      rawData: input.rawData,
    };
  }

  createDraftOrThrow(
    provider: string,
    input: AnnouncementNormalizerInput,
  ): AnnouncementDraft {
    const draft = this.createDraft(input);
    if (!draft) {
      throw new NormalizationError(provider, 'Missing required symbol or headline', input.rawData);
    }
    return draft;
  }

  /** Batch normalize with a provider-specific row mapper */
  normalizeMany<T>(rows: T[], mapper: RowMapper<T>): AnnouncementDraft[] {
    return rows
      .map((row) => mapper(row))
      .filter((draft): draft is AnnouncementDraft => draft !== null);
  }

  /** Merge unique non-empty text parts into a single description block */
  composeDescription(parts: ReadonlyArray<string | undefined | null>): string {
    const unique = [
      ...new Set(
        parts
          .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
          .map((p) => p.trim()),
      ),
    ];
    return unique.join('\n\n').slice(0, MAX_DESCRIPTION_LENGTH);
  }

  normalizeSymbol(value: string): string {
    return this.normalizeText(value, MAX_SYMBOL_LENGTH).toUpperCase();
  }

  private normalizeText(value: string, maxLength: number): string {
    return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
  }

  /** Safe wrapper — logs and returns null instead of throwing */
  safeMap<T>(provider: string, row: T, mapper: RowMapper<T>): AnnouncementDraft | null {
    try {
      return mapper(row);
    } catch (error) {
      logger.warn('Row normalization failed — skipping', {
        provider,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  safeMapMany<T>(provider: string, rows: T[], mapper: RowMapper<T>): AnnouncementDraft[] {
    return rows
      .map((row) => this.safeMap(provider, row, mapper))
      .filter((draft): draft is AnnouncementDraft => draft !== null);
  }
}

export const announcementNormalizer = new AnnouncementNormalizerService();
