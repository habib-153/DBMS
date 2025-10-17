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
const database_1 = __importDefault(require("../../shared/database"));
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Prefer Authorization header but fall back to http-only cookie named 'accessToken'
        let token = req.headers.authorization;
        if (!token) {
            // Try cookie fallback
            const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
            if (cookieToken) {
                token = cookieToken;
            }
        }
        // checking if the token is missing
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = (0, verifyJWT_1.verifyToken)(cleanToken, config_1.default.jwt_access_secret);
        const { role, email, iat } = decoded;
        // checking if the user exists using raw SQL
        const userQuery = `
      SELECT id, email, role, status, "passwordChangedAt", "isVerified"
      FROM users 
      WHERE email = $1
    `;
        const result = yield database_1.default.query(userQuery, [email]);
        const user = result.rows[0];
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found!');
        }
        // Check if user is blocked or deleted
        if (user.status === 'BLOCKED') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked!');
        }
        if (user.status === 'DELETED') {
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
