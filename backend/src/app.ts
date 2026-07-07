import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/env';
import apiRoutes from '@/routes/index';
import { requestLogger } from '@/middleware/requestLogger.middleware';
import { notFoundHandler } from '@/middleware/notFound.middleware';
import { errorHandler } from '@/middleware/error.middleware';

/**
 * Creates and configures the Express application.
 * Separated from server.ts so the app can be tested without listening on a port.
 */
export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow frontend origin (supports comma-separated list)
  const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // API routes under /api prefix
  app.use('/api', apiRoutes);

  // 404 + global error handler (order matters)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
