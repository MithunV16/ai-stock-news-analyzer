import { Router } from 'express';
import { companyController } from '@/controllers/company.controller';

const router = Router();

router.get('/:symbol', companyController.getBySymbol);

export default router;
