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
import { SessionService } from '../Session/session.service';
import { GeofenceService } from '../Geofence/geofence.service';

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
    profilePhoto?: string;
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

  // After creating user, generate an OTP and send to the user's email.
  // Store OTP and expiry in the users table so we can verify later.
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const otpUpdateQuery = `
    UPDATE users
    SET otp = $1, otp_expires_at = $2, "updatedAt" = $3
    WHERE id = $4
  `;

  await database.query(otpUpdateQuery, [
    otp,
    otpExpiresAt,
    new Date(),
    newUser.id,
  ]);

  // send OTP email
  await EmailHelper.sendOtpEmail(newUser.email, otp);

  // Return created user (no tokens). Client must verify OTP before login or posting.
  return {
    user: newUser,
    message: 'OTP sent to email. Please verify to complete registration.',
  };
};

const loginUser = async (
  payload: TLoginUser,
  requestMetadata?: {
    ipAddress?: string | null;
    userAgent?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }
) => {
  const userQuery = `
    SELECT id, name, email, password, phone, role, status, "profilePhoto", "isVerified"
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
    profilePhoto?: string;
    isVerified: boolean;
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

  // Check if user email is verified
  if (!user.isVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Please verify your email before logging in. Check your inbox for the verification code.'
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone as string,
    role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: user.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
    profilePhoto: user.profilePhoto,
    isVerified: user.isVerified,
  };

  // jwtPayload prepared for token creation when needed

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

  // Track user session asynchronously (don't block login)
  if (requestMetadata) {
    SessionService.createSession({
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
      GeofenceService.recordUserLocation(
        {
          userId: user.id,
          latitude: requestMetadata.latitude as number,
          longitude: requestMetadata.longitude as number,
        },
        user.id
      ).catch((err) => {
        // Log error but don't fail login
        console.error('Failed to record location:', err);
      });
    }
  }

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
    SELECT id, name, email, phone, role, status, "passwordChangedAt", "isVerified"
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
    profilePhoto?: string;
    isVerified: boolean;
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
    profilePhoto: user.profilePhoto,
    isVerified: user.isVerified,
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
    SELECT id, name, email, phone, role, status, "profilePhoto", "isVerified"
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
    profilePhoto?: string;
    isVerified: boolean;
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
    profilePhoto: user.profilePhoto,
    isVerified: user.isVerified,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m'
  );

  const resetUILink = `${config.reset_pass_ui_link}?email=${encodeURIComponent(
    user.email
  )}&token=${resetToken}`;

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
    // Check existing OTP expiry to rate-limit resends
    const userQuery = `
      SELECT id, otp, otp_expires_at, "updatedAt"
      FROM users
      WHERE email = $1
    `;

    const userResult = await database.query(userQuery, [payload.email]);
    const user = userResult.rows[0];

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }

    // If there's an existing OTP and it's still valid, prevent immediate resend
    if (
      user.otp_expires_at &&
      new Date(String(user.otp_expires_at)) > new Date()
    ) {
      // calculate seconds remaining
      const remainingMs =
        new Date(String(user.otp_expires_at)).getTime() - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        `OTP already sent. Please wait ${remainingSec} seconds before requesting a new one.`
      );
    }

    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const updateQuery = `
      UPDATE users 
      SET otp = $1, otp_expires_at = $2, "updatedAt" = $3
      WHERE email = $4
    `;

    await database.query(updateQuery, [
      otp,
      otpExpiresAt,
      new Date(),
      payload.email,
    ]);
    await EmailHelper.sendOtpEmail(payload.email, otp);
    return { message: 'OTP sent successfully' };
  } catch (err) {
    if (err instanceof AppError) throw err;
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

  if (!user.otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No OTP found. Please request a new one.'
    );
  }

  // Check expiry
  const expiryQuery = `
    SELECT otp_expires_at FROM users WHERE email = $1
  `;

  const expiryRes = await database.query(expiryQuery, [payload.email]);
  const otpExpiresAt = expiryRes.rows[0]?.otp_expires_at;

  if (otpExpiresAt && new Date(String(otpExpiresAt)) < new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP has expired. Please request a new one.'
    );
  }

  if (user.otp !== payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Update user as verified and clear OTP
  const updateQuery = `
    UPDATE users 
    SET "isVerified" = true, otp = NULL, otp_expires_at = NULL, "updatedAt" = $1
    WHERE id = $2
  `;

  await database.query(updateQuery, [new Date(), user.id]);

  // return tokens so client can auto-login
  const jwtPayloadQuery = `
    SELECT id, name, email, phone, role, status, "profilePhoto"
    FROM users
    WHERE id = $1
  `;

  const userRow = await database.query(jwtPayloadQuery, [user.id]);
  const verifiedUser = userRow.rows[0];

  const jwtPayload = {
    id: String(verifiedUser.id),
    name: String(verifiedUser.name),
    email: String(verifiedUser.email),
    phone: String(verifiedUser.phone) as string,
    role: verifiedUser.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    status: verifiedUser.status as 'ACTIVE' | 'BLOCKED' | 'DELETED',
    profilePhoto: verifiedUser.profilePhoto as string | undefined,
    isVerified: true,
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

  return { message: 'User verified successfully', accessToken, refreshToken };
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
