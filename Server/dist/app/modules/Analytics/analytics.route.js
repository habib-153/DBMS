"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_controller_1 = require("./analytics.controller");
const router = express_1.default.Router();
// GET /analytics/dashboard
router.get('/dashboard', analytics_controller_1.AnalyticsControllers.dashboard);
// Additional endpoints used by the client analytics page
// GET /analytics/crime-trend
router.get('/crime-trend', analytics_controller_1.AnalyticsControllers.crimeTrend);
// GET /analytics/crime-type-distribution
router.get('/crime-type-distribution', analytics_controller_1.AnalyticsControllers.crimeTypeDistribution);
// GET /analytics/time-pattern
router.get('/time-pattern', analytics_controller_1.AnalyticsControllers.timePattern);
// GET /analytics/hotspot-districts
router.get('/hotspot-districts', analytics_controller_1.AnalyticsControllers.hotspotDistricts);
// GET /analytics/status-breakdown
router.get('/status-breakdown', analytics_controller_1.AnalyticsControllers.statusBreakdown);
// GET /analytics/division-stats
router.get('/division-stats', analytics_controller_1.AnalyticsControllers.divisionStats);
// GET /analytics/crimes-by-day
router.get('/crimes-by-day', analytics_controller_1.AnalyticsControllers.crimesByDayOfWeek);
// GET /analytics/recent-activity
router.get('/recent-activity', analytics_controller_1.AnalyticsControllers.recentActivity);
// GET /analytics/polar-heatmap
router.get('/polar-heatmap', analytics_controller_1.AnalyticsControllers.polarHeatmap);
exports.AnalyticsRoutes = router;
