/**
 * @deprecated Legacy collector types — use `@/interfaces` for the new ingestion engine.
 * Kept for backward compatibility until Module 10 migrates the scheduler.
 */
export interface RawAnnouncement {
  symbol: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: Date;
  rawContent: string;
}

/**
 * Pluggable news source — add new providers by implementing this interface
 * and registering in newsProviderRegistry.
 */
export interface NewsProvider {
  readonly name: string;
  fetchLatest(): Promise<RawAnnouncement[]>;
}

export interface CollectorRunResult {
  fetched: number;
  inserted: number;
  duplicates: number;
  skipped: number;
  errors: number;
}
