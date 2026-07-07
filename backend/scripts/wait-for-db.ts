/**
 * Waits for PostgreSQL to accept connections before running migrations.
 * Used by `npm run db:setup` after `docker compose up`.
 */
import '../src/config/ensure-env';
import net from 'node:net';
import { logger } from '@/utils/logger';

function tryConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.setTimeout(3000);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPostgres(maxAttempts = 30, delayMs = 2000): Promise<void> {
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = Number(process.env.POSTGRES_PORT ?? 5432);

  logger.info(`Waiting for PostgreSQL at ${host}:${port}...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ready = await tryConnect(host, port);
    if (ready) {
      logger.info('PostgreSQL is accepting connections');
      return;
    }
    logger.debug(`PostgreSQL not ready (attempt ${attempt}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(`PostgreSQL not available at ${host}:${port} after ${maxAttempts} attempts`);
}

waitForPostgres().catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
