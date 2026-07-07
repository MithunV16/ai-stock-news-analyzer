import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';

/**
 * Handles unmatched routes with a consistent 404 JSON response.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
