import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';
import { verifyToken } from '../utils/verifyJWT';
import database from '../../shared/database';

type UserRoleType = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

const auth = (...requiredRoles: UserRoleType[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // checking if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const decoded = verifyToken(
      cleanToken,
      config.jwt_access_secret as string
    ) as JwtPayload;

    const { role, email, iat } = decoded;

    // checking if the user exists using raw SQL
    const userQuery = `
      SELECT id, email, role, status, "passwordChangedAt", "isVerified"
      FROM users 
      WHERE email = $1
    `;

    const result = await database.query<{
      id: string;
      email: string;
      role: string;
      status: string;
      passwordChangedAt?: Date;
      isVerified: boolean;
    }>(userQuery, [email]);

    const user = result.rows[0];

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }

    // Check if user is blocked or deleted
    if (user.status === 'BLOCKED') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
    }

    if (user.status === 'DELETED') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
    }

    // Check if JWT was issued before password change
    if (
      user.passwordChangedAt &&
      iat &&
      new Date(iat * 1000) < user.passwordChangedAt
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // Check if user role is authorized
    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
