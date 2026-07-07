/**
 * Custom application errors with HTTP status codes.
 * Services throw these; the error middleware formats the response.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(400, message, 'BAD_REQUEST', details);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message, 'NOT_FOUND');
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(500, message, 'INTERNAL_ERROR');
  }
}
