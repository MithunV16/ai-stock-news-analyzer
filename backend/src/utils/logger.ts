import winston from 'winston';
import { config } from '@/config/env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return stack
    ? `${ts} [${level}]: ${message}${metaStr}\n${stack}`
    : `${ts} [${level}]: ${message}${metaStr}`;
});

/**
 * Structured logger used across services, jobs, and middleware.
 * JSON output in production; colorized console in development.
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [
    new winston.transports.Console({
      format:
        config.NODE_ENV === 'development'
          ? combine(colorize(), timestamp(), logFormat)
          : combine(timestamp(), logFormat),
    }),
  ],
});
