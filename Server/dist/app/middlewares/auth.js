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
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const catchAsync_1 = require("../utils/catchAsync");
const verifyJWT_1 = require("../utils/verifyJWT");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        // checking if the token is missing
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = (0, verifyJWT_1.verifyToken)(cleanToken, config_1.default.jwt_access_secret);
        const { role, email, iat } = decoded;
        // checking if the user is exist
        const user = yield prisma_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                passwordChangedAt: true,
                isVerified: true,
            },
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
        }
        // Check if user is blocked or deleted
        if (user.status === client_1.UserStatus.BLOCKED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
        }
        if (user.status === client_1.UserStatus.DELETED) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted!');
        }
        // Check if JWT was issued before password change
        if (user.passwordChangedAt &&
            iat &&
            new Date(iat * 1000) < user.passwordChangedAt) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        // Check if user role is authorized
        if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
