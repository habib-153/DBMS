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
router.get('/:id', UserController.getUserById);
router.put('/:id', auth(USER_ROLE.ADMIN, USER_ROLE.USER), UserController.updateUser);
router.delete('/:id', auth(USER_ROLE.ADMIN), UserController.deleteUser);

