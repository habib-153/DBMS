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
exports.UserServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_constant_1 = require("./user.constant");
const user_model_1 = require("./user.model");
const twilio_1 = __importDefault(require("twilio"));
const config_1 = __importDefault(require("../../config"));
const axios_1 = __importDefault(require("axios"));
const client = (0, twilio_1.default)(config_1.default.twilio_account_sid, config_1.default.twilio_auth_token);
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.create(payload);
    return user;
});
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const users = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(user_constant_1.UserSearchableFields);
    const result = yield users.modelQuery;
    const meta = yield users.countTotal();
    return { result, meta };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    return user;
});
// const sendOTP = async (phoneNumber: string) => {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const msg = await client.messages.create({
//     body: `Your verification code is ${otp}`,
//     messagingServiceSid: 'MGf5c03b6b9fcb762eded2ef840d5d338e',
//     to: phoneNumber,
//   });
//   console.log(msg);
//   return otp;
// };
// const verifyOTP = async (email: string, otp: string) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   if (user.otp !== otp) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP');
//   }
//   user.isVerified = true;
//   user.otp = undefined;
//   await user.save();
//   return user;
// };
const sendOTP = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const response = yield axios_1.default.post('https://textbelt.com/text', {
            phone: phoneNumber,
            message: `Your verification code is ${otp}`,
            key: '047227e7af6950731f76e101f90fd839e83f6b79dbwERYOJulry8A2hSrzwfsCbb', // Use 'textbelt' for free API key
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
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    user.isVerified = true;
    user.otp = undefined;
    yield user.save();
    return user;
});
// const getVerified = async (
//   payload: Partial<TUser>,
//   userData: Record<string, unknown>
// ) => {
//   const { email, _id } = userData;
//   const user = await User.isUserExistsByEmail(email as string);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
//   }
// };
const updateUserIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndDelete(id);
    return result;
});
exports.UserServices = {
    createUser,
    getAllUsersFromDB,
    getSingleUserFromDB,
    sendOTP,
    verifyOTP,
    updateUserIntoDB,
    deleteUserFromDB,
};
