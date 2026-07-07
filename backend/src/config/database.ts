import '@/config/ensure-env';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Prisma client singleton.
 *
 * In development, attach the client to `globalThis` so hot-reload (tsx watch)
 * does not exhaust the connection pool by creating a new client on every reload.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
        : ['warn', 'error'],
  });

  if (config.NODE_ENV === 'development') {
    client.$on('query', (event) => {
      logger.debug('Prisma query', {
        query: event.query,
        durationMs: event.duration,
      });
    });
  }

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect — call during server shutdown (Step 5).
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database connection closed');
}

/**
 * Health check used by readiness probes and startup validation.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection check failed', { error });
    return false;
  }
}
