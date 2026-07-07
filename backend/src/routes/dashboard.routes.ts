import { Router } from 'express';
import { dashboardController } from '@/controllers/dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboard);

export default router;
