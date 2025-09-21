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
exports.PostServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const post_model_1 = require("./post.model");
const user_model_1 = require("../User/user.model");
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const createPostIntoDB = (payload, image) => __awaiter(void 0, void 0, void 0, function* () {
    if (image) {
        payload.image = image.path;
    }
    const user = yield user_model_1.User.findById(payload.author);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.status == 'BAN') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User is banned');
    }
    const result = (yield post_model_1.Post.create(payload)).populate('author');
    yield user_model_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, { $inc: { postCount: 1 } });
    return result;
});
const getAllPostsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { sort, searchTerm, category, page = 1, limit = 10 } = query;
    //console.log(query, 'Hello')
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;
    const aggregationPipeline = [
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
            },
        },
        {
            $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                upvoteCount: { $size: '$upVotes' },
                downvoteCount: { $size: '$downVotes' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'upVotes',
                foreignField: '_id',
                as: 'upVotes',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'downVotes',
                foreignField: '_id',
                as: 'downVotes',
            },
        }
    ];
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        aggregationPipeline.push({
            $match: {
                $or: [
                    { title: searchRegex },
                    { category: searchRegex },
                    { 'author.name': searchRegex },
                    { 'author.email': searchRegex },
                ],
            },
        });
    }
    if (category) {
        aggregationPipeline.push({
            $match: { category },
        });
    }
    if (sort === 'upvotes' || sort === 'downvotes') {
        aggregationPipeline.push({
            $sort: sort === 'upvotes' ? { upvoteCount: -1 } : { downvoteCount: -1 },
        });
    }
    aggregationPipeline.push({ $skip: skip }, { $limit: limitNumber });
    const result = yield post_model_1.Post.aggregate(aggregationPipeline);
    const totalDocuments = yield post_model_1.Post.countDocuments();
    const totalPage = Math.ceil(totalDocuments / limitNumber);
    // Return result with meta information
    return {
        data: result,
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total: totalDocuments,
            totalPage,
        },
    };
});
const getSinglePostFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const aggregationPipeline = [
        {
            $match: {
                _id: new mongoose_1.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
            },
        },
        {
            $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                upvoteCount: { $size: '$upVotes' },
                downvoteCount: { $size: '$downVotes' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'upVotes',
                foreignField: '_id',
                as: 'upVotes',
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'downVotes',
                foreignField: '_id',
                as: 'downVotes',
            },
        }
    ];
    const result = yield post_model_1.Post.aggregate(aggregationPipeline);
    return result.length > 0 ? result[0] : null;
});
const updatePostIntoDB = (id, payload, image) => __awaiter(void 0, void 0, void 0, function* () {
    const postData = yield post_model_1.Post.findById(id);
    if (!postData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    if (image) {
        payload.image = image.path;
    }
    const result = yield post_model_1.Post.findByIdAndUpdate(id, payload, {
        runValidators: true, new: true
    });
    return result;
});
const deletePostFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_model_1.Post.findByIdAndDelete(id, { isDeleted: true });
    return result;
});
const addPostUpvoteIntoDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    const post = yield post_model_1.Post.findById(postId);
    if (!post)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    const userId = new mongoose_1.Types.ObjectId(_id);
    if (post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already upvote this post!');
    }
    const session = yield mongoose_2.default.startSession();
    try {
        session.startTransaction();
        if (post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
            yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { downVotes: _id } }, { new: true, runValidators: true, session });
        }
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $addToSet: { upVotes: _id } }, { new: true, runValidators: true, session }).populate('upVotes');
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const removePostUpvoteFromDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    const post = yield post_model_1.Post.findById(postId);
    if (!post)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    const userId = new mongoose_1.Types.ObjectId(_id);
    if (!post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You haven't upvote this post!");
    }
    const session = yield mongoose_2.default.startSession();
    try {
        session.startTransaction();
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { upVotes: _id } }, { new: true, runValidators: true, session }).populate('upVotes');
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const addPostDownvoteIntoDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    const post = yield post_model_1.Post.findById(postId);
    if (!post)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    const userId = new mongoose_1.Types.ObjectId(_id);
    if (post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already downvote this post!');
    }
    const session = yield mongoose_2.default.startSession();
    try {
        session.startTransaction();
        if (post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
            yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { upVotes: _id } }, { new: true, runValidators: true, session });
        }
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $addToSet: { downVotes: _id } }, { new: true, runValidators: true, session }).populate('downVotes');
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const removePostDownvoteFromDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    const post = yield post_model_1.Post.findById(postId);
    if (!post)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    const userId = new mongoose_1.Types.ObjectId(_id);
    if (!post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have't downvote this post!");
    }
    const session = yield mongoose_2.default.startSession();
    try {
        session.startTransaction();
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { downVotes: _id } }, { new: true, runValidators: true, session }).populate('downVotes');
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.PostServices = {
    createPostIntoDB,
    getAllPostsFromDB,
    getSinglePostFromDB,
    updatePostIntoDB,
    deletePostFromDB,
    addPostUpvoteIntoDB,
    removePostUpvoteFromDB,
    addPostDownvoteIntoDB,
    removePostDownvoteFromDB,
};
