import cron, { ScheduledTask } from 'node-cron';
import { config } from '@/config/env';
import { registerNewsProviders } from '@/jobs/providers';
import { newsCollectorService } from '@/services/newsCollector.service';
import { logger } from '@/utils/logger';

let scheduledTask: ScheduledTask | null = null;

/**
 * Background scheduler — polls news providers every N seconds.
 * Uses node-cron 6-field expression for second-level intervals.
 */
export function startNewsCollectorJob(): void {
  if (scheduledTask) {
    logger.warn('News collector job already running');
    return;
  }

  registerNewsProviders();

  const providers = config.NEWS_PROVIDERS ?? (config.ENABLE_MOCK_NEWS ? 'nse,mock' : 'nse');
  const interval = config.NEWS_POLL_INTERVAL_SECONDS;
  const cronExpression = `*/${interval} * * * * *`;

  logger.info('Starting news collector scheduler', {
    intervalSeconds: interval,
    cronExpression,
    providers,
  });

  // Run immediately on startup, then on schedule
  void newsCollectorService.run();

  scheduledTask = cron.schedule(cronExpression, () => {
    void newsCollectorService.run();
  });

  scheduledTask.start();
}

export function stopNewsCollectorJob(): void {
  if (!scheduledTask) return;

  scheduledTask.stop();
  scheduledTask = null;
  logger.info('News collector scheduler stopped');
}
