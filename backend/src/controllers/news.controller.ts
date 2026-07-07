import { Request, Response, NextFunction } from 'express';
import { newsService } from '@/services/news.service';
import { newsQuerySchema } from '@/types/queries';
import { parseQuery } from '@/utils/parseRequest';

export class NewsController {
  constructor(private readonly service = newsService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = parseQuery(req, newsQuerySchema);
      const result = await this.service.listNews(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const newsController = new NewsController();
