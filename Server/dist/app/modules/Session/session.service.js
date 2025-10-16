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
exports.SessionService = void 0;
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
// Parse User-Agent string to extract browser, OS, and device info
const parseUserAgent = (userAgent) => {
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';
    // Browser detection
    if (userAgent.includes('Chrome'))
        browser = 'Chrome';
    else if (userAgent.includes('Firefox'))
        browser = 'Firefox';
    else if (userAgent.includes('Safari'))
        browser = 'Safari';
    else if (userAgent.includes('Edge'))
        browser = 'Edge';
    else if (userAgent.includes('Opera'))
        browser = 'Opera';
    // OS detection
    if (userAgent.includes('Windows'))
        os = 'Windows';
    else if (userAgent.includes('Mac'))
        os = 'MacOS';
    else if (userAgent.includes('Linux'))
        os = 'Linux';
    else if (userAgent.includes('Android'))
        os = 'Android';
    else if (userAgent.includes('iOS'))
        os = 'iOS';
    // Device detection
    if (userAgent.includes('Mobile'))
        device = 'Mobile';
    else if (userAgent.includes('Tablet'))
        device = 'Tablet';
    return { browser, os, device };
};
const createSession = (sessionData) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = generateUuid();
    const sessionToken = (0, crypto_1.randomBytes)(32).toString('hex');
    const now = new Date();
    // Parse user agent if provided
    let browser = sessionData.browser;
    let os = sessionData.os;
    let device = sessionData.device;
    if (sessionData.userAgent && !browser) {
        const parsed = parseUserAgent(sessionData.userAgent);
        browser = parsed.browser;
        os = parsed.os;
        device = parsed.device;
    }
    const query = `
    INSERT INTO user_sessions (
      id, "userId", "sessionToken", "ipAddress", "userAgent",
      browser, os, device, country, city, latitude, longitude,
      "isActive", "lastActivity", "loginAt", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, $14, $15)
    RETURNING *
  `;
    const values = [
        sessionId,
        sessionData.userId,
        sessionToken,
        sessionData.ipAddress || null,
        sessionData.userAgent || null,
        browser || null,
        os || null,
        device || null,
        sessionData.country || null,
        sessionData.city || null,
        sessionData.latitude || null,
        sessionData.longitude || null,
        now,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdSession = result.rows[0];
    if (!createdSession) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create session');
    }
    return createdSession;
});
const getActiveUserSessions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM user_sessions
    WHERE "userId" = $1 AND "isActive" = true
    ORDER BY "lastActivity" DESC
  `;
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const getAllUserSessions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM user_sessions
    WHERE "userId" = $1
    ORDER BY "loginAt" DESC
    LIMIT 50
  `;
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const updateSessionActivity = (sessionToken) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE user_sessions
    SET "lastActivity" = $1
    WHERE "sessionToken" = $2 AND "isActive" = true
  `;
    yield database_1.default.query(query, [new Date(), sessionToken]);
});
const endSession = (sessionToken) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE user_sessions
    SET "isActive" = false, "logoutAt" = $1
    WHERE "sessionToken" = $2
  `;
    yield database_1.default.query(query, [new Date(), sessionToken]);
});
const endAllUserSessions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    UPDATE user_sessions
    SET "isActive" = false, "logoutAt" = $1
    WHERE "userId" = $2 AND "isActive" = true
  `;
    yield database_1.default.query(query, [new Date(), userId]);
});
exports.SessionService = {
    createSession,
    getActiveUserSessions,
    getAllUserSessions,
    updateSessionActivity,
    endSession,
    endAllUserSessions,
    parseUserAgent,
};
