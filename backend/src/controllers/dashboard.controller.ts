import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '@/services/dashboard.service';
import { dashboardQuerySchema } from '@/types/queries';
import { parseQuery } from '@/utils/parseRequest';

export class DashboardController {
  constructor(private readonly service = dashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = parseQuery(req, dashboardQuerySchema);
      const result = await this.service.getDashboard(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
