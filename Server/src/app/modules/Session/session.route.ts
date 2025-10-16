import express from 'express';
import { SessionController } from './session.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

// Get all user sessions
router.get(
  '/all',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  SessionController.getUserSessions
);

// Get active sessions only
router.get(
  '/active',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  SessionController.getActiveSessions
);

// End a specific session
router.post(
  '/end',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  SessionController.endSession
);

// End all user sessions (logout from all devices)
router.post(
  '/end-all',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  SessionController.endAllSessions
);

// Update current session with location data
router.patch(
  '/update-location',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  SessionController.updateSessionLocation
);

export const SessionRoutes = router;
