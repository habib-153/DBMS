import express from 'express';
import { SessionController } from './session.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// Get all user sessions
router.get('/all', auth('USER', 'ADMIN'), SessionController.getUserSessions);

// Get active sessions only
router.get(
  '/active',
  auth('USER', 'ADMIN'),
  SessionController.getActiveSessions
);

// End a specific session
router.post('/end', auth('USER', 'ADMIN'), SessionController.endSession);

// End all user sessions (logout from all devices)
router.post(
  '/end-all',
  auth('USER', 'ADMIN'),
  SessionController.endAllSessions
);

export const SessionRoutes = router;
