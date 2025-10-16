import express from 'express';
import auth from '../../middlewares/auth';
import { AdminControllers } from './admin.controller';

const router = express.Router();

router.get(
  '/stats',
  auth('ADMIN', 'SUPER_ADMIN'),
  AdminControllers.getAdminStats
);

router.get(
  '/dashboard-overview',
  auth('ADMIN', 'SUPER_ADMIN'),
  AdminControllers.getDashboardOverview
);

router.get(
  '/active-sessions',
  auth('ADMIN', 'SUPER_ADMIN'),
  AdminControllers.getActiveSessions
);

router.get(
  '/location-stats',
  auth('ADMIN', 'SUPER_ADMIN'),
  AdminControllers.getLocationStats
);

export const AdminRoutes = router;
