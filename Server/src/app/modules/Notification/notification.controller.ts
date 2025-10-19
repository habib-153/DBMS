import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { NotificationService } from './notification.service';
import { catchAsync } from '../../utils/catchAsync';

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 50;

  // if (!userId) {
  //   return sendResponse(res, {
  //     statusCode: httpStatus.UNAUTHORIZED,
  //     success: false,
  //     message: 'User not authenticated',
  //     data: null,
  //   });
  // }

  const notifications = await NotificationService.getUserNotifications(
    userId,
    limit
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: notifications,
  });
});

const getUnreadNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, {
        statusCode: httpStatus.UNAUTHORIZED,
        success: false,
        message: 'User not authenticated',
        data: null,
      });
    }

    const notifications = await NotificationService.getUnreadNotifications(
      userId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Unread notifications retrieved successfully',
      data: notifications,
    });
  }
);

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  await NotificationService.markAsRead(notificationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'User not authenticated',
      data: null,
    });
  }

  await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: null,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  await NotificationService.deleteNotification(notificationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted successfully',
    data: null,
  });
});

export const NotificationController = {
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
