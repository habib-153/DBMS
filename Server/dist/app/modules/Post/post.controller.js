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
exports.PostControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const post_service_raw_1 = require("./post.service.raw");
const createPost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Prevent unverified users from creating posts
    if (!req.user) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Please verify your email before creating posts');
    }
    const files = req.files;
    const imageFile = (_a = files === null || files === void 0 ? void 0 : files['image']) === null || _a === void 0 ? void 0 : _a[0];
    const videoFile = (_b = files === null || files === void 0 ? void 0 : files['video']) === null || _b === void 0 ? void 0 : _b[0];
    // At least image is required
    if (!imageFile) {
        throw new AppError_1.default(400, 'Please upload an image');
    }
    const result = yield post_service_raw_1.PostService.createPost(req.body, {
        image: imageFile,
        video: videoFile,
    }, req.user.id, // Pass the user ID from the authenticated user
    req.user.role // Pass the user role for auto-approval
    );
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Post created successfully',
        data: result,
    });
}));
const getAllPost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.getAllPosts(req.query, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Posts retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getSinglePost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield post_service_raw_1.PostService.getSinglePost(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Post retrieved successfully',
        data: result,
    });
}));
const updatePost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const files = req.files;
    const imageFile = (_a = files === null || files === void 0 ? void 0 : files['image']) === null || _a === void 0 ? void 0 : _a[0];
    const videoFile = (_b = files === null || files === void 0 ? void 0 : files['video']) === null || _b === void 0 ? void 0 : _b[0];
    const result = yield post_service_raw_1.PostService.updatePost(id, req.body, {
        image: imageFile,
        video: videoFile,
    }, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Post updated successfully',
        data: result,
    });
}));
const deletePost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield post_service_raw_1.PostService.deletePost(id, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Post deleted successfully',
        data: result,
    });
}));
const addPostUpvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.addPostUpvote(req.params.postId, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Thanks for your upvote',
        data: result,
    });
}));
const addPostDownvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.addPostDownvote(req.params.postId, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Thanks for your downvote',
        data: result,
    });
}));
const removePostUpvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.removePostUpvote(req.params.postId, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Upvote removed',
        data: result,
    });
}));
const removePostDownvote = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.removePostDownvote(req.params.postId, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Downvote removed',
        data: result,
    });
}));
const reportPost = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.reportPost(req.params.postId, req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: result.message,
        data: { verificationScore: result.verificationScore },
    });
}));
const getPostReports = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.getPostReports(req.params.postId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Post reports retrieved successfully',
        data: result,
    });
}));
const getAllPendingReports = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.getAllPendingReports();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Pending reports retrieved successfully',
        data: result,
    });
}));
const reviewReport = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_service_raw_1.PostService.reviewReport(req.params.reportId, req.user.id, req.body.action);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result.message,
        data: { verificationScore: result.verificationScore },
    });
}));
exports.PostControllers = {
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
