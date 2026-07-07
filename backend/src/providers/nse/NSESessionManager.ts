import axios, { AxiosError, type AxiosInstance } from 'axios';
import { newsIngestionConfig } from '@/config/newsProviders';
import { ProviderFetchError, SessionRefreshError } from '@/errors';
import type {
  INSESessionManager,
  NseGetOptions,
  NseSessionResponse,
  NseSessionState,
} from '@/providers/nse/types';
import { logger } from '@/utils/logger';

const PROVIDER_NAME = 'nse';

/**
 * Manages NSE India cookie session lifecycle.
 *
 * NSE blocks API requests without valid cookies obtained from the homepage visit.
 *
 * Responsibilities (and ONLY these):
 * - Initialize cookies via homepage GET
 * - Attach cookies to subsequent Axios requests
 * - Refresh cookies on 401 / 403 / 429 and retry once
 * - Expose typed GET helper for NSEProvider (Module 5)
 *
 * All NSE HTTP concerns stay in this class — never leak to scheduler or registry.
 */
export class NSESessionManager implements INSESessionManager {
  private readonly client: AxiosInstance;
  private readonly refreshOnStatus: readonly number[];
  private state: NseSessionState = {
    cookieHeader: '',
    refreshedAt: null,
    refreshCount: 0,
  };

  constructor() {
    const { http, headers } = newsIngestionConfig.nse;

    this.client = axios.create({
      timeout: http.timeoutMs,
      headers: { ...headers },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 600,
    });

    this.refreshOnStatus = newsIngestionConfig.nse.cookie.refreshOnStatus;
  }

  hasActiveSession(): boolean {
    return this.state.cookieHeader.length > 0;
  }

  getRefreshCount(): number {
    return this.state.refreshCount;
  }

  /**
   * Visits the NSE homepage to obtain fresh session cookies.
   * Called on first request and when auth/rate-limit responses occur.
   */
  async refreshSession(): Promise<void> {
    const { homepageUrl, cookie } = newsIngestionConfig.nse;
    const started = Date.now();

    if (cookie.strategy === 'never') {
      throw new SessionRefreshError(PROVIDER_NAME, 'Cookie refresh disabled by configuration');
    }

    try {
      logger.debug('Refreshing NSE session cookies', { homepageUrl });

      const response = await this.client.get(homepageUrl, {
        headers: this.buildHeaders(undefined, false),
      });

      if (response.status >= 400) {
        throw new SessionRefreshError(
          PROVIDER_NAME,
          `Homepage visit failed with HTTP ${response.status}`,
          { status: response.status, homepageUrl },
        );
      }

      this.applySetCookieHeaders(response.headers['set-cookie']);
      this.state.refreshedAt = new Date();
      this.state.refreshCount += 1;

      logger.info('NSE session refreshed', {
        durationMs: Date.now() - started,
        refreshCount: this.state.refreshCount,
        hasCookies: this.hasActiveSession(),
      });
    } catch (error) {
      if (error instanceof SessionRefreshError) {
        throw error;
      }

      throw new SessionRefreshError(
        PROVIDER_NAME,
        `Failed to refresh NSE session: ${error instanceof Error ? error.message : String(error)}`,
        { homepageUrl, cause: error },
      );
    }
  }

  /**
   * Authenticated GET with automatic session bootstrap and single refresh retry.
   */
  async get<T>(url: string, options: NseGetOptions = {}): Promise<NseSessionResponse<T>> {
    await this.ensureSession();

    const firstAttempt = await this.executeGet<T>(url, options, false);

    if (!this.shouldRefreshSession(firstAttempt.status) || options._skipRefreshRetry) {
      if (firstAttempt.status >= 400) {
        throw new ProviderFetchError(
          PROVIDER_NAME,
          `NSE request failed with HTTP ${firstAttempt.status}`,
          firstAttempt.status,
          firstAttempt.requestUrl,
        );
      }
      return firstAttempt;
    }

    logger.warn('NSE session expired or rate-limited — refreshing cookies', {
      status: firstAttempt.status,
      requestUrl: firstAttempt.requestUrl,
    });

    await this.refreshSession();

    const retryAttempt = await this.executeGet<T>(url, options, true);

    if (retryAttempt.status >= 400) {
      throw new ProviderFetchError(
        PROVIDER_NAME,
        `NSE request failed after cookie refresh (HTTP ${retryAttempt.status})`,
        retryAttempt.status,
        retryAttempt.requestUrl,
        { sessionRefreshed: true },
      );
    }

    return retryAttempt;
  }

  private async ensureSession(): Promise<void> {
    const { cookie } = newsIngestionConfig.nse;

    if (cookie.strategy === 'always' || !this.hasActiveSession()) {
      await this.refreshSession();
    }
  }

  private async executeGet<T>(
    url: string,
    options: NseGetOptions,
    sessionRefreshed: boolean,
  ): Promise<NseSessionResponse<T>> {
    const started = Date.now();
    const requestUrl = this.buildRequestUrl(url, options.params);

    try {
      const response = await this.client.get<T>(url, {
        params: options.params,
        headers: this.buildHeaders(requestUrl, true),
      });

      this.applySetCookieHeaders(response.headers['set-cookie']);

      return {
        data: response.data,
        status: response.status,
        requestUrl,
        durationMs: Date.now() - started,
        sessionRefreshed,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        throw new ProviderFetchError(
          PROVIDER_NAME,
          error.message,
          status,
          requestUrl,
          { code: error.code },
        );
      }
      throw error;
    }
  }

  private shouldRefreshSession(status: number): boolean {
    return this.refreshOnStatus.includes(status);
  }

  private buildHeaders(referer: string | undefined, includeCookies: boolean): Record<string, string> {
    const { headers, baseUrl } = newsIngestionConfig.nse;
    const result: Record<string, string> = { ...headers };

    if (referer) {
      result.Referer = referer.startsWith('http') ? referer : `${baseUrl}${referer}`;
    }

    if (includeCookies && this.state.cookieHeader) {
      result.Cookie = this.state.cookieHeader;
    }

    return result;
  }

  private buildRequestUrl(
    url: string,
    params?: Record<string, string | number | undefined>,
  ): string {
    if (!params) return url;

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        search.set(key, String(value));
      }
    }

    const qs = search.toString();
    return qs ? `${url}?${qs}` : url;
  }

  /**
   * Merge Set-Cookie headers into a single Cookie request header.
   * Keeps the latest value per cookie name.
   */
  private applySetCookieHeaders(setCookie: string[] | undefined): void {
    if (!setCookie || setCookie.length === 0) return;

    const jar = this.parseCookieHeader(this.state.cookieHeader);

    for (const raw of setCookie) {
      const pair = raw.split(';')[0]?.trim();
      if (!pair) continue;
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      jar.set(name, value);
    }

    this.state.cookieHeader = Array.from(jar.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  private parseCookieHeader(header: string): Map<string, string> {
    const jar = new Map<string, string>();
    if (!header) return jar;

    for (const part of header.split(';')) {
      const trimmed = part.trim();
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      jar.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim());
    }

    return jar;
  }
}

/** Singleton for NSEProvider injection (Module 5) */
export const nseSessionManager = new NSESessionManager();
