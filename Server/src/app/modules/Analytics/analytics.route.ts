import express from 'express';
import { AnalyticsControllers } from './analytics.controller';

const router = express.Router();

// GET /analytics/dashboard
router.get('/dashboard', AnalyticsControllers.dashboard);

export const AnalyticsRoutes = router;
