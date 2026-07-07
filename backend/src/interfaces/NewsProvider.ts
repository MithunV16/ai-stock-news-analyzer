import type { AnnouncementDraft } from '@/interfaces/Announcement';
import type { NewsSource } from '@/types/newsIngestion';

/**
 * Result of a single provider fetch cycle.
 * Structured for scheduler logging (timing, URL, HTTP status, counts).
 *
 * `announcements` are normalized drafts — fingerprint is assigned by DuplicateDetectionService.
 */
export interface ProviderFetchResult {
  provider: string;
  source: NewsSource;
  announcements: AnnouncementDraft[];
  requestUrl: string;
  httpStatus?: number;
  durationMs: number;
  fetchedAt: Date;
  /** Count of raw items before normalization (for metrics) */
  rawItemCount: number;
  retryCount: number;
}

/**
 * Contract every ingestion provider must implement.
 *
 * Implementations: NSEProvider, BSEProvider, future MoneycontrolProvider, etc.
 * The scheduler communicates ONLY with ProviderRegistry — never directly with providers.
 */
export interface NewsProvider {
  /** Registry key, e.g. 'nse' | 'bse' */
  readonly name: string;
  /** Normalized source identifier stamped on Announcement.source */
  readonly source: NewsSource;
  /** Fetch and normalize announcements from the external API */
  fetchAnnouncements(): Promise<ProviderFetchResult>;
}

/** Metadata returned by ProviderRegistry when running all providers */
export interface ProviderRegistryRunResult {
  results: ProviderFetchResult[];
  totalFetched: number;
  totalDurationMs: number;
  failedProviders: string[];
}
