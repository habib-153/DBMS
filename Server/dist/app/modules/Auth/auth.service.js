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
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const verifyJWT_1 = require("../../utils/verifyJWT");
const emailSender_1 = require("../../utils/emailSender");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user already exists
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (existingUser) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This user already exists!');
    }
    // Check if phone number already exists (if provided)
    if (payload.phone) {
        const existingPhone = yield prisma_1.default.user.findUnique({
            where: { phone: payload.phone },
        });
        if (existingPhone) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This phone number is already registered!');
        }
    }
    console.log(payload);
    // Hash the password
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.bcrypt_salt_rounds));
    const newUser = yield prisma_1.default.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
            phone: payload.phone,
            address: payload.address,
            profilePhoto: payload.profilePhoto,
            role: client_1.UserRole.USER,
            status: client_1.UserStatus.ACTIVE,
            isVerified: false,
            needPasswordChange: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isVerified: true,
            createdAt: true,
        },
    });
    // Create JWT payload
    const jwtPayload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
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
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === client_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password incorrect');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userData.id,
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === client_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const isCorrectPassword = yield bcryptjs_1.default.compare(payload.oldPassword, user.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password incorrect');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
            passwordChangedAt: new Date(),
        },
    });
    return null;
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { id, iat } = decoded;
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === client_1.UserStatus.DELETED) {
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
    };
    const accessToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === client_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
    };
    const resetToken = (0, verifyJWT_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, '10m');
    const resetUILink = `${config_1.default.jwt_refresh_expires_in}/reset-password?id=${user.id}&token=${resetToken}`;
    yield emailSender_1.EmailHelper.sendEmail(user.email, resetUILink);
    return null;
});
const resetPassword = (payload, token) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
    }
    if (user.status === client_1.UserStatus.BLOCKED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
    }
    if (user.status === client_1.UserStatus.DELETED) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
    }
    const decoded = (0, verifyJWT_1.verifyToken)(token, config_1.default.jwt_access_secret);
    if (payload.email !== decoded.email) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are forbidden!');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
        where: { email: decoded.email },
        data: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
        },
    });
    return null;
});
const sendOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const response = yield axios_1.default.post('https://textbelt.com/text', {
            phone: payload.phone,
            message: `Your verification code is ${otp}`,
            key: process.env.TEXTBELT_API_KEY || 'textbelt',
        });
        if (!response.data.success) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to send OTP');
        }
        return { otp };
    }
    catch (_a) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to send OTP');
    }
});
const verifyOTP = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.otp !== payload.otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { email: payload.email },
        data: {
            isVerified: true,
            otp: null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
        },
    });
    return updatedUser;
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
