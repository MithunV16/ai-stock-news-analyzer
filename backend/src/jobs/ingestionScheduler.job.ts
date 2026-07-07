import { newsIngestionConfig } from '@/config/newsProviders';
import { ingestionSchedulerLogger } from '@/logger';
import { schedulerService } from '@/services/scheduler.service';

let intervalHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Background scheduler for the News Ingestion Engine.
 * Polls ProviderRegistry on a configurable interval (default 30s).
 *
 * Runs in parallel with the legacy news collector — does not replace it.
 */
export function startIngestionSchedulerJob(): void {
  if (!newsIngestionConfig.scheduler.enabled) {
    ingestionSchedulerLogger.cycleSkipped('News ingestion scheduler disabled via NEWS_INGESTION_ENABLED');
    return;
  }

  if (intervalHandle) {
    ingestionSchedulerLogger.cycleSkipped('Ingestion scheduler already running');
    return;
  }

  const intervalMs = newsIngestionConfig.scheduler.pollIntervalMs;
  const providers = newsIngestionConfig.enabledProviders;

  ingestionSchedulerLogger.schedulerStarted(intervalMs, providers);

  void schedulerService.runCycle();

  intervalHandle = setInterval(() => {
    void schedulerService.runCycle();
  }, intervalMs);
}

export function stopIngestionSchedulerJob(): void {
  if (!intervalHandle) return;

  clearInterval(intervalHandle);
  intervalHandle = null;
  ingestionSchedulerLogger.schedulerStopped();
}
