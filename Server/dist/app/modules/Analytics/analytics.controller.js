"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsControllers = void 0;
const analytics_service_1 = require("./analytics.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const dashboard = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [crimesPerHour, trend, hotspots, timePatterns, verification, responseEffectiveness, contributors, typeDist,] = yield Promise.all([
        analytics_service_1.AnalyticsService.crimesPerHour(),
        analytics_service_1.AnalyticsService.crimeTrendWithMovingAvg(),
        analytics_service_1.AnalyticsService.hotspotDistricts(),
        analytics_service_1.AnalyticsService.timePatternAnalysis(),
        analytics_service_1.AnalyticsService.verificationAnalytics(),
        analytics_service_1.AnalyticsService.responseEffectiveness(),
        analytics_service_1.AnalyticsService.topContributors(),
        analytics_service_1.AnalyticsService.crimeTypeDistribution(),
    ]);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard data',
        data: {
            crimesPerHour,
            trend,
            hotspots,
            timePatterns,
            verification,
            responseEffectiveness,
            contributors,
            typeDist,
        },
    });
}));
const crimeTrend = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trend = yield analytics_service_1.AnalyticsService.crimeTrendWithMovingAvg();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Crime trend data',
        data: trend,
    });
}));
const crimeTypeDistribution = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dist = yield analytics_service_1.AnalyticsService.crimeTypeDistribution();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Crime type distribution',
        data: dist,
    });
}));
const timePattern = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tp = yield analytics_service_1.AnalyticsService.timePatternAnalysis();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Time pattern data',
        data: tp,
    });
}));
const hotspotDistricts = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hotspots = yield analytics_service_1.AnalyticsService.hotspotDistricts();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Hotspot districts',
        data: hotspots,
    });
}));
const statusBreakdown = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield analytics_service_1.AnalyticsService.statusBreakdown();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Status breakdown',
        data: stats,
    });
}));
const divisionStats = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield analytics_service_1.AnalyticsService.divisionStats();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Division statistics',
        data: stats,
    });
}));
const crimesByDayOfWeek = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield analytics_service_1.AnalyticsService.crimesByDayOfWeek();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Crimes by day of week',
        data: stats,
    });
}));
const recentActivity = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield analytics_service_1.AnalyticsService.recentCrimeActivity();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Recent crime activity',
        data: stats,
    });
}));
const polarHeatmap = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, radius, startDate, endDate, category } = req.query;
    // Validate required parameters
    if (!latitude || !longitude || !radius) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            success: false,
            message: 'latitude, longitude, and radius are required',
        });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            success: false,
            message: 'Invalid numeric values for latitude, longitude, or radius',
        });
    }
    const data = yield analytics_service_1.AnalyticsService.polarHeatmapData(lat, lng, rad, startDate, endDate, category);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Polar heatmap data retrieved successfully',
        data,
    });
}));
exports.AnalyticsControllers = {
    dashboard,
    crimeTrend,
    crimeTypeDistribution,
    timePattern,
    hotspotDistricts,
    statusBreakdown,
    divisionStats,
    crimesByDayOfWeek,
    recentActivity,
    polarHeatmap,
};
