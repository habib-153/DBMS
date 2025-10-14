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

export const AnalyticsControllers = { dashboard };
