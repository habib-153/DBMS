"use strict";
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
exports.PushNotificationService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../../../shared/database"));
const firebase_config_1 = require("../../config/firebase.config");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
const registerPushToken = (tokenData) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenId = generateUuid();
    const now = new Date();
    // Check if token already exists
    const existingToken = yield database_1.default.query('SELECT * FROM push_notification_tokens WHERE token = $1', [tokenData.token]);
    if (existingToken.rows.length > 0) {
        // Update existing token
        const updateQuery = `
      UPDATE push_notification_tokens
      SET "userId" = $1, platform = $2, "isActive" = true, "updatedAt" = $3
      WHERE token = $4
      RETURNING *
    `;
        const result = yield database_1.default.query(updateQuery, [
            tokenData.userId,
            tokenData.platform,
            now,
            tokenData.token,
        ]);
        return result.rows[0];
    }
    // Create new token
    const query = `
    INSERT INTO push_notification_tokens (
      id, "userId", token, platform, "isActive", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, true, $5, $6)
    RETURNING *
  `;
    const values = [
        tokenId,
        tokenData.userId,
        tokenData.token,
        tokenData.platform,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdToken = result.rows[0];
    if (!createdToken) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to register push token');
    }
    return createdToken;
});
const getUserPushTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM push_notification_tokens
    WHERE "userId" = $1 AND "isActive" = true
  `;
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const deactivateToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE push_notification_tokens
    SET "isActive" = false, "updatedAt" = $1
    WHERE token = $2
  `;
    yield database_1.default.query(query, [new Date(), token]);
});
const sendPushToUser = (userId, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = yield getUserPushTokens(userId);
    if (tokens.length === 0) {
        return { sent: 0, failed: 0 };
    }
    const tokenStrings = tokens.map((t) => t.token);
    let sent = 0;
    let failed = 0;
    // Send to each token individually to handle failures
    for (const token of tokenStrings) {
        const success = yield firebase_config_1.FirebaseService.sendPushNotification(token, title, body, data);
        if (success) {
            sent++;
        }
        else {
            failed++;
            // Deactivate invalid token
            yield deactivateToken(token);
        }
    }
    return { sent, failed };
});
const sendPushToMultipleUsers = (userIds, title, body, data) => __awaiter(void 0, void 0, void 0, function* () {
    let totalSent = 0;
    let totalFailed = 0;
    for (const userId of userIds) {
        const result = yield sendPushToUser(userId, title, body, data);
        totalSent += result.sent;
        totalFailed += result.failed;
    }
    return { sent: totalSent, failed: totalFailed };
});
const sendGeofenceWarningPush = (userId, zoneName, riskLevel) => __awaiter(void 0, void 0, void 0, function* () {
    const emoji = riskLevel === 'CRITICAL' ? '🚨' : '⚠️';
    yield sendPushToUser(userId, `${emoji} Danger Zone Alert`, `You are entering ${zoneName}, a ${riskLevel.toLowerCase()}-risk area. Stay cautious!`, {
        type: 'GEOFENCE_WARNING',
        zoneName,
        riskLevel,
    });
});
const sendPostStatusPush = (userId, postTitle, status) => __awaiter(void 0, void 0, void 0, function* () {
    const title = status === 'APPROVED' ? '✅ Post Approved' : '❌ Post Rejected';
    const body = status === 'APPROVED'
        ? `Your post "${postTitle}" has been approved and is now visible to everyone.`
        : `Your post "${postTitle}" has been rejected. Please check the guidelines.`;
    yield sendPushToUser(userId, title, body, {
        type: `POST_${status}`,
        postTitle,
    });
});
exports.PushNotificationService = {
    registerPushToken,
    getUserPushTokens,
    deactivateToken,
    sendPushToUser,
    sendPushToMultipleUsers,
    sendGeofenceWarningPush,
    sendPostStatusPush,
};
