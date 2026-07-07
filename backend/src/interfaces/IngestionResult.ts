import type { PersistedAnnouncement } from '@/interfaces/Announcement';

/**
 * Outcome of a single scheduler ingestion cycle.
 * Used by SchedulerService structured logging.
 */
export interface IngestionCycleResult {
  cycleId: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  providers: ProviderCycleStats[];
  totals: {
    fetched: number;
    stored: number;
    duplicates: number;
    skipped: number;
    errors: number;
  };
}

export interface ProviderCycleStats {
  provider: string;
  fetched: number;
  stored: number;
  duplicates: number;
  errors: number;
  durationMs: number;
  httpStatus?: number;
  requestUrl: string;
  retryCount: number;
}

/** Result of persisting one announcement */
export interface PersistenceResult {
  stored: boolean;
  duplicate: boolean;
  announcement?: PersistedAnnouncement;
  fingerprint: string;
}

/** Payload for duplicate detection */
export interface FingerprintInput {
  source: string;
  symbol: string;
  headline: string;
  publishedAt: Date;
}

/** Full cycle output including rows ready for EventBus / Socket.io (Modules 11–12) */
export interface IngestionCycleRunResult extends IngestionCycleResult {
  storedAnnouncements: PersistedAnnouncement[];
}
