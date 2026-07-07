import { Request, Response } from 'express';
import { checkDatabaseConnection } from '@/config/database';
import { checkRedisConnection } from '@/config/redis';

/**
 * Thin controller — delegates health logic, no business rules here.
 */
export class HealthController {
  /** Liveness probe — server is running */
  getHealth(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        status: 'ok',
        service: 'ai-stock-news-analyzer',
        timestamp: new Date().toISOString(),
      },
    });
  }

  /** Readiness probe — dependencies are reachable */
  async getReady(_req: Request, res: Response): Promise<void> {
    const [postgres, redis] = await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
    ]);

    const ready = postgres && redis;

    res.status(ready ? 200 : 503).json({
      success: ready,
      data: {
        status: ready ? 'ready' : 'degraded',
        checks: {
          postgres,
          redis,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const healthController = new HealthController();
