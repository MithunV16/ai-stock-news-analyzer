import { Request } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from '@/utils/errors';

/**
 * Parses and validates req.query against a Zod schema.
 * Throws AppError.badRequest on invalid input.
 */
export function parseQuery<T extends ZodSchema>(req: Request, schema: T): z.infer<T> {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    throw AppError.badRequest('Invalid query parameters', result.error.flatten().fieldErrors);
  }
  return result.data;
}

/**
 * Parses and validates req.params against a Zod schema.
 */
export function parseParams<T extends ZodSchema>(req: Request, schema: T): z.infer<T> {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    throw AppError.badRequest('Invalid path parameters', result.error.flatten().fieldErrors);
  }
  return result.data;
}
