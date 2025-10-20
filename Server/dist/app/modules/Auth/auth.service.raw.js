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
exports.AuthServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = require("crypto");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const verifyJWT_1 = require("../../utils/verifyJWT");
const emailSender_1 = require("../../utils/emailSender");
const session_service_1 = require("../Session/session.service");
const geofence_service_1 = require("../Geofence/geofence.service");
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user already exists
    const existingUserQuery = `
    SELECT id, email FROM users 
    WHERE email = $1
  `;
    const existingUserResult = yield database_1.default.query(existingUserQuery, [payload.email]);
    if (existingUserResult.rows.length > 0) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists with this email!');
    }
    // Check if phone number already exists (if provided)
    if (payload.phone) {
        const existingPhoneQuery = `
      SELECT id, phone FROM users 
      WHERE phone = $1
    `;
        const existingPhoneResult = yield database_1.default.query(existingPhoneQuery, [payload.phone]);
        if (existingPhoneResult.rows.length > 0) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists with this phone number!');
        }
    }
    // Hash the password
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const userId = generateUuid();
    const now = new Date();
    // Create new user
    const createUserQuery = `
    INSERT INTO users (
      id, name, email, password, phone, address, "profilePhoto", 
      role, status, "isVerified", "needPasswordChange", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'USER', 'ACTIVE', false, false, $8, $9)
    RETURNING id, name, email, phone, role, status, "isVerified", "createdAt"
  `;
    const values = [
        userId,
        payload.name,
        payload.email,
        hashedPassword,
        payload.phone || null,
        payload.address || null,
        payload.profilePhoto || null,
        now,
        now,
    ];
    const result = yield database_1.default.query(createUserQuery, values);
    const newUser = result.rows[0];
    if (!newUser) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user');
    }
    // After creating user, generate an OTP and send to the user's email.
    // Store OTP and expiry in the users table so we can verify later.
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const otpUpdateQuery = `
    UPDATE users
    SET otp = $1, otp_expires_at = $2, "updatedAt" = $3
    WHERE id = $4
  `;
    yield database_1.default.query(otpUpdateQuery, [
        otp,
        otpExpiresAt,
        new Date(),
        newUser.id,
    ]);
    // send OTP email
    yield emailSender_1.EmailHelper.sendOtpEmail(newUser.email, otp);
    // Return created user (no tokens). Client must verify OTP before login or posting.
    return {
        user: newUser,
        message: 'OTP sent to email. Please verify to complete registration.',
    };
});
const loginUser = (payload, requestMetadata) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, name, email, password, phone, role, status, "profilePhoto", "isVerified"
    FROM users
    WHERE email = $1
  `;
    const result = yield database_1.default.query(userQuery, [payload.email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === 'DELETED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Incorrect password');
    }
    // Check if user email is verified
    if (!user.isVerified) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Please verify your email before logging in. Check your inbox for the verification code.');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
    };
    // jwtPayload prepared for token creation when needed
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    // Track user session asynchronously (don't block login)
    if (requestMetadata) {
        session_service_1.SessionService.createSession({
            userId: user.id,
            sessionToken: generateUuid(),
            ipAddress: requestMetadata.ipAddress || undefined,
            userAgent: requestMetadata.userAgent || undefined,
        }).catch((err) => {
            // Log error but don't fail login
            console.error('Failed to create session:', err);
        });
        // Track user location if provided
        if (requestMetadata.latitude && requestMetadata.longitude) {
            geofence_service_1.GeofenceService.recordUserLocation({
                userId: user.id,
                latitude: requestMetadata.latitude,
                longitude: requestMetadata.longitude,
            }, user.id).catch((err) => {
                // Log error but don't fail login
                console.error('Failed to record location:', err);
            });
        }
    }
    return {
        accessToken,
        refreshToken,
    };
});
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, password, status
    FROM users
    WHERE id = $1
  `;
    const result = yield database_1.default.query(userQuery, [userData.id]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === 'DELETED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.oldPassword, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateQuery = `
    UPDATE users 
    SET password = $1, "needPasswordChange" = false, "passwordChangedAt" = $2, "updatedAt" = $3
    WHERE id = $4
  `;
    yield database_1.default.query(updateQuery, [
        hashedPassword,
        new Date(),
        new Date(),
        userData.id,
    ]);
    return null;
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { id, iat } = decoded;
    const userQuery = `
    SELECT id, name, email, phone, role, status, "passwordChangedAt", "isVerified"
    FROM users 
    WHERE id = $1
  `;
    const result = yield database_1.default.query(userQuery, [id]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === 'DELETED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    if (user.passwordChangedAt &&
        new Date(iat * 1000) < user.passwordChangedAt) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, name, email, phone, role, status, "profilePhoto", "isVerified"
    FROM users 
    WHERE email = $1
  `;
    const result = yield database_1.default.query(userQuery, [email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === 'DELETED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
    };
    const resetToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, '10m');
    const resetUILink = `${config_1.default.reset_pass_ui_link}?email=${encodeURIComponent(user.email)}&token=${resetToken}`;
    yield emailSender_1.EmailHelper.sendEmail(user.email, resetUILink);
    return null;
});
const resetPassword = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, email, status
    FROM users 
    WHERE email = $1
  `;
    const result = yield database_1.default.query(userQuery, [payload.email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === 'BLOCKED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === 'DELETED') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_access_secret);
    if (payload.email !== decoded.email) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are forbidden!');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const updateQuery = `
    UPDATE users 
    SET password = $1, "passwordChangedAt" = $2, "updatedAt" = $3
    WHERE email = $4
  `;
    yield database_1.default.query(updateQuery, [
        hashedPassword,
        new Date(),
        new Date(),
        decoded.email,
    ]);
    return null;
});
const sendOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        // Check existing OTP expiry to rate-limit resends
        const userQuery = `
      SELECT id, otp, otp_expires_at, "updatedAt"
      FROM users
      WHERE email = $1
    `;
        const userResult = yield database_1.default.query(userQuery, [payload.email]);
        const user = userResult.rows[0];
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
        }
        // If there's an existing OTP and it's still valid, prevent immediate resend
        if (user.otp_expires_at &&
            new Date(String(user.otp_expires_at)) > new Date()) {
            // calculate seconds remaining
            const remainingMs = new Date(String(user.otp_expires_at)).getTime() - Date.now();
            const remainingSec = Math.ceil(remainingMs / 1000);
            throw new AppError_1.default(http_status_1.default.TOO_MANY_REQUESTS, `OTP already sent. Please wait ${remainingSec} seconds before requesting a new one.`);
        }
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const updateQuery = `
      UPDATE users 
      SET otp = $1, otp_expires_at = $2, "updatedAt" = $3
      WHERE email = $4
    `;
        yield database_1.default.query(updateQuery, [
            otp,
            otpExpiresAt,
            new Date(),
            payload.email,
        ]);
        yield emailSender_1.EmailHelper.sendOtpEmail(payload.email, otp);
        return { message: 'OTP sent successfully' };
    }
    catch (err) {
        if (err instanceof AppError_1.default)
            throw err;
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
    }
});
const verifyOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userQuery = `
    SELECT id, email, otp, status
    FROM users 
    WHERE email = $1
  `;
    const result = yield database_1.default.query(userQuery, [payload.email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (!user.otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No OTP found. Please request a new one.');
    }
    // Check expiry
    const expiryQuery = `
    SELECT otp_expires_at FROM users WHERE email = $1
  `;
    const expiryRes = yield database_1.default.query(expiryQuery, [payload.email]);
    const otpExpiresAt = (_a = expiryRes.rows[0]) === null || _a === void 0 ? void 0 : _a.otp_expires_at;
    if (otpExpiresAt && new Date(String(otpExpiresAt)) < new Date()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP has expired. Please request a new one.');
    }
    if (user.otp !== payload.otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    // Update user as verified and clear OTP
    const updateQuery = `
    UPDATE users 
    SET "isVerified" = true, otp = NULL, otp_expires_at = NULL, "updatedAt" = $1
    WHERE id = $2
  `;
    yield database_1.default.query(updateQuery, [new Date(), user.id]);
    // return tokens so client can auto-login
    const jwtPayloadQuery = `
    SELECT id, name, email, phone, role, status, "profilePhoto"
    FROM users
    WHERE id = $1
  `;
    const userRow = yield database_1.default.query(jwtPayloadQuery, [user.id]);
    const verifiedUser = userRow.rows[0];
    const jwtPayload = {
        id: String(verifiedUser.id),
        name: String(verifiedUser.name),
        email: String(verifiedUser.email),
        phone: String(verifiedUser.phone),
        role: verifiedUser.role,
        status: verifiedUser.status,
        profilePhoto: verifiedUser.profilePhoto,
        isVerified: true,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return { message: 'User verified successfully', accessToken, refreshToken };
});
const logoutUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Mark all active sessions as inactive
    const updateQuery = `
    UPDATE user_sessions 
    SET "isActive" = false, "lastActivity" = NOW()
    WHERE "userId" = $1 AND "isActive" = true
  `;
    yield database_1.default.query(updateQuery, [userId]);
});
exports.AuthServices = {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
    verifyOTP,
    sendOTP,
};
