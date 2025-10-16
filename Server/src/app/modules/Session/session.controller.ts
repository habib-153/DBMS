import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { SessionService } from './session.service';
import { catchAsync } from '../../utils/catchAsync';

const getUserSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const sessions = await SessionService.getAllUserSessions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User sessions retrieved successfully',
    data: sessions,
  });
});

const getActiveSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const sessions = await SessionService.getActiveUserSessions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active sessions retrieved successfully',
    data: sessions,
  });
});

const endSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionToken } = req.body;
  await SessionService.endSession(sessionToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Session ended successfully',
    data: null,
  });
});
const endAllSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  await SessionService.endAllUserSessions(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All sessions ended successfully',
    data: null,
  });
});

export const SessionController = {
  getUserSessions,
  getActiveSessions,
  endSession,
  endAllSessions,
};
