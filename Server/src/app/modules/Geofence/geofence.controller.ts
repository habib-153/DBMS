import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { GeofenceService } from './geofence.service';
import { catchAsync } from '../../utils/catchAsync';

const checkUserLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { latitude, longitude } = req.body;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  if (!latitude || !longitude) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Latitude and longitude are required',
      data: null,
    });
  }

  const result = await GeofenceService.recordUserLocation(
    {
      userId,
      latitude,
      longitude,
    },
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Location checked successfully',
    data: result,
  });
});

const getGeofenceZones = catchAsync(async (req: Request, res: Response) => {
  const zones = await GeofenceService.getActiveGeofenceZones();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Geofence zones retrieved successfully',
    data: zones,
  });
});

const createGeofenceZone = catchAsync(async (req: Request, res: Response) => {
  const zoneData = req.body;

  const result = await GeofenceService.createGeofenceZone(zoneData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Geofence zone created successfully',
    data: result,
  });
});

const getUserLocationHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 100;

    if (!userId) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const history = await GeofenceService.getUserLocationHistory(userId, limit);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Location history retrieved successfully',
      data: history,
    });
  }
);

const recordLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { latitude, longitude, accuracy, address, activity } = req.body;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  if (!latitude || !longitude) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Latitude and longitude are required',
      data: null,
    });
  }

  const result = await GeofenceService.recordUserLocation(
    {
      userId,
      latitude,
      longitude,
      accuracy,
      address,
      activity,
    },
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Location recorded successfully',
    data: result,
  });
});

const triggerCheck = catchAsync(async (req: Request, res: Response) => {
  // Admin testing endpoint to force a geofence check for any user
  const { userId, latitude, longitude } = req.body;

  if (!userId || !latitude || !longitude) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'userId, latitude and longitude are required',
      data: null,
    });
  }

  const result = await GeofenceService.recordUserLocation(
    {
      userId,
      latitude,
      longitude,
    },
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Test geofence check executed',
    data: result,
  });
});

const autoGenerateZones = catchAsync(async (req: Request, res: Response) => {
  const result = await GeofenceService.autoGenerateGeofenceZones();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Auto-generated ${result.created} geofence zones from ${result.totalPosts} approved posts (${result.skipped} skipped - already exist)`,
    data: result,
  });
});

const updateGeofenceZone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await GeofenceService.updateGeofenceZone(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Geofence zone updated successfully',
    data: result,
  });
});

const deleteGeofenceZone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  await GeofenceService.deleteGeofenceZone(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Geofence zone deleted successfully',
    data: null,
  });
});

export const GeofenceController = {
  checkUserLocation,
  getGeofenceZones,
  createGeofenceZone,
  updateGeofenceZone,
  deleteGeofenceZone,
  getUserLocationHistory,
  recordLocation,
  autoGenerateZones,
  triggerCheck,
};
