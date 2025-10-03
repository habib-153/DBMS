import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TImageFile } from '../../interfaces/image.interface';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
// import { PostService } from './post.service';
import { TUser } from '../User/user.interface';
import { PostService } from './post.service.raw';

const createPost = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please upload an image');
  }

  const result = await PostService.createPost(
    req.body,
    req.file as TImageFile,
    req.user.id // Pass the user ID from the authenticated user
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

  const result = await PostService.updatePost(
    id,
    req.body,
    req.file as TImageFile,
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
};
