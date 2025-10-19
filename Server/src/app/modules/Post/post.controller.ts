import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TImageFile } from '../../interfaces/image.interface';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import type { Express } from 'express';
import { TUser } from '../User/user.interface';
import { PostService } from './post.service.raw';

const createPost = catchAsync(async (req, res) => {
  // Prevent unverified users from creating posts
  if (!req.user) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Please verify your email before creating posts'
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFile = files?.['image']?.[0];
  const videoFile = files?.['video']?.[0];

  // At least image is required
  if (!imageFile) {
    throw new AppError(400, 'Please upload an image');
  }

  const result = await PostService.createPost(
    req.body,
    {
      image: imageFile as TImageFile,
      video: videoFile as TImageFile | undefined,
    },
    req.user.id, // Pass the user ID from the authenticated user
    req.user.role // Pass the user role for auto-approval
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPost = catchAsync(async (req, res) => {
  const result = await PostService.getAllPosts(req.query, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Posts retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PostService.getSinglePost(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const { id } = req.params;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const imageFile = files?.['image']?.[0];
  const videoFile = files?.['video']?.[0];

  const result = await PostService.updatePost(
    id,
    req.body,
    {
      image: imageFile as TImageFile | undefined,
      video: videoFile as TImageFile | undefined,
    },
    req.user
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PostService.deletePost(id, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post deleted successfully',
    data: result,
  });
});

const addPostUpvote = catchAsync(async (req, res) => {
  const result = await PostService.addPostUpvote(
    req.params.postId,
    req.user as TUser
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your upvote',
    data: result,
  });
});

const addPostDownvote = catchAsync(async (req, res) => {
  const result = await PostService.addPostDownvote(
    req.params.postId,
    req.user as TUser
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your downvote',
    data: result,
  });
});

const removePostUpvote = catchAsync(async (req, res) => {
  const result = await PostService.removePostUpvote(
    req.params.postId,
    req.user as TUser
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Upvote removed',
    data: result,
  });
});

const removePostDownvote = catchAsync(async (req, res) => {
  const result = await PostService.removePostDownvote(
    req.params.postId,
    req.user as TUser
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Downvote removed',
    data: result,
  });
});

const reportPost = catchAsync(async (req, res) => {
  const result = await PostService.reportPost(
    req.params.postId,
    req.user.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: result.message,
    data: { verificationScore: result.verificationScore },
  });
});

const getPostReports = catchAsync(async (req, res) => {
  const result = await PostService.getPostReports(req.params.postId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post reports retrieved successfully',
    data: result,
  });
});

const getAllPendingReports = catchAsync(async (req, res) => {
  const result = await PostService.getAllPendingReports();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Pending reports retrieved successfully',
    data: result,
  });
});

const reviewReport = catchAsync(async (req, res) => {
  const result = await PostService.reviewReport(
    req.params.reportId,
    req.user.id,
    req.body.action
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: { verificationScore: result.verificationScore },
  });
});

export const PostControllers = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
  addPostUpvote,
  addPostDownvote,
  removePostUpvote,
  removePostDownvote,
  reportPost,
  getPostReports,
  getAllPendingReports,
  reviewReport,
};
