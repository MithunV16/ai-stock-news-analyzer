import http from 'node:http';
import { Application } from 'express';
import { config } from '@/config/env';
import { disconnectDatabase } from '@/config/database';
import { disconnectRedis } from '@/config/redis';
import { socketService } from '@/socket';
import { stopNewsCollectorJob } from '@/jobs/newsCollector.job';
import { logger } from '@/utils/logger';

export type HttpServer = http.Server;

/**
 * Starts the HTTP server and registers graceful shutdown handlers.
 * Call socketService.initialize(server) after this returns.
 */
export function startServer(app: Application): HttpServer {
  const server = app.listen(config.PORT, config.HOST, () => {
    logger.info(`HTTP server listening on http://${config.HOST}:${config.PORT}`, {
      nodeEnv: config.NODE_ENV,
    });
  });

  registerShutdownHandlers(server);
  return server;
}

function registerShutdownHandlers(server: HttpServer): void {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      stopNewsCollectorJob();
      await socketService.shutdown();
    } catch (error) {
      logger.error('Error closing Socket.io', { error });
    }

    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error });
        process.exit(1);
      }
    });

    // Force exit if connections don't close within 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
