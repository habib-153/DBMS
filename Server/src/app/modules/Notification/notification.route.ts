import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Get user notifications with optional limit
router.get(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.getUserNotifications
);

// Get unread notifications only
router.get(
  '/unread',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.getUnreadNotifications
);

// Mark specific notification as read
router.patch(
  '/:notificationId/read',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  '/mark-all-read',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.markAllAsRead
);

// Delete notification
router.delete(
  '/:notificationId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
