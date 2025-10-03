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
    // Create JWT payload
    const jwtPayload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        profilePhoto: newUser.profilePhoto,
    };
    // Generate tokens
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        user: newUser,
        accessToken,
        refreshToken,
    };
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, name, email, password, phone, role, status, "profilePhoto"
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
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password do not matched');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
    };
    console.log(jwtPayload);
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
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
    SELECT id, name, email, phone, role, status, "passwordChangedAt"
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
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = `
    SELECT id, name, email, phone, role, status
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
    };
    const resetToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, '10m');
    const resetUILink = `${config_1.default.jwt_refresh_expires_in}/reset-password?id=${user.id}&token=${resetToken}`;
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
        const updateQuery = `
      UPDATE users 
      SET otp = $1, "updatedAt" = $2
      WHERE email = $3
    `;
        yield database_1.default.query(updateQuery, [otp, new Date(), payload.email]);
        yield emailSender_1.EmailHelper.sendEmail(payload.email, otp);
        return { message: 'OTP sent successfully' };
    }
    catch (_a) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
    }
});
const verifyOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (user.otp !== payload.otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    // Update user as verified and clear OTP
    const updateQuery = `
    UPDATE users 
    SET "isVerified" = true, otp = NULL, "updatedAt" = $1
    WHERE id = $2
  `;
    yield database_1.default.query(updateQuery, [new Date(), user.id]);
    return { message: 'User verified successfully' };
});
exports.AuthServices = {
    registerUser,
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword,
    verifyOTP,
    sendOTP,
};
