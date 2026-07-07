import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { AppError } from '@/utils/errors';
import { logger } from '@/utils/logger';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Central error handler — must be registered last in the middleware chain.
 * Never leaks stack traces in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : 'Internal server error';
  const code = isAppError ? err.code : 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error('Unhandled server error', { error: err });
  } else {
    logger.warn('Client error', { statusCode, message, code });
  }

  const body: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      ...(isAppError && err.details !== undefined ? { details: err.details } : {}),
      ...(config.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
    },
  };

  res.status(statusCode).json(body);
}
