import httpStatus from 'http-status';
import config from '../../config';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service.raw';
import { catchAsync } from '../../utils/catchAsync';

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);
  interface IRegisterResult {
    user: unknown;
    message?: string;
  }

  const { user, message } = result as IRegisterResult;

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: message || 'User registered successfully!',
    data: {
      user,
    },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const payload = req.body;

  // Extract request metadata for session tracking
  const requestMetadata = {
    ipAddress:
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      null,
    userAgent: req.headers['user-agent'] || null,
    latitude: payload.latitude || null,
    longitude: payload.longitude || null,
  };

  const result = await AuthServices.loginUser(payload, requestMetadata);
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePassword(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password updated successfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully!',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const userEmail = req?.body?.email;
  const result = await AuthServices.forgetPassword(userEmail);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  const result = await AuthServices.resetPassword(req.body, token as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successful!',
    data: result,
  });
});

const sendOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.sendOTP(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully',
    data: result,
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyOTP(req.body);

  // If service returned tokens, set refreshToken cookie
  if (result?.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
};
