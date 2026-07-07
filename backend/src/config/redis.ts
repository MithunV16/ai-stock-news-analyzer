import Redis from 'ioredis';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Redis client singleton.
 * Used for duplicate detection (URL hash cache) and optional pub/sub in later steps.
 *
 * `lazyConnect: true` — connection is established explicitly via connectRedis()
 * so startup can fail gracefully when Redis is not yet running.
 */
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedisClient(): Redis {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  });

  client.on('error', (error) => {
    logger.error('Redis client error', { error: error.message });
  });

  client.on('connect', () => {
    logger.debug('Redis connected');
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (config.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export async function connectRedis(): Promise<void> {
  if (redis.status === 'ready' || redis.status === 'connecting') {
    return;
  }
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redis.status === 'end') {
    return;
  }
  await redis.quit();
  logger.info('Redis connection closed');
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await connectRedis();
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.error('Redis connection check failed', { error });
    return false;
  }
}

/** Prefix for duplicate-detection keys (news collector — Step 9) */
export const REDIS_KEY_PREFIX = 'stock-news';

export function newsDedupKey(url: string): string {
  return `${REDIS_KEY_PREFIX}:seen:${url}`;
}

/** Prefix for ingestion-engine fingerprint cache (Module 8+) */
export function announcementFingerprintKey(fingerprint: string): string {
  return `${REDIS_KEY_PREFIX}:fp:${fingerprint}`;
}
