import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';

const router = express.Router();

export const UserRoutes = router;

// router.put(
//   '/get-verified',
//   auth(USER_ROLE.USER, USER_ROLE.ADMIN),
//   UserControllers.getVerified
// );

// router.post('/send-otp', UserController.sendOTPController);
// router.post('/verify-otp', UserController.verifyOTPController);

router.get('/', auth(USER_ROLE.ADMIN), UserController.getAllUsers);

// Follow routes integrated with user routes - MUST be before /:id routes
router.post(
  '/follow/:followedId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.followUser
);
router.delete(
  '/unfollow/:followedId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  UserController.unfollowUser
);

router.get('/:id', UserController.getUserById);
router.put(
  '/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  UserController.updateUser
);
router.delete('/:id', auth(USER_ROLE.ADMIN), UserController.deleteUser);
