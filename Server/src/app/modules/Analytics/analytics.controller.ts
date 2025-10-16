import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';

const dashboard = catchAsync(async (_req: Request, res: Response) => {
  const [
    crimesPerHour,
    trend,
    hotspots,
    timePatterns,
    verification,
    responseEffectiveness,
    contributors,
    typeDist,
  ] = await Promise.all([
    AnalyticsService.crimesPerHour(),
    AnalyticsService.crimeTrendWithMovingAvg(),
    AnalyticsService.hotspotDistricts(),
    AnalyticsService.timePatternAnalysis(),
    AnalyticsService.verificationAnalytics(),
    AnalyticsService.responseEffectiveness(),
    AnalyticsService.topContributors(),
    AnalyticsService.crimeTypeDistribution(),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
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
});

const crimeTrend = catchAsync(async (_req: Request, res: Response) => {
  const trend = await AnalyticsService.crimeTrendWithMovingAvg();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Crime trend data',
    data: trend,
  });
});

const crimeTypeDistribution = catchAsync(
  async (_req: Request, res: Response) => {
    const dist = await AnalyticsService.crimeTypeDistribution();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Crime type distribution',
      data: dist,
    });
  }
);

const timePattern = catchAsync(async (_req: Request, res: Response) => {
  const tp = await AnalyticsService.timePatternAnalysis();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Time pattern data',
    data: tp,
  });
});

const hotspotDistricts = catchAsync(async (_req: Request, res: Response) => {
  const hotspots = await AnalyticsService.hotspotDistricts();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Hotspot districts',
    data: hotspots,
  });
});

const statusBreakdown = catchAsync(async (_req: Request, res: Response) => {
  const stats = await AnalyticsService.statusBreakdown();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Status breakdown',
    data: stats,
  });
});

const divisionStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await AnalyticsService.divisionStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Division statistics',
    data: stats,
  });
});

const crimesByDayOfWeek = catchAsync(async (_req: Request, res: Response) => {
  const stats = await AnalyticsService.crimesByDayOfWeek();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Crimes by day of week',
    data: stats,
  });
});

const recentActivity = catchAsync(async (_req: Request, res: Response) => {
  const stats = await AnalyticsService.recentCrimeActivity();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Recent crime activity',
    data: stats,
  });
});

export const AnalyticsControllers = {
  dashboard,
  crimeTrend,
  crimeTypeDistribution,
  timePattern,
  hotspotDistricts,
  statusBreakdown,
  divisionStats,
  crimesByDayOfWeek,
  recentActivity,
};
