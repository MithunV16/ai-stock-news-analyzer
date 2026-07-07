/** Internal NSE session state — not exported outside providers/nse */
export interface NseSessionState {
  cookieHeader: string;
  refreshedAt: Date | null;
  refreshCount: number;
}

/** Successful HTTP response wrapper returned to NSEProvider (Module 5) */
export interface NseSessionResponse<T> {
  data: T;
  status: number;
  requestUrl: string;
  durationMs: number;
  sessionRefreshed: boolean;
}

export interface NseGetOptions {
  params?: Record<string, string | number | undefined>;
  /** Skip auto-refresh retry (used internally to prevent infinite loops) */
  _skipRefreshRetry?: boolean;
}

/**
 * Contract for NSE HTTP access with cookie management.
 * NSEProvider depends on this — not on Axios directly.
 */
export interface INSESessionManager {
  refreshSession(): Promise<void>;
  get<T>(url: string, options?: NseGetOptions): Promise<NseSessionResponse<T>>;
  hasActiveSession(): boolean;
  getRefreshCount(): number;
}
