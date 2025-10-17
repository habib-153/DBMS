"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notification_controller_1 = require("./notification.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const router = express_1.default.Router();
// Get user notifications with optional limit
router.get('/', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.getUserNotifications);
// Get unread notifications only
router.get('/unread', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.getUnreadNotifications);
// Mark specific notification as read
router.patch('/:notificationId/read', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.markAsRead);
// Mark all notifications as read
router.patch('/mark-all-read', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.markAllAsRead);
// Delete notification
router.delete('/:notificationId', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.SUPER_ADMIN), notification_controller_1.NotificationController.deleteNotification);
exports.NotificationRoutes = router;
