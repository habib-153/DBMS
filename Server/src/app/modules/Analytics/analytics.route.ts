import express from 'express';
import { AnalyticsControllers } from './analytics.controller';

const router = express.Router();

// GET /analytics/dashboard
router.get('/dashboard', AnalyticsControllers.dashboard);

// Additional endpoints used by the client analytics page
// GET /analytics/crime-trend
router.get('/crime-trend', AnalyticsControllers.crimeTrend);

// GET /analytics/crime-type-distribution
router.get(
  '/crime-type-distribution',
  AnalyticsControllers.crimeTypeDistribution
);

// GET /analytics/time-pattern
router.get('/time-pattern', AnalyticsControllers.timePattern);

// GET /analytics/hotspot-districts
router.get('/hotspot-districts', AnalyticsControllers.hotspotDistricts);

// GET /analytics/status-breakdown
router.get('/status-breakdown', AnalyticsControllers.statusBreakdown);

// GET /analytics/division-stats
router.get('/division-stats', AnalyticsControllers.divisionStats);

// GET /analytics/crimes-by-day
router.get('/crimes-by-day', AnalyticsControllers.crimesByDayOfWeek);

// GET /analytics/recent-activity
router.get('/recent-activity', AnalyticsControllers.recentActivity);

export const AnalyticsRoutes = router;
