import { Router } from 'express';
import { eventsController } from '@/controllers/events.controller';

const router = Router();

router.get('/', eventsController.list);

export default router;
