'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthServices = void 0;
const bcryptjs_1 = __importDefault(require('bcryptjs'));
const http_status_1 = __importDefault(require('http-status'));
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const config_1 = __importDefault(require('../../config'));
const AppError_1 = __importDefault(require('../../errors/AppError'));
const verifyJWT_1 = require('../../utils/verifyJWT');
const user_constant_1 = require('../User/user.constant');
const user_model_1 = require('../User/user.model');
const emailSender_1 = require('../../utils/emailSender');
const registerUser = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield user_model_1.User.isUserExistsByEmail(
      payload === null || payload === void 0 ? void 0 : payload.email
    );
    if (user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'This user is already exist!'
      );
    }
    payload.role = user_constant_1.USER_ROLE.USER;
    //create new user
    const newUser = yield user_model_1.User.create(payload);
    //create token and sent to the  client
    const jwtPayload = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
    };
    const accessToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_access_secret,
      config_1.default.jwt_access_expires_in
    );
    const refreshToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_refresh_secret,
      config_1.default.jwt_refresh_expires_in
    );
    return {
      accessToken,
      refreshToken,
    };
  });
const loginUser = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield user_model_1.User.isUserExistsByEmail(
      payload === null || payload === void 0 ? void 0 : payload.email
    );
    if (!user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'This user is not found!'
      );
    }
    //checking if the password is correct
    if (
      !(yield user_model_1.User.isPasswordMatched(
        payload === null || payload === void 0 ? void 0 : payload.password,
        user === null || user === void 0 ? void 0 : user.password
      ))
    )
      throw new AppError_1.default(
        http_status_1.default.FORBIDDEN,
        'Password do not matched'
      );
    //create token and sent to the  client
    const jwtPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
    const accessToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_access_secret,
      config_1.default.jwt_access_expires_in
    );
    const refreshToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_refresh_secret,
      config_1.default.jwt_refresh_expires_in
    );
    return {
      accessToken,
      refreshToken,
    };
  });
const changePassword = (userData, payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield user_model_1.User.isUserExistsByEmail(userData.email);
    if (!user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'This user is not found!'
      );
    }
    // checking if the user is blocked
    //checking if the password is correct
    if (
      !(yield user_model_1.User.isPasswordMatched(
        payload.oldPassword,
        user === null || user === void 0 ? void 0 : user.password
      ))
    )
      throw new AppError_1.default(
        http_status_1.default.FORBIDDEN,
        'Password do not matched'
      );
    //hash new password
    const newHashedPassword = yield bcryptjs_1.default.hash(
      payload.newPassword,
      Number(config_1.default.bcrypt_salt_rounds)
    );
    yield user_model_1.User.findOneAndUpdate(
      {
        email: userData.email,
        role: userData.role,
      },
      {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
      }
    );
    return null;
  });
const refreshToken = (token) =>
  __awaiter(void 0, void 0, void 0, function* () {
    // checking if the given token is valid
    const decoded = jsonwebtoken_1.default.verify(
      token,
      config_1.default.jwt_refresh_secret
    );
    const { email, iat } = decoded;
    // checking if the user is exist
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'This user is not found!'
      );
    }
    if (
      user.passwordChangedAt &&
      user_model_1.User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat
      )
    ) {
      throw new AppError_1.default(
        http_status_1.default.UNAUTHORIZED,
        'You are not authorized !'
      );
    }
    const jwtPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
    const accessToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_access_secret,
      config_1.default.jwt_access_expires_in
    );
    return {
      accessToken,
    };
  });
const forgetPassword = (userEmail) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByEmail(userEmail);
    if (!user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'User does not exist!'
      );
    }
    const jwtPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
    const resetToken = (0, verifyJWT_1.createToken)(
      jwtPayload,
      config_1.default.jwt_access_secret,
      '20m'
    );
    const resetUILink = `${config_1.default.reset_pass_ui_link}?email=${user.email}&token=${resetToken} `;
    yield emailSender_1.EmailHelper.sendEmail(user.email, resetUILink);
  });
const resetPassword = (payload, token) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExistsByEmail(payload.email);
    if (!user) {
      throw new AppError_1.default(
        http_status_1.default.NOT_FOUND,
        'This user is not found!'
      );
    }
    const decoded = jsonwebtoken_1.default.verify(
      token,
      config_1.default.jwt_access_secret
    );
    if (payload.email !== decoded.email) {
      throw new AppError_1.default(
        http_status_1.default.FORBIDDEN,
        'You are forbidden!'
      );
    }
    //hash new password
    const newHashedPassword = yield bcryptjs_1.default.hash(
      payload.newPassword,
      Number(config_1.default.bcrypt_salt_rounds)
    );
    yield user_model_1.User.findOneAndUpdate(
      {
        email: decoded.email,
        role: decoded.role,
      },
      {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
      }
    );
    return null;
  });
exports.AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
