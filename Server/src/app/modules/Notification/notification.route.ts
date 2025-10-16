import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Get user notifications with optional limit
router.get(
  '/',
  auth('USER', 'ADMIN'),
  NotificationController.getUserNotifications
);

// Get unread notifications only
router.get(
  '/unread',
  auth('USER', 'ADMIN'),
  NotificationController.getUnreadNotifications
);

// Mark specific notification as read
router.patch(
  '/:notificationId/read',
  auth('USER', 'ADMIN'),
  NotificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  auth('USER', 'ADMIN'),
  NotificationController.markAllAsRead
);

// Delete notification
router.delete(
  '/:notificationId',
  auth('USER', 'ADMIN'),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
