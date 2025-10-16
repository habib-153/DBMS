import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { PushNotificationService } from './push.service';

const registerToken = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { token, platform } = req.body;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  if (!token || !platform) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Token and platform are required',
      data: null,
    });
  }

  const result = await PushNotificationService.registerPushToken({
    userId,
    token,
    platform,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Push token registered successfully',
    data: result,
  });
});

const getUserTokens = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  const tokens = await PushNotificationService.getUserPushTokens(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User push tokens retrieved successfully',
    data: tokens,
  });
});

const sendTestNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { title, body, data } = req.body;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  const result = await PushNotificationService.sendPushToUser(
    userId,
    title || 'Test Notification',
    body || 'This is a test notification from Crime Reporting System',
    data
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Notification sent to ${result.sent} device(s), ${result.failed} failed`,
    data: result,
  });
});

export const PushNotificationController = {
  registerToken,
  getUserTokens,
  sendTestNotification,
};
