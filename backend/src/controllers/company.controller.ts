import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { companyService } from '@/services/company.service';
import { parseParams } from '@/utils/parseRequest';

const symbolParamsSchema = z.object({
  symbol: z.string().trim().min(1).max(20),
});

export class CompanyController {
  constructor(private readonly service = companyService) {}

  getBySymbol = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { symbol } = parseParams(req, symbolParamsSchema);
      const result = await this.service.getBySymbol(symbol);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const companyController = new CompanyController();
