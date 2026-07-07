/**
 * Type definitions for the News Ingestion Engine configuration layer.
 * Kept separate from runtime config so providers and services can depend on
 * typed shapes without importing env parsing logic.
 */

export type NewsSource = 'NSE' | 'BSE';

export type CookieRefreshStrategy = 'on-auth-failure' | 'always' | 'never';

export interface SchedulerConfig {
  /** Polling interval in milliseconds (default 30_000) */
  pollIntervalMs: number;
  /** Max retry attempts per provider fetch cycle */
  maxRetries: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseMs: number;
  /** Maximum backoff cap (ms) */
  retryMaxMs: number;
  /** Whether the ingestion scheduler is enabled */
  enabled: boolean;
}

export interface HttpClientConfig {
  timeoutMs: number;
  maxRetries: number;
  retryBaseMs: number;
  retryMaxMs: number;
}

export interface NseProviderConfig {
  enabled: boolean;
  baseUrl: string;
  homepageUrl: string;
  announcementsPath: string;
  index: string;
  /** How many days back to query on each poll */
  dateRangeDays: number;
  headers: Readonly<Record<string, string>>;
  http: HttpClientConfig;
  cookie: {
    strategy: CookieRefreshStrategy;
    /** HTTP status codes that trigger a cookie refresh + single retry */
    refreshOnStatus: readonly number[];
  };
}

export interface BseProviderConfig {
  enabled: boolean;
  baseUrl: string;
  announcementsPath: string;
  headers: Readonly<Record<string, string>>;
  http: HttpClientConfig;
}

export interface DuplicateDetectionConfig {
  algorithm: 'sha256';
  /** Redis TTL for fingerprint cache (seconds) */
  cacheTtlSeconds: number;
}

export interface IngestionSocketConfig {
  /** Socket.io event name for newly stored announcements */
  newAnnouncementEvent: 'announcement:new';
}

export interface IngestionLoggingConfig {
  /** Winston log level for scheduler-specific logs */
  schedulerLogLevel: 'error' | 'warn' | 'info' | 'debug';
  /** Dedicated log file path for ingestion scheduler output */
  schedulerLogFile: string;
  /** Whether to emit per-provider timing metrics in logs */
  logProviderTiming: boolean;
}

/** Top-level news ingestion configuration consumed by scheduler and providers */
export interface NewsIngestionConfig {
  scheduler: SchedulerConfig;
  nse: NseProviderConfig;
  bse: BseProviderConfig;
  duplicateDetection: DuplicateDetectionConfig;
  socket: IngestionSocketConfig;
  logging: IngestionLoggingConfig;
  /** Provider registry keys enabled for this deployment (e.g. ['nse', 'bse']) */
  enabledProviders: readonly string[];
}
