import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';

import config from '../../config';
import database from '../../../shared/database';
import AppError from '../../errors/AppError';
import { createToken, verifyToken } from '../../utils/verifyJWT';
import { EmailHelper } from '../../utils/emailSender';
import {
  TRegisterUser,
  TLoginUser,
  TChangePassword,
  TResetPassword,
  TSendOTP,
  TVerifyOTP,
} from './auth.interface';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const registerUser = async (payload: TRegisterUser) => {
  // Check if the user already exists
  const existingUserQuery = `
    SELECT id, email FROM users 
    WHERE email = $1
  `;

  const existingUserResult = await database.query<{
    id: string;
    email: string;
  }>(existingUserQuery, [payload.email]);

  if (existingUserResult.rows.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exists with this email!'
    );
  }

  // Check if phone number already exists (if provided)
  if (payload.phone) {
    const existingPhoneQuery = `
      SELECT id, phone FROM users 
      WHERE phone = $1
    `;

    const existingPhoneResult = await database.query<{
      id: string;
      phone: string;
    }>(existingPhoneQuery, [payload.phone]);

    if (existingPhoneResult.rows.length > 0) {
      throw new AppError(
        httpStatus.CONFLICT,
        'User already exists with this phone number!'
      );
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

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

  const result = await database.query<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    isVerified: boolean;
    createdAt: Date;
  }>(createUserQuery, values);

  const newUser = result.rows[0];

  if (!newUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user'
    );
  }

  // Create JWT payload
  const jwtPayload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone as string,
    role: newUser.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: newUser.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
  };

  // Generate tokens
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    user: newUser,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: TLoginUser) => {
  const userQuery = `
    SELECT id, name, email, password, phone, role, status
    FROM users
    WHERE email = $1
  `;

  const result = await database.query<{
    id: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
    status: string;
  }>(userQuery, [payload.email]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (user.status === 'DELETED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone as string,
    role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: user.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: TChangePassword
) => {
  const userQuery = `
    SELECT id, password, status
    FROM users
    WHERE id = $1
  `;

  const result = await database.query<{
    id: string;
    password: string;
    status: string;
  }>(userQuery, [userData.id]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (user.status === 'DELETED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateQuery = `
    UPDATE users 
    SET password = $1, "needPasswordChange" = false, "passwordChangedAt" = $2, "updatedAt" = $3
    WHERE id = $4
  `;

  await database.query(updateQuery, [
    hashedPassword,
    new Date(),
    new Date(),
    userData.id,
  ]);

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { id, iat } = decoded;

  const userQuery = `
    SELECT id, name, email, phone, role, status, "passwordChangedAt"
    FROM users 
    WHERE id = $1
  `;

  const result = await database.query<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    passwordChangedAt?: Date;
  }>(userQuery, [id]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (user.status === 'DELETED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  if (
    user.passwordChangedAt &&
    new Date(iat! * 1000) < user.passwordChangedAt
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone as string,
    role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: user.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (email: string) => {
  const userQuery = `
    SELECT id, name, email, phone, role, status
    FROM users 
    WHERE email = $1
  `;

  const result = await database.query<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
  }>(userQuery, [email]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (user.status === 'DELETED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone as string,
    role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: user.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m'
  );

  const resetUILink = `${config.jwt_refresh_expires_in}/reset-password?id=${user.id}&token=${resetToken}`;

  await EmailHelper.sendEmail(user.email, resetUILink);

  return null;
};

const resetPassword = async (payload: TResetPassword, token: string) => {
  const userQuery = `
    SELECT id, email, status
    FROM users 
    WHERE email = $1
  `;

  const result = await database.query<{
    id: string;
    email: string;
    status: string;
  }>(userQuery, [payload.email]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (user.status === 'DELETED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const decoded = verifyToken(
    token,
    config.jwt_access_secret as string
  ) as JwtPayload;

  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateQuery = `
    UPDATE users 
    SET password = $1, "passwordChangedAt" = $2, "updatedAt" = $3
    WHERE email = $4
  `;

  await database.query(updateQuery, [
    hashedPassword,
    new Date(),
    new Date(),
    decoded.email,
  ]);

  return null;
};

const sendOTP = async (payload: TSendOTP) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const updateQuery = `
      UPDATE users 
      SET otp = $1, "updatedAt" = $2
      WHERE email = $3
    `;

    await database.query(updateQuery, [otp, new Date(), payload.email]);
    await EmailHelper.sendEmail(payload.email, otp);
    return { message: 'OTP sent successfully' };
  } catch {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
  }
};

const verifyOTP = async (payload: TVerifyOTP) => {
  const userQuery = `
    SELECT id, email, otp, status
    FROM users 
    WHERE email = $1
  `;

  const result = await database.query<{
    id: string;
    email: string;
    otp?: string;
    status: string;
  }>(userQuery, [payload.email]);

  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  if (user.otp !== payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Update user as verified and clear OTP
  const updateQuery = `
    UPDATE users 
    SET "isVerified" = true, otp = NULL, "updatedAt" = $1
    WHERE id = $2
  `;

  await database.query(updateQuery, [new Date(), user.id]);

  return { message: 'User verified successfully' };
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  verifyOTP,
  sendOTP,
};
