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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const post_constant_1 = require("./post.constant");
const createPost = (postData, imageFile, authorId) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert crimeDate string to Date
    const crimeDate = new Date(postData.crimeDate);
    const post = yield prisma_1.default.post.create({
        data: {
            title: postData.title,
            description: postData.description,
            image: imageFile.path,
            location: postData.location,
            district: postData.district,
            division: postData.division,
            crimeDate: crimeDate,
            authorId: authorId,
            status: client_1.PostStatus.PENDING,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            votes: true,
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });
    return post;
});
const getAllPosts = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchTerm } = filters, filterData = __rest(filters, ["page", "limit", "sortBy", "sortOrder", "searchTerm"]);
    const skip = (Number(page) - 1) * Number(limit);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: post_constant_1.postSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    andConditions.push({
        isDeleted: false,
        status: {
            in: [client_1.PostStatus.APPROVED, client_1.PostStatus.PENDING],
        },
    });
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const posts = yield prisma_1.default.post.findMany({
        where: whereConditions,
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            votes: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            comments: {
                where: {
                    isDeleted: false,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                        },
                    },
                    votes: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.post.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
        },
        data: posts,
    };
});
const getSinglePost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_1.default.post.findUnique({
        where: { id },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            votes: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            comments: {
                where: {
                    isDeleted: false,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePhoto: true,
                        },
                    },
                    votes: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });
    if (!post || post.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    return post;
});
const updatePost = (id, updateData, imageFile, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_1.default.post.findUnique({
        where: { id },
    });
    if (!post || post.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    if (post.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only update your own posts');
    }
    const updatePayload = Object.assign({}, updateData);
    if (imageFile) {
        updatePayload.image = imageFile.path;
    }
    if (updateData.crimeDate) {
        updatePayload.crimeDate = new Date(updateData.crimeDate);
    }
    const updatedPost = yield prisma_1.default.post.update({
        where: { id },
        data: updatePayload,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                },
            },
            votes: true,
            comments: true,
            _count: {
                select: {
                    votes: true,
                    comments: true,
                },
            },
        },
    });
    return updatedPost;
});
const deletePost = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield prisma_1.default.post.findUnique({
        where: { id },
    });
    if (!post || post.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    if (post.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own posts');
    }
    yield prisma_1.default.post.update({
        where: { id },
        data: {
            isDeleted: true,
        },
    });
    return { message: 'Post deleted successfully' };
});
// Upvote functionality
const addPostUpvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addPostVote(postId, user.id, client_1.VoteType.UP);
});
// Downvote functionality
const addPostDownvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addPostVote(postId, user.id, client_1.VoteType.DOWN);
});
// Remove upvote
const removePostUpvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const existingVote = yield prisma_1.default.postVote.findUnique({
        where: {
            userId_postId: {
                userId: user.id,
                postId,
            },
        },
    });
    if (existingVote && existingVote.type === client_1.VoteType.UP) {
        yield prisma_1.default.postVote.delete({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId,
                },
            },
        });
        return { message: 'Upvote removed successfully' };
    }
    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No upvote found to remove');
});
// Remove downvote
const removePostDownvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const existingVote = yield prisma_1.default.postVote.findUnique({
        where: {
            userId_postId: {
                userId: user.id,
                postId,
            },
        },
    });
    if (existingVote && existingVote.type === client_1.VoteType.DOWN) {
        yield prisma_1.default.postVote.delete({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId,
                },
            },
        });
        return { message: 'Downvote removed successfully' };
    }
    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No downvote found to remove');
});
// Generic vote function
const addPostVote = (postId, userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if post exists
    const post = yield prisma_1.default.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    const existingVote = yield prisma_1.default.postVote.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });
    if (existingVote) {
        if (existingVote.type === type) {
            // If same vote type, remove it
            yield prisma_1.default.postVote.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            return { message: 'Vote removed' };
        }
        else {
            // If different vote type, update it
            yield prisma_1.default.postVote.update({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
                data: { type },
            });
            return { message: 'Vote updated' };
        }
    }
    else {
        // Create new vote
        yield prisma_1.default.postVote.create({
            data: {
                userId,
                postId,
                type,
            },
        });
        return { message: 'Vote added' };
    }
});
const createComment = (commentData, authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield prisma_1.default.comment.create({
        data: {
            content: commentData.content,
            image: commentData.image,
            postId: commentData.postId,
            authorId: authorId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
            post: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });
    return comment;
});
const updateComment = (id, updateData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield prisma_1.default.comment.findUnique({
        where: { id },
    });
    if (!comment || comment.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    if (comment.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only update your own comments');
    }
    const updatedComment = yield prisma_1.default.comment.update({
        where: { id },
        data: updateData,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    profilePhoto: true,
                },
            },
            votes: true,
        },
    });
    return updatedComment;
});
const deleteComment = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield prisma_1.default.comment.findUnique({
        where: { id },
    });
    if (!comment || comment.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    if (comment.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You can only delete your own comments');
    }
    yield prisma_1.default.comment.update({
        where: { id },
        data: {
            isDeleted: true,
        },
    });
    return { message: 'Comment deleted successfully' };
});
exports.PostService = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    addPostUpvote,
    addPostDownvote,
    removePostUpvote,
    removePostDownvote,
    addPostVote,
    createComment,
    updateComment,
    deleteComment,
};
