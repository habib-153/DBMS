"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("./user.constant");
const router = express_1.default.Router();
exports.UserRoutes = router;
// router.put(
//   '/get-verified',
//   auth(USER_ROLE.USER, USER_ROLE.ADMIN),
//   UserControllers.getVerified
// );
// router.post('/send-otp', UserController.sendOTPController);
// router.post('/verify-otp', UserController.verifyOTPController);
router.get('/', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), user_controller_1.UserController.getAllUsers);
// Follow routes integrated with user routes - MUST be before /:id routes
router.post('/follow/:followedId', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), user_controller_1.UserController.followUser);
router.delete('/unfollow/:followedId', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), user_controller_1.UserController.unfollowUser);
router.get('/:id', user_controller_1.UserController.getUserById);
router.put('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), user_controller_1.UserController.updateUser);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN), user_controller_1.UserController.deleteUser);
