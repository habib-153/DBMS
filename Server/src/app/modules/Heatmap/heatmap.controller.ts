import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { HeatmapService } from './heatmap.service';
import { catchAsync } from '../../utils/catchAsync';

// Get heatmap point data for map overlay
const getHeatmapPoints = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    districts: req.query.districts
      ? (req.query.districts as string).split(',')
      : undefined,
    divisions: req.query.divisions
      ? (req.query.divisions as string).split(',')
      : undefined,
    status: req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
    minVerificationScore: req.query.minVerificationScore
      ? parseInt(req.query.minVerificationScore as string)
      : undefined,
  };

  const result = await HeatmapService.getHeatmapPoints(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Heatmap points retrieved successfully',
    data: result,
  });
});

// Get district-level crime statistics
const getDistrictStats = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    divisions: req.query.divisions
      ? (req.query.divisions as string).split(',')
      : undefined,
  };

  const result = await HeatmapService.getDistrictStats(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'District statistics retrieved successfully',
    data: result,
  });
});

// Get division-level crime statistics
const getDivisionStats = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  };

  const result = await HeatmapService.getDivisionStats(filters);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Division statistics retrieved successfully',
    data: result,
  });
});

// Get all districts with coordinates
const getAllDistricts = catchAsync(async (req: Request, res: Response) => {
  const result = await HeatmapService.getAllDistricts();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Districts retrieved successfully',
    data: result,
  });
});

// Get all divisions
const getAllDivisions = catchAsync(async (req: Request, res: Response) => {
  const result = await HeatmapService.getAllDivisions();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Divisions retrieved successfully',
    data: result,
  });
});

export const HeatmapControllers = {
  getHeatmapPoints,
  getDistrictStats,
  getDivisionStats,
  getAllDistricts,
  getAllDivisions,
};
