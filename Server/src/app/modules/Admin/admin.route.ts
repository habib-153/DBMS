import express from 'express';
import auth from '../../middlewares/auth';
import { AdminControllers } from './admin.controller';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.get(
  '/stats',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  AdminControllers.getAdminStats
);

router.get(
  '/dashboard-overview',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  AdminControllers.getDashboardOverview
);

router.get(
  '/active-sessions',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  AdminControllers.getActiveSessions
);

router.get(
  '/location-stats',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  AdminControllers.getLocationStats
);

export const AdminRoutes = router;
