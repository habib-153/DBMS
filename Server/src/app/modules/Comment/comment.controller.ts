import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentService } from './comment.service';

const createComment = catchAsync(async (req, res) => {
  const result = await CommentService.createComment(req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Comment created successfully',
    data: result,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentService.updateComment(id, req.body, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentService.deleteComment(id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Comment deleted successfully',
    data: result,
  });
});

const getCommentsByPost = catchAsync(async (req, res) => {
  const postId = req.params.id;
  const result = await CommentService.getCommentsByPost(postId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const addCommentUpvote = catchAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const result = await CommentService.addCommentUpvote(commentId, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your upvote',
    data: result,
  });
});

const addCommentDownvote = catchAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const result = await CommentService.addCommentDownvote(
    commentId,
    req.user.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your downvote',
    data: result,
  });
});

const removeCommentUpvote = catchAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const result = await CommentService.removeCommentUpvote(
    commentId,
    req.user.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Upvote removed',
    data: result,
  });
});

const removeCommentDownvote = catchAsync(async (req, res) => {
  const commentId = req.params.commentId;
  const result = await CommentService.removeCommentDownvote(
    commentId,
    req.user.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Downvote removed',
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
  addCommentUpvote,
  addCommentDownvote,
  removeCommentUpvote,
  removeCommentDownvote,
};
