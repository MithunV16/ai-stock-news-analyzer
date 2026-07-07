import { Request, Response, NextFunction } from 'express';
import { eventService } from '@/services/event.service';
import { eventsQuerySchema } from '@/types/queries';
import { parseQuery } from '@/utils/parseRequest';

export class EventsController {
  constructor(private readonly service = eventService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = parseQuery(req, eventsQuerySchema);
      const result = await this.service.listEvents(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const eventsController = new EventsController();
