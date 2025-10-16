import express from 'express';
import { PushNotificationController } from './push.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Register FCM token
router.post(
  '/register',
  auth('USER', 'ADMIN'),
  PushNotificationController.registerToken
);

// Get user's registered tokens
router.get(
  '/tokens',
  auth('USER', 'ADMIN'),
  PushNotificationController.getUserTokens
);

// Send test notification (for development/testing)
router.post(
  '/test',
  auth('USER', 'ADMIN'),
  PushNotificationController.sendTestNotification
);

export const PushNotificationRoutes = router;
