/**
 * Application entry point.
 * Bootstraps infrastructure checks, Express HTTP server, and Socket.io.
 * Background jobs wired in Step 9.
 */
import '@/config/ensure-env';
import { config } from '@/config/env';
import { checkDatabaseConnection } from '@/config/database';
import { checkRedisConnection } from '@/config/redis';
import { createApp } from '@/app';
import { startServer } from '@/server';
import { socketService, registerAnnouncementSocketSubscriber } from '@/socket';
import { startNewsCollectorJob } from '@/jobs/newsCollector.job';
import { startIngestionSchedulerJob } from '@/jobs/ingestionScheduler.job';
import { providerRegistry, registerIngestionProviders } from '@/providers';
import { logger } from '@/utils/logger';

async function bootstrap(): Promise<void> {
  logger.info('AI Stock News Analyzer — starting', {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
  });

  const [dbReady, redisReady] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  if (!dbReady) {
    logger.warn('PostgreSQL unavailable — some features will not work');
  }
  if (!redisReady) {
    logger.warn('Redis unavailable — duplicate detection cache disabled');
  }

  const app = createApp();
  const httpServer = startServer(app);
  socketService.initialize(httpServer);
  registerAnnouncementSocketSubscriber();

  logger.info('Real-time dashboard channel ready', {
    room: 'dashboard',
    socketPath: '/socket.io',
  });

  if (dbReady) {
    registerIngestionProviders(providerRegistry);
    startNewsCollectorJob();
    startIngestionSchedulerJob();
  } else {
    logger.warn('News collector disabled — PostgreSQL unavailable');
  }
}

bootstrap().catch((error) => {
  logger.error('Bootstrap failed', { error });
  process.exit(1);
});
