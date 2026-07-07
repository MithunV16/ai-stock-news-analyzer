import { Router } from 'express';
import healthRoutes from '@/routes/health.routes';
import newsRoutes from '@/routes/news.routes';
import eventsRoutes from '@/routes/events.routes';
import dashboardRoutes from '@/routes/dashboard.routes';
import companyRoutes from '@/routes/company.routes';

/**
 * Root API router — all REST endpoints mounted under /api
 */
const router = Router();

router.use(healthRoutes);
router.use('/news', newsRoutes);
router.use('/events', eventsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/company', companyRoutes);

export default router;
