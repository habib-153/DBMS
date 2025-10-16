"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
const createNotification = (notificationData) => __awaiter(void 0, void 0, void 0, function* () {
    const notificationId = generateUuid();
    const now = new Date();
    const query = `
    INSERT INTO notifications (
      id, "userId", type, title, message, data, "isRead", "isPush", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
    RETURNING *
  `;
    const values = [
        notificationId,
        notificationData.userId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.data ? JSON.stringify(notificationData.data) : null,
        notificationData.isPush || false,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdNotification = result.rows[0];
    if (!createdNotification) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create notification');
    }
    return createdNotification;
});
const getUserNotifications = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 50) {
    const query = `
    SELECT * FROM notifications
    WHERE "userId" = $1
    ORDER BY "createdAt" DESC
    LIMIT $2
  `;
    const result = yield database_1.default.query(query, [userId, limit]);
    return result.rows;
});
const getUnreadNotifications = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM notifications
    WHERE "userId" = $1 AND "isRead" = false
    ORDER BY "createdAt" DESC
  `;
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const markAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE notifications
    SET "isRead" = true
    WHERE id = $1
  `;
    yield database_1.default.query(query, [notificationId]);
});
const markAllAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE notifications
    SET "isRead" = true
    WHERE "userId" = $1 AND "isRead" = false
  `;
    yield database_1.default.query(query, [userId]);
});
const deleteNotification = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    DELETE FROM notifications
    WHERE id = $1
  `;
    yield database_1.default.query(query, [notificationId]);
});
// Create geofence warning notification
const createGeofenceWarning = (userId, zoneName, riskLevel) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield createNotification({
        userId,
        type: 'GEOFENCE_WARNING',
        title: '⚠️ Entering High-Crime Area',
        message: `You are approaching ${zoneName}, a ${riskLevel.toLowerCase()}-risk zone. Stay cautious or consider an alternative route.`,
        data: { zoneName, riskLevel },
        isPush: true,
    });
    // Send push notification asynchronously
    Promise.resolve().then(() => __importStar(require('../PushNotification/push.service'))).then(({ PushNotificationService }) => {
        PushNotificationService.sendGeofenceWarningPush(userId, zoneName, riskLevel);
    })
        .catch((err) => console.error('Failed to send push notification:', err));
    return notification;
});
exports.NotificationService = {
    createNotification,
    getUserNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createGeofenceWarning,
};
