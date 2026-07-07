import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

/**
 * Logs incoming HTTP requests with method, path, status, and duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
    });
  });

  next();
}
