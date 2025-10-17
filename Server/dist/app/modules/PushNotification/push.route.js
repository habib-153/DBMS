"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const push_controller_1 = require("./push.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
// Register FCM token
router.post('/register', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), push_controller_1.PushNotificationController.registerToken);
// Get user's registered tokens
router.get('/tokens', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), push_controller_1.PushNotificationController.getUserTokens);
// Send test notification (for development/testing)
router.post('/test', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), push_controller_1.PushNotificationController.sendTestNotification);
exports.PushNotificationRoutes = router;
