import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';

const router = Router();

router.get('/metrics', getDashboardMetrics);

export default router;
