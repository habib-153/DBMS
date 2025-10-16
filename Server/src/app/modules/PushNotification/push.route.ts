import express from 'express';
import { PushNotificationController } from './push.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Register FCM token
router.post(
  '/register',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PushNotificationController.registerToken
);

// Get user's registered tokens
router.get(
  '/tokens',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PushNotificationController.getUserTokens
);

// Send test notification (for development/testing)
router.post(
  '/test',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PushNotificationController.sendTestNotification
);

export const PushNotificationRoutes = router;
