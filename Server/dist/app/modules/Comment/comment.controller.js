"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const comment_service_1 = require("./comment.service");
const createComment = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_service_1.CommentService.createComment(req.body, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Comment created successfully',
        data: result,
    });
}));
const updateComment = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield comment_service_1.CommentService.updateComment(id, req.body, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Comment updated successfully',
        data: result,
    });
}));
const deleteComment = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield comment_service_1.CommentService.deleteComment(id, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Comment deleted successfully',
        data: result,
    });
}));
const getCommentsByPost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const result = yield comment_service_1.CommentService.getCommentsByPost(postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Comments retrieved successfully',
        data: result,
    });
}));
const addCommentUpvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.commentId;
    const result = yield comment_service_1.CommentService.addCommentUpvote(commentId, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Thanks for your upvote',
        data: result,
    });
}));
const addCommentDownvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.commentId;
    const result = yield comment_service_1.CommentService.addCommentDownvote(commentId, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Thanks for your downvote',
        data: result,
    });
}));
const removeCommentUpvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.commentId;
    const result = yield comment_service_1.CommentService.removeCommentUpvote(commentId, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Upvote removed',
        data: result,
    });
}));
const removeCommentDownvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.commentId;
    const result = yield comment_service_1.CommentService.removeCommentDownvote(commentId, req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Downvote removed',
        data: result,
    });
}));
exports.CommentControllers = {
    createComment,
    updateComment,
    deleteComment,
    getCommentsByPost,
    addCommentUpvote,
    addCommentDownvote,
    removeCommentUpvote,
    removeCommentDownvote,
};
