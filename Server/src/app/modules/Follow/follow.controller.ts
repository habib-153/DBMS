import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FollowService } from './follow.service';

const followUser = catchAsync(async (req, res) => {
  const followerId = req.user.id; // Current logged-in user
  const followingId = req.params.userId;

  const result = await FollowService.followUser(followerId, followingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Successfully followed user',
    data: result,
  });
});

const unfollowUser = catchAsync(async (req, res) => {
  const followerId = req.user.id; // Current logged-in user
  const followingId = req.params.userId; // User to unfollow

  const result = await FollowService.unfollowUser(followerId, followingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const getFollowers = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await FollowService.getFollowers(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Followers retrieved successfully',
    data: result,
  });
});

const getFollowing = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await FollowService.getFollowing(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Following list retrieved successfully',
    data: result,
  });
});

const checkFollowStatus = catchAsync(async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  const isFollowing = await FollowService.isFollowing(followerId, followingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Follow status retrieved',
    data: { isFollowing },
  });
});

const getFollowStats = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const result = await FollowService.getFollowStats(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Follow stats retrieved successfully',
    data: result,
  });
});

export const FollowControllers = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowStats,
};
