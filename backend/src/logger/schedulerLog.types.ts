/** Structured log field shapes for the ingestion scheduler */

export const SCHEDULER_LOG_DOMAIN = 'ingestion-scheduler' as const;

export type SchedulerLogEvent =
  | 'scheduler.started'
  | 'scheduler.stopped'
  | 'cycle.started'
  | 'cycle.skipped'
  | 'cycle.completed'
  | 'cycle.failed'
  | 'provider.fetch'
  | 'provider.fetch.retry'
  | 'provider.fetch.failed'
  | 'provider.pipeline.failed'
  | 'provider.completed';

export interface SchedulerProviderLogEntry {
  provider: string;
  requestUrl: string;
  httpStatus?: number;
  durationMs: number;
  announcementsFetched: number;
  announcementsStored: number;
  duplicateCount: number;
  retryCount: number;
  errors: number;
}

export interface SchedulerCycleTotals {
  fetched: number;
  stored: number;
  duplicates: number;
  skipped: number;
  errors: number;
}

export interface SchedulerCycleLogPayload {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  providers: SchedulerProviderLogEntry[];
  totals: SchedulerCycleTotals;
}
