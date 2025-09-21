import httpStatus from 'http-status';
import {Prisma, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import { TUser, TUserFilterableFields } from './user.interface';
import prisma from '../../../shared/prisma';
import axios from 'axios';
import { IPaginationOptions } from '../../interfaces';
import { userSearchableFields } from './user.constant';
import { paginationHelper } from '../../utils/paginationHelper';


const getAllUsers = async (
  filters: TUserFilterableFields,
  paginationOptions: IPaginationOptions
) => {
  const { limit, page, skip } =
    paginationHelper.calculatePagination(paginationOptions);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
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
          equals: (filterData as Record<string, unknown>)[key],
        },
      })),
    });
  }

  andConditions.push({
    status: {
      not: UserStatus.DELETED,
    },
  });

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const users = await prisma.user.findMany({
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

  const total = await prisma.user.count({
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
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
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
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (id: string, updateData: Partial<TUser>) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData as Prisma.UserUpdateInput,
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
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await prisma.user.update({
    where: { id },
    data: {
      status: UserStatus.DELETED,
    },
  });

  return { message: 'User deleted successfully' };
};

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

const sendOTP = async (phoneNumber: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone: phoneNumber,
      message: `Your verification code is ${otp}`,
      key: '047227e7af6950731f76e101f90fd839e83f6b79dbwERYOJulry8A2hSrzwfsCbb',
    });

    console.log('OTP response:', response.data);
    if (!response.data.success) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to send OTP');
  }
  return otp;
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
    },
  });

  return updatedUser;
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  sendOTP,
  verifyOTP,
};
