/**
 * Base error for the News Ingestion Engine.
 * Provider failures use these — they must never crash the scheduler.
 */
export class IngestionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'IngestionError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** HTTP / network failure inside a news provider */
export class ProviderFetchError extends IngestionError {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly httpStatus?: number,
    public readonly requestUrl?: string,
    details?: unknown,
  ) {
    super(message, 'PROVIDER_FETCH_ERROR', { provider, httpStatus, requestUrl, ...spreadDetails(details) });
    this.name = 'ProviderFetchError';
  }

  /** True when retry is worthwhile (transient network / rate-limit) */
  get isRetryable(): boolean {
    if (this.httpStatus === undefined) return true;
    return [408, 429, 500, 502, 503, 504].includes(this.httpStatus);
  }
}

/** NSE cookie session could not be established or refreshed */
export class SessionRefreshError extends IngestionError {
  constructor(
    public readonly provider: string,
    message: string,
    details?: unknown,
  ) {
    super(message, 'SESSION_REFRESH_ERROR', { provider, ...spreadDetails(details) });
    this.name = 'SessionRefreshError';
  }
}

/** Provider response could not be mapped to AnnouncementDraft */
export class NormalizationError extends IngestionError {
  constructor(
    public readonly provider: string,
    message: string,
    public readonly rawItem?: unknown,
  ) {
    super(message, 'NORMALIZATION_ERROR', { provider, rawItem });
    this.name = 'NormalizationError';
  }
}

/** Fingerprint generation failure */
export class FingerprintError extends IngestionError {
  constructor(message: string, details?: unknown) {
    super(message, 'FINGERPRINT_ERROR', details);
    this.name = 'FingerprintError';
  }
}

/** Database persistence failure */
export class PersistenceError extends IngestionError {
  constructor(message: string, public readonly fingerprint: string, details?: unknown) {
    super(message, 'PERSISTENCE_ERROR', { fingerprint, ...spreadDetails(details) });
    this.name = 'PersistenceError';
  }
}

/** Scheduler-level failure (non-fatal — logged, cycle continues) */
export class SchedulerCycleError extends IngestionError {
  constructor(message: string, public readonly cycleId: string, details?: unknown) {
    super(message, 'SCHEDULER_CYCLE_ERROR', { cycleId, ...spreadDetails(details) });
    this.name = 'SchedulerCycleError';
  }
}

function spreadDetails(details: unknown): Record<string, unknown> {
  if (details !== undefined && typeof details === 'object' && details !== null) {
    return details as Record<string, unknown>;
  }
  return details !== undefined ? { cause: details } : {};
}

/** Type guard — use in scheduler catch blocks */
export function isIngestionError(error: unknown): error is IngestionError {
  return error instanceof IngestionError;
}

/** Type guard — distinguish retryable provider failures */
export function isRetryableProviderError(error: unknown): boolean {
  return error instanceof ProviderFetchError && error.isRetryable;
}
