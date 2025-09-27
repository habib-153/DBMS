import httpStatus from 'http-status';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service.raw';
import { catchAsync } from '../../utils/catchAsync';
import { userSearchableFields } from './user.constant';
import pick from '../../../shared/pick';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userSearchableFields);
  const paginationOptions = pick(req.query, [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
  ]);

  // Combine filters and pagination for raw service
  const queryParams = { ...filters, ...paginationOptions };
  const result = await UserService.getAllUsers(queryParams);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateUser(id, req.body, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

// const changePassword = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   const result = await UserService.changePassword(userId, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Password changed successfully',
//     data: result,
//   });
// });

// const getMe = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user?.id;
//   const result = await UserService.getMe(userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User profile retrieved successfully',
//     data: result,
//   });
// });

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
