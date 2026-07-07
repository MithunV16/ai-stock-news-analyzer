import '@/config/ensure-env';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Centralized, validated environment configuration.
 * Fail fast at startup if required variables are missing or invalid.
 *
 * Connection strings: set DATABASE_URL / REDIS_URL directly, OR use
 * POSTGRES_HOST / REDIS_HOST (see .env.example). ensure-env.ts builds URLs
 * before this module loads when full URLs are omitted.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),

  // PostgreSQL — host/port style (preferred for Docker vs local switching)
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_DB: z.string().default('stock_news_analyzer'),

  /** Full URL — auto-built from POSTGRES_* when not set in .env */
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // -------------------------------------------------------------------------
  // Legacy news collector (existing pipeline — kept for backward compatibility)
  // -------------------------------------------------------------------------
  NEWS_POLL_INTERVAL_SECONDS: z.coerce.number().int().positive().default(30),
  NEWS_PROVIDERS: z.string().optional(),
  ENABLE_MOCK_NEWS: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return process.env.NODE_ENV !== 'production';
    }),

  // -------------------------------------------------------------------------
  // News Ingestion Engine (Module 1+)
  // -------------------------------------------------------------------------
  /** Master switch for the new ingestion scheduler */
  NEWS_INGESTION_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),

  /** Polling interval in ms — takes precedence over NEWS_POLL_INTERVAL_SECONDS */
  NEWS_POLL_INTERVAL_MS: z.coerce.number().int().positive().optional(),

  /** Comma-separated ingestion providers: nse, bse */
  NEWS_INGESTION_PROVIDERS: z
    .string()
    .default('nse,bse')
    .transform((v) =>
      v
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean),
    ),

  NEWS_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  NEWS_RETRY_BASE_MS: z.coerce.number().int().positive().default(1_000),
  NEWS_RETRY_MAX_MS: z.coerce.number().int().positive().default(30_000),
  NEWS_FINGERPRINT_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000),
  NEWS_SCHEDULER_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  NEWS_SCHEDULER_LOG_FILE: z.string().default('logs/ingestion-scheduler.log'),
  NEWS_LOG_PROVIDER_TIMING: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),

  // NSE provider
  NSE_BASE_URL: z.string().url().default('https://www.nseindia.com'),
  NSE_HOMEPAGE_URL: z.string().url().default('https://www.nseindia.com'),
  NSE_ANNOUNCEMENTS_PATH: z
    .string()
    .default('/api/corporate-announcements'),
  NSE_INDEX: z.string().default('equities'),
  NSE_DATE_RANGE_DAYS: z.coerce.number().int().positive().default(1),
  NSE_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  NSE_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  NSE_COOKIE_STRATEGY: z
    .enum(['on-auth-failure', 'always', 'never'])
    .default('on-auth-failure'),

  // BSE provider
  BSE_BASE_URL: z.string().url().default('https://api.bseindia.com'),
  BSE_ANNOUNCEMENTS_PATH: z
    .string()
    .default('/BseIndiaAPI/api/CorpAnn/w'),
  BSE_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  BSE_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

export type AppConfig = typeof config;
