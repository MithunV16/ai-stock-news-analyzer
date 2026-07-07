import { config } from '@/config/env';
import type {
  BseProviderConfig,
  NewsIngestionConfig,
  NseProviderConfig,
  SchedulerConfig,
} from '@/types/newsIngestion';

/**
 * Central configuration for the News Ingestion Engine.
 *
 * Design decisions:
 * - All endpoints, headers, timeouts, and retry policy live here — never hardcoded in providers.
 * - Env vars override defaults; sensible production defaults are baked in.
 * - Existing NEWS_POLL_INTERVAL_SECONDS is respected for backward compatibility.
 * - Future providers (Moneycontrol, ET, etc.) add a section here without touching scheduler code.
 */

// ---------------------------------------------------------------------------
// Browser-like headers — required by NSE/BSE anti-bot checks
// ---------------------------------------------------------------------------
const COMMON_BROWSER_HEADERS: Readonly<Record<string, string>> = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// ---------------------------------------------------------------------------
// NSE
// ---------------------------------------------------------------------------
function buildNseConfig(): NseProviderConfig {
  return {
    enabled: isProviderEnabled('nse'),
    baseUrl: config.NSE_BASE_URL,
    homepageUrl: config.NSE_HOMEPAGE_URL,
    announcementsPath: config.NSE_ANNOUNCEMENTS_PATH,
    index: config.NSE_INDEX,
    dateRangeDays: config.NSE_DATE_RANGE_DAYS,
    headers: {
      ...COMMON_BROWSER_HEADERS,
      Referer: `${config.NSE_BASE_URL}/companies-listing/corporate-filings-announcements`,
      Origin: config.NSE_BASE_URL,
    },
    http: {
      timeoutMs: config.NSE_TIMEOUT_MS,
      maxRetries: config.NSE_MAX_RETRIES,
      retryBaseMs: config.NEWS_RETRY_BASE_MS,
      retryMaxMs: config.NEWS_RETRY_MAX_MS,
    },
    cookie: {
      strategy: config.NSE_COOKIE_STRATEGY,
      refreshOnStatus: [401, 403, 429],
    },
  };
}

// ---------------------------------------------------------------------------
// BSE
// ---------------------------------------------------------------------------
function buildBseConfig(): BseProviderConfig {
  return {
    enabled: isProviderEnabled('bse'),
    baseUrl: config.BSE_BASE_URL,
    announcementsPath: config.BSE_ANNOUNCEMENTS_PATH,
    dateRangeDays: config.BSE_DATE_RANGE_DAYS,
    maxPages: config.BSE_MAX_PAGES,
    headers: {
      ...COMMON_BROWSER_HEADERS,
      Referer: `${config.BSE_BASE_URL}/`,
      Origin: config.BSE_BASE_URL,
    },
    http: {
      timeoutMs: config.BSE_TIMEOUT_MS,
      maxRetries: config.BSE_MAX_RETRIES,
      retryBaseMs: config.NEWS_RETRY_BASE_MS,
      retryMaxMs: config.NEWS_RETRY_MAX_MS,
    },
  };
}

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------
function buildSchedulerConfig(): SchedulerConfig {
  return {
    pollIntervalMs: resolvePollIntervalMs(),
    maxRetries: config.NEWS_MAX_RETRIES,
    retryBaseMs: config.NEWS_RETRY_BASE_MS,
    retryMaxMs: config.NEWS_RETRY_MAX_MS,
    enabled: config.NEWS_INGESTION_ENABLED,
  };
}

/** Prefer NEWS_POLL_INTERVAL_MS; fall back to legacy SECONDS-based env var */
function resolvePollIntervalMs(): number {
  if (config.NEWS_POLL_INTERVAL_MS !== undefined) {
    return config.NEWS_POLL_INTERVAL_MS;
  }
  return config.NEWS_POLL_INTERVAL_SECONDS * 1_000;
}

function isProviderEnabled(name: string): boolean {
  return config.NEWS_INGESTION_PROVIDERS.includes(name);
}

function resolveEnabledProviders(nse: NseProviderConfig, bse: BseProviderConfig): readonly string[] {
  return config.NEWS_INGESTION_PROVIDERS.filter((name) => {
    if (name === 'nse') return nse.enabled;
    if (name === 'bse') return bse.enabled;
    return true;
  });
}

const nseConfig = buildNseConfig();
const bseConfig = buildBseConfig();

// ---------------------------------------------------------------------------
// Exported singleton — built once at module load
// ---------------------------------------------------------------------------
export const newsIngestionConfig: NewsIngestionConfig = {
  scheduler: buildSchedulerConfig(),
  nse: nseConfig,
  bse: bseConfig,
  duplicateDetection: {
    algorithm: 'sha256',
    cacheTtlSeconds: config.NEWS_FINGERPRINT_CACHE_TTL_SECONDS,
  },
  socket: {
    newAnnouncementEvent: 'announcement:new',
  },
  logging: {
    schedulerLogLevel: config.NEWS_SCHEDULER_LOG_LEVEL,
    schedulerLogFile: config.NEWS_SCHEDULER_LOG_FILE,
    logProviderTiming: config.NEWS_LOG_PROVIDER_TIMING,
  },
  enabledProviders: resolveEnabledProviders(nseConfig, bseConfig),
};

/** Helper — full NSE announcements URL (providers append query params at runtime) */
export function getNseAnnouncementsUrl(): string {
  const { baseUrl, announcementsPath } = newsIngestionConfig.nse;
  return `${baseUrl.replace(/\/$/, '')}${announcementsPath}`;
}

/** Helper — full BSE announcements URL */
export function getBseAnnouncementsUrl(): string {
  const { baseUrl, announcementsPath } = newsIngestionConfig.bse;
  return `${baseUrl.replace(/\/$/, '')}${announcementsPath}`;
}
