import dotenv from 'dotenv';

dotenv.config();

/**
 * Builds DATABASE_URL and REDIS_URL from individual host/port vars when a full
 * connection string is not provided. Must run before Prisma Client is imported.
 */
function buildDatabaseUrl(): string {
  const host = process.env.POSTGRES_HOST ?? 'localhost';
  const port = process.env.POSTGRES_PORT ?? '5432';
  const user = process.env.POSTGRES_USER ?? 'postgres';
  const password = process.env.POSTGRES_PASSWORD ?? 'postgres';
  const database = process.env.POSTGRES_DB ?? 'stock_news_analyzer';

  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
}

function buildRedisUrl(): string {
  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = process.env.REDIS_PORT ?? '6379';
  return `redis://${host}:${port}`;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = buildDatabaseUrl();
}

if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = buildRedisUrl();
}
