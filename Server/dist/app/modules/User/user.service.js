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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const axios_1 = __importDefault(require("axios"));
const user_constant_1 = require("./user.constant");
const paginationHelper_1 = require("../../utils/paginationHelper");
const getAllUsers = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip } = paginationHelper_1.paginationHelper.calculatePagination(paginationOptions);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    andConditions.push({
        status: {
            not: client_1.UserStatus.DELETED,
        },
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const users = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            profilePhoto: true,
            role: true,
            status: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: users,
    };
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            profilePhoto: true,
            role: true,
            status: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            posts: {
                include: {
                    votes: true,
                    comments: true,
                    _count: {
                        select: {
                            votes: true,
                            comments: true,
                        },
                    },
                },
            },
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
const updateUser = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            profilePhoto: true,
            role: true,
            status: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedUser;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    yield prisma_1.default.user.update({
        where: { id },
        data: {
            status: client_1.UserStatus.DELETED,
        },
    });
    return { message: 'User deleted successfully' };
});
// const changePassword = async (
//   userId: string,
//   passwordData: TChangePassword
// ) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//   });
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   const isCorrectPassword = await bcrypt.compare(
//     passwordData.oldPassword,
//     user.password
//   );
//   if (!isCorrectPassword) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect');
//   }
//   const hashedPassword = await bcrypt.hash(
//     passwordData.newPassword,
//     Number(config.bcrypt_salt_rounds)
//   );
//   await prisma.user.update({
//     where: { id: userId },
//     data: {
//       password: hashedPassword,
//       needPasswordChange: false,
//       passwordChangedAt: new Date(),
//     },
//   });
//   return { message: 'Password changed successfully' };
// };
const sendOTP = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const response = yield axios_1.default.post('https://textbelt.com/text', {
            phone: phoneNumber,
            message: `Your verification code is ${otp}`,
            key: '047227e7af6950731f76e101f90fd839e83f6b79dbwERYOJulry8A2hSrzwfsCbb',
        });
        console.log('OTP response:', response.data);
        if (!response.data.success) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to send OTP');
        }
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to send OTP');
    }
    return otp;
});
const verifyOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    const updatedUser = yield prisma_1.default.user.update({
        where: { email },
        data: {
            isVerified: true,
            otp: null,
        },
    });
    return updatedUser;
});
exports.UserService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    sendOTP,
    verifyOTP,
};
