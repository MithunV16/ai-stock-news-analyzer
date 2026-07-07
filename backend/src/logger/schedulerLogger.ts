import fs from 'node:fs';
import path from 'node:path';
import winston from 'winston';
import { config } from '@/config/env';
import { newsIngestionConfig } from '@/config/newsProviders';
import type { ProviderFetchResult } from '@/interfaces/NewsProvider';
import type { IngestionCycleRunResult, ProviderCycleStats } from '@/interfaces/IngestionResult';
import {
  SCHEDULER_LOG_DOMAIN,
  type SchedulerCycleLogPayload,
  type SchedulerLogEvent,
  type SchedulerProviderLogEntry,
} from '@/logger/schedulerLog.types';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

function ensureLogDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const logFile = newsIngestionConfig.logging.schedulerLogFile;
ensureLogDirectory(logFile);

const consoleFormat = printf(({ level, message, timestamp: ts, event, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const eventTag = event ? `[${String(event)}] ` : '';
  return `${ts} [${level}] [scheduler] ${eventTag}${message}${metaStr}`;
});

const fileTransport = new winston.transports.File({
  filename: logFile,
  format: combine(errors({ stack: true }), timestamp(), json()),
});

const consoleTransport = new winston.transports.Console({
  format:
    config.NODE_ENV === 'development'
      ? combine(colorize(), timestamp(), consoleFormat)
      : combine(timestamp(), json()),
});

/** Dedicated Winston logger — scheduler output is isolated from general app logs */
const winstonSchedulerLogger = winston.createLogger({
  level: newsIngestionConfig.logging.schedulerLogLevel,
  defaultMeta: { domain: SCHEDULER_LOG_DOMAIN },
  transports: [fileTransport, consoleTransport],
});

/**
 * Typed structured logger for the News Ingestion Engine scheduler.
 * All entries include provider metrics, timing, and error context where applicable.
 */
export class IngestionSchedulerLogger {
  schedulerStarted(intervalMs: number, providers: readonly string[]): void {
    this.write('info', 'scheduler.started', 'Ingestion scheduler started', {
      intervalMs,
      providers,
      logFile,
    });
  }

  schedulerStopped(): void {
    this.write('info', 'scheduler.stopped', 'Ingestion scheduler stopped');
  }

  cycleStarted(cycleId: string, enabledProviders: readonly string[]): void {
    this.write('debug', 'cycle.started', 'Ingestion cycle started', {
      cycleId,
      enabledProviders,
    });
  }

  cycleSkipped(reason: string): void {
    this.write('debug', 'cycle.skipped', reason);
  }

  providerFetchCompleted(fetch: ProviderFetchResult): void {
    if (!newsIngestionConfig.logging.logProviderTiming) {
      return;
    }

    this.write('info', 'provider.fetch', 'Provider fetch completed', {
      provider: fetch.provider,
      source: fetch.source,
      requestUrl: fetch.requestUrl,
      httpStatus: fetch.httpStatus,
      durationMs: fetch.durationMs,
      announcementsFetched: fetch.announcements.length,
      rawItemCount: fetch.rawItemCount,
      retryCount: fetch.retryCount,
    });
  }

  providerFetchFailed(
    provider: string,
    error: unknown,
    details?: Record<string, unknown>,
  ): void {
    this.write('error', 'provider.fetch.failed', 'Provider fetch failed', {
      provider,
      error: this.formatError(error),
      ...details,
    });
  }

  providerFetchRetryScheduled(details: {
    provider: string;
    attempt: number;
    maxRetries: number;
    delayMs: number;
    error: string;
  }): void {
    this.write('warn', 'provider.fetch.retry', 'Provider fetch retry scheduled', details);
  }

  providerPipelineFailed(
    provider: string,
    requestUrl: string,
    error: unknown,
  ): void {
    this.write('error', 'provider.pipeline.failed', 'Provider ingestion pipeline failed', {
      provider,
      requestUrl,
      error: this.formatError(error),
    });
  }

  providerCompleted(cycleId: string, stats: ProviderCycleStats): void {
    this.write('info', 'provider.completed', 'Provider cycle completed', {
      cycleId,
      ...this.toProviderEntry(stats),
    });
  }

  cycleCompleted(result: IngestionCycleRunResult): void {
    const payload = this.toCyclePayload(result);
    const hasActivity =
      result.totals.stored > 0 || result.totals.errors > 0 || result.totals.fetched > 0;

    if (!hasActivity && newsIngestionConfig.logging.schedulerLogLevel !== 'debug') {
      return;
    }

    this.write('info', 'cycle.completed', 'Ingestion cycle completed', {
      ...payload,
    });
  }

  cycleFailedUnexpected(cycleId: string, error: unknown): void {
    this.write('error', 'cycle.failed', 'Ingestion cycle failed unexpectedly', {
      cycleId,
      error: this.formatError(error),
    });
  }

  private toProviderEntry(stats: ProviderCycleStats): SchedulerProviderLogEntry {
    return {
      provider: stats.provider,
      requestUrl: stats.requestUrl,
      httpStatus: stats.httpStatus,
      durationMs: stats.durationMs,
      announcementsFetched: stats.fetched,
      announcementsStored: stats.stored,
      duplicateCount: stats.duplicates,
      retryCount: stats.retryCount,
      errors: stats.errors,
    };
  }

  private toCyclePayload(result: IngestionCycleRunResult): SchedulerCycleLogPayload {
    return {
      cycleId: result.cycleId,
      startedAt: result.startedAt.toISOString(),
      completedAt: result.completedAt.toISOString(),
      durationMs: result.durationMs,
      providers: result.providers.map((p) => this.toProviderEntry(p)),
      totals: result.totals,
    };
  }

  private formatError(error: unknown): Record<string, unknown> | string {
    if (error instanceof Error) {
      return { message: error.message, name: error.name };
    }
    return String(error);
  }

  private write(
    level: 'error' | 'warn' | 'info' | 'debug',
    event: SchedulerLogEvent,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    winstonSchedulerLogger.log(level, message, { event, ...meta });
  }
}

export const ingestionSchedulerLogger = new IngestionSchedulerLogger();
