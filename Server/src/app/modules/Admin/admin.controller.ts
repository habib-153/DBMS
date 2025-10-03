import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.service';

const getAdminStats = catchAsync(async (req, res) => {
  const result = await AdminService.getAdminStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Admin stats retrieved successfully',
    data: result,
  });
});

const getDashboardOverview = catchAsync(async (req, res) => {
  const result = await AdminService.getDashboardOverview();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard overview retrieved successfully',
    data: result,
  });
});

export const AdminControllers = {
  getAdminStats,
  getDashboardOverview,
};
