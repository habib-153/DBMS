"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
// Simple UUID generator replacement
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
const createPost = (postData, imageFile, authorId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const postId = generateUuid();
    const crimeDate = new Date(postData.crimeDate);
    const now = new Date();
    // Auto-approve posts from admins
    const status = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING';
    const query = `
    INSERT INTO posts (id, title, description, image, location, district, division, "crimeDate", category, "authorId", latitude, longitude, status, "isDeleted", "postDate", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false, $14, $15, $16)
    RETURNING *
  `;
    const values = [
        postId,
        postData.title,
        postData.description,
        imageFile.path,
        postData.location,
        postData.district,
        postData.division,
        crimeDate,
        postData.category || 'OTHERS',
        authorId,
        // latitude and longitude: accept numbers or null
        (_a = postData.latitude) !== null && _a !== void 0 ? _a : null,
        (_b = postData.longitude) !== null && _b !== void 0 ? _b : null,
        status,
        now,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdPost = result.rows[0];
    if (!createdPost) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create post');
    }
    // Trigger AI analysis asynchronously (non-blocking)
    if (imageFile && imageFile.path) {
        // Import AIAnalysisService dynamically to avoid circular dependencies
        Promise.resolve().then(() => __importStar(require('../AIAnalysis/aianalysis.service'))).then(({ AIAnalysisService }) => {
            AIAnalysisService.analyzeImageWithRoboflow(imageFile.path, createdPost.id).catch((error) => {
                console.error('AI analysis failed:', error);
            });
        })
            .catch((err) => {
            console.error('Failed to import AI service:', err);
        });
    }
    // Get post with author details
    const postWithDetails = yield getSinglePost(createdPost.id);
    return postWithDetails;
});
const getAllPosts = (filters, user) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchTerm, authorEmail } = filters, filterData = __rest(filters, ["page", "limit", "sortBy", "sortOrder", "searchTerm", "authorEmail"]);
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [`p."isDeleted" = false`];
    const values = [];
    let paramIndex = 1;
    // Add search conditions
    if (searchTerm) {
        conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`);
        values.push(`%${searchTerm}%`);
        paramIndex++;
    }
    if (authorEmail) {
        conditions.push(`u.email = $${paramIndex}`);
        values.push(authorEmail);
        paramIndex++;
    }
    // Add filter conditions
    if (filterData.district) {
        conditions.push(`p.district = $${paramIndex}`);
        values.push(filterData.district);
        paramIndex++;
    }
    if (filterData.division) {
        conditions.push(`p.division = $${paramIndex}`);
        values.push(filterData.division);
        paramIndex++;
    }
    if (filterData.status) {
        conditions.push(`p.status = $${paramIndex}`);
        values.push(filterData.status);
        paramIndex++;
    }
    if (filterData.category) {
        conditions.push(`p.category = $${paramIndex}`);
        values.push(filterData.category);
        paramIndex++;
    }
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'ADMIN' || (user === null || user === void 0 ? void 0 : user.role) === 'SUPER_ADMIN';
    const isViewingOwnPosts = authorEmail && (user === null || user === void 0 ? void 0 : user.email) === authorEmail;
    if (!isAdmin && !isViewingOwnPosts && !filterData.status) {
        // Regular users only see APPROVED posts
        conditions.push(`p.status = 'APPROVED'`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    FROM posts p
    INNER JOIN users u ON p."authorId" = u.id
    ${whereClause}
  `;
    const countResult = yield database_1.default.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    // Determine ORDER BY clause
    let orderByClause = '';
    if (sortBy === 'votes') {
        orderByClause = `ORDER BY (COALESCE(vote_counts.up_votes, 0) + COALESCE(vote_counts.down_votes, 0)) ${sortOrder}`;
    }
    else {
        orderByClause = `ORDER BY p."${sortBy}" ${sortOrder}`;
    }
    // Main query with pagination
    const mainQuery = `
    SELECT 
      p.*,
      u.name as "authorName",
      u.email as "authorEmail",
      u."profilePhoto" as "authorProfilePhoto",
      COALESCE(vote_counts.up_votes, 0) as "upVotes",
      COALESCE(vote_counts.down_votes, 0) as "downVotes",
      COALESCE(comment_counts.comment_count, 0) as "commentCount"
    FROM posts p
    INNER JOIN users u ON p."authorId" = u.id
    LEFT JOIN (
      SELECT 
        "postId",
        COUNT(CASE WHEN type = 'UP' THEN 1 END) as up_votes,
        COUNT(CASE WHEN type = 'DOWN' THEN 1 END) as down_votes
      FROM post_votes
      GROUP BY "postId"
    ) vote_counts ON p.id = vote_counts."postId"
    LEFT JOIN (
      SELECT 
        "postId",
        COUNT(*) as comment_count
      FROM comments
      WHERE "isDeleted" = false
      GROUP BY "postId"
    ) comment_counts ON p.id = comment_counts."postId"
    ${whereClause}
    ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    values.push(Number(limit), offset);
    const result = yield database_1.default.query(mainQuery, values);
    const posts = result.rows;
    const postIds = posts.map((post) => post.id);
    // Fetch votes for all posts in this page
    let votesByPost = {};
    if (postIds.length > 0) {
        const votesQuery = `
      SELECT 
        pv.*,
        u.name as "userName"
      FROM post_votes pv
      INNER JOIN users u ON pv."userId" = u.id
      WHERE pv."postId" = ANY($1)
      ORDER BY pv."createdAt" DESC
    `;
        const votesResult = yield database_1.default.query(votesQuery, [postIds]);
        votesByPost = votesResult.rows.reduce((acc, vote) => {
            if (!acc[vote.postId])
                acc[vote.postId] = [];
            acc[vote.postId].push(vote);
            return acc;
        }, {});
    }
    // Attach votes array to each post
    const postsWithVotes = posts.map((post) => (Object.assign(Object.assign({}, post), { votes: votesByPost[post.id] || [] })));
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
        },
        data: postsWithVotes,
    };
});
const getSinglePost = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Main post query with author details
    const postQuery = `
    SELECT 
      p.*,
      u.name as "authorName",
      u.email as "authorEmail",
      u."profilePhoto" as "authorProfilePhoto"
    FROM posts p
    INNER JOIN users u ON p."authorId" = u.id
    WHERE p.id = $1 AND p."isDeleted" = false
  `;
    const postResult = yield database_1.default.query(postQuery, [id]);
    const post = postResult.rows[0];
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    // Get votes for this post
    const votesQuery = `
    SELECT 
      pv.*,
      u.name as "userName"
    FROM post_votes pv
    INNER JOIN users u ON pv."userId" = u.id
    WHERE pv."postId" = $1
    ORDER BY pv."createdAt" DESC
  `;
    const votesResult = yield database_1.default.query(votesQuery, [id]);
    // Get comments for this post
    const commentsQuery = `
    SELECT 
      c.*,
      u.name as "authorName",
      u."profilePhoto" as "authorProfilePhoto"
    FROM comments c
    INNER JOIN users u ON c."authorId" = u.id
    WHERE c."postId" = $1 AND c."isDeleted" = false
    ORDER BY c."createdAt" DESC
  `;
    const commentsResult = yield database_1.default.query(commentsQuery, [id]);
    // Get reports for this post
    const reportsQuery = `
    SELECT 
      pr.*,
      u.name as "userName",
      u.email as "userEmail",
      u."profilePhoto" as "userProfilePhoto"
    FROM post_reports pr
    INNER JOIN users u ON pr."userId" = u.id
    WHERE pr."postId" = $1
    ORDER BY pr."createdAt" DESC
  `;
    const reportsResult = yield database_1.default.query(reportsQuery, [id]);
    // Calculate vote counts
    const upVotes = votesResult.rows.filter((vote) => vote.type === 'UP').length;
    const downVotes = votesResult.rows.filter((vote) => vote.type === 'DOWN').length;
    return Object.assign(Object.assign({}, post), { upVotes,
        downVotes, voteCount: upVotes + downVotes, commentCount: commentsResult.rows.length, votes: votesResult.rows, comments: commentsResult.rows, reports: reportsResult.rows });
});
const updatePost = (id, updateData, imageFile, user) => __awaiter(void 0, void 0, void 0, function* () {
    // First, check if post exists and user owns it
    const checkQuery = `
    SELECT * FROM posts 
    WHERE id = $1 AND "isDeleted" = false
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    const post = checkResult.rows[0];
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    const isOwner = post.authorId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isOwner && !isAdmin) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to update this post');
    }
    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    if (updateData.title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        values.push(updateData.title);
        paramIndex++;
    }
    if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(updateData.description);
        paramIndex++;
    }
    if (updateData.location !== undefined) {
        updateFields.push(`location = $${paramIndex}`);
        values.push(updateData.location);
        paramIndex++;
    }
    if (updateData.district !== undefined) {
        updateFields.push(`district = $${paramIndex}`);
        values.push(updateData.district);
        paramIndex++;
    }
    if (updateData.division !== undefined) {
        updateFields.push(`division = $${paramIndex}`);
        values.push(updateData.division);
        paramIndex++;
    }
    if (updateData.crimeDate !== undefined) {
        updateFields.push(`"crimeDate" = $${paramIndex}`);
        values.push(new Date(updateData.crimeDate));
        paramIndex++;
    }
    // Latitude / Longitude may be provided or explicitly set to null to clear
    if (updateData.latitude !== undefined) {
        updateFields.push(`latitude = $${paramIndex}`);
        values.push(updateData.latitude);
        paramIndex++;
    }
    if (updateData.longitude !== undefined) {
        updateFields.push(`longitude = $${paramIndex}`);
        values.push(updateData.longitude);
        paramIndex++;
    }
    if (updateData.category !== undefined) {
        updateFields.push(`category = $${paramIndex}`);
        values.push(updateData.category);
        paramIndex++;
    }
    // Allow admin to update post status
    if (updateData.status !== undefined && isAdmin) {
        updateFields.push(`status = $${paramIndex}`);
        values.push(updateData.status);
        paramIndex++;
    }
    if (imageFile) {
        updateFields.push(`image = $${paramIndex}`);
        values.push(imageFile.path);
        paramIndex++;
    }
    if (updateFields.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No fields to update');
    }
    // Add updated timestamp and WHERE clause
    updateFields.push(`"updatedAt" = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;
    values.push(id); // for WHERE clause
    const updateQuery = `
    UPDATE posts 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
    const result = yield database_1.default.query(updateQuery, values);
    const updatedPost = result.rows[0];
    if (!updatedPost) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update post');
    }
    // Send push notification and create notification if status was changed by admin
    if (updateData.status !== undefined &&
        isAdmin &&
        post.status !== updateData.status) {
        // Create notification in database
        Promise.resolve().then(() => __importStar(require('../Notification/notification.service'))).then(({ NotificationService }) => {
            const isApproved = updateData.status === 'APPROVED';
            const notificationType = isApproved ? 'POST_APPROVED' : 'POST_REJECTED';
            const notificationTitle = isApproved
                ? '✅ Post Approved!'
                : '❌ Post Rejected';
            const notificationMessage = isApproved
                ? `Your post "${post.title}" has been approved and is now visible to everyone.`
                : `Your post "${post.title}" has been rejected by admin.`;
            NotificationService.createNotification({
                userId: post.authorId,
                type: notificationType,
                title: notificationTitle,
                message: notificationMessage,
                data: {
                    postId: post.id,
                    postTitle: post.title,
                    status: updateData.status,
                },
                isPush: true,
            }).catch((err) => console.error('Failed to create notification:', err));
        })
            .catch((err) => console.error('Failed to import NotificationService:', err));
        // Send push notification
        Promise.resolve().then(() => __importStar(require('../PushNotification/push.service'))).then(({ PushNotificationService }) => {
            PushNotificationService.sendPostStatusPush(post.authorId, post.title, updateData.status).catch((err) => console.error('Failed to send post status push notification:', err));
        })
            .catch((err) => console.error('Failed to import PushNotificationService:', err));
    }
    // Return post with details
    return yield getSinglePost(updatedPost.id);
});
const deletePost = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if post exists and user owns it
    const checkQuery = `
    SELECT * FROM posts 
    WHERE id = $1 AND "isDeleted" = false
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    const post = checkResult.rows[0];
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
    }
    const isOwner = post.authorId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isOwner && !isAdmin) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to update this post');
    }
    // Soft delete the post
    const deleteQuery = `
    UPDATE posts 
    SET "isDeleted" = true, "updatedAt" = $1
    WHERE id = $2
  `;
    yield database_1.default.query(deleteQuery, [new Date(), id]);
    return { message: 'Post deleted successfully' };
});
// Vote functionality
const addPostVote = (postId, userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if post exists
        const postCheckQuery = `
      SELECT id FROM posts 
      WHERE id = $1 AND "isDeleted" = false
    `;
        const postResult = yield client.query(postCheckQuery, [postId]);
        if (postResult.rows.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
        }
        // Check if user already voted
        const existingVoteQuery = `
      SELECT * FROM post_votes 
      WHERE "userId" = $1 AND "postId" = $2
    `;
        const existingVoteResult = yield client.query(existingVoteQuery, [userId, postId]);
        const existingVote = existingVoteResult.rows[0];
        if (existingVote) {
            if (existingVote.type === type) {
                // Same vote type - remove the vote
                yield client.query(`DELETE FROM post_votes WHERE id = $1`, [
                    existingVote.id,
                ]);
            }
            else {
                // Different vote type - update the vote
                yield client.query(`UPDATE post_votes SET type = $1, "createdAt" = $2 WHERE id = $3`, [type, new Date(), existingVote.id]);
            }
        }
        else {
            // New vote
            const voteId = generateUuid();
            yield client.query(`INSERT INTO post_votes (id, "userId", "postId", type, "createdAt") VALUES ($1, $2, $3, $4, $5)`, [voteId, userId, postId, type, new Date()]);
        }
        // Recalculate verification score after vote change
        yield calculateVerificationScore(postId);
        // Return updated post details
        return yield getSinglePost(postId);
    }));
});
const addPostUpvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addPostVote(postId, user.id, 'UP');
});
const addPostDownvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addPostVote(postId, user.id, 'DOWN');
});
const removePostVote = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteQuery = `
    DELETE FROM post_votes 
    WHERE "userId" = $1 AND "postId" = $2
  `;
    yield database_1.default.query(deleteQuery, [userId, postId]);
    return yield getSinglePost(postId);
});
const removePostUpvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield removePostVote(postId, user.id);
    // Recalculate verification score after vote removal
    yield calculateVerificationScore(postId);
    return result;
});
const removePostDownvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield removePostVote(postId, user.id);
    // Recalculate verification score after vote removal
    yield calculateVerificationScore(postId);
    return result;
});
// Verification Score Calculation
// Formula: Base(50) + (PostUpvotes * 2) - (PostDownvotes * 1) + (Comments * 1) + (CommentUpvotes * 0.5) - (CommentDownvotes * 0.25) - (Reports * 5)
const calculateVerificationScore = (postId, transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
    const executeQuery = (client) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        // Get post votes
        const postVotesQuery = `
      SELECT 
        COUNT(CASE WHEN type = 'UP' THEN 1 END) as up_votes,
        COUNT(CASE WHEN type = 'DOWN' THEN 1 END) as down_votes
      FROM post_votes
      WHERE "postId" = $1
    `;
        const postVotesResult = yield client.query(postVotesQuery, [postId]);
        const postUpvotes = parseInt(((_a = postVotesResult.rows[0]) === null || _a === void 0 ? void 0 : _a.up_votes) || '0');
        const postDownvotes = parseInt(((_b = postVotesResult.rows[0]) === null || _b === void 0 ? void 0 : _b.down_votes) || '0');
        // Get comments count for this post
        const commentsQuery = `
      SELECT COUNT(*) as comment_count
      FROM comments
      WHERE "postId" = $1 AND "isDeleted" = false
    `;
        const commentsResult = yield client.query(commentsQuery, [postId]);
        const commentCount = parseInt(((_c = commentsResult.rows[0]) === null || _c === void 0 ? void 0 : _c.comment_count) || '0');
        // Get comment votes for all comments on this post
        const commentVotesQuery = `
      SELECT 
        COUNT(CASE WHEN cv.type = 'UP' THEN 1 END) as comment_up_votes,
        COUNT(CASE WHEN cv.type = 'DOWN' THEN 1 END) as comment_down_votes
      FROM comment_votes cv
      INNER JOIN comments c ON cv."commentId" = c.id
      WHERE c."postId" = $1 AND c."isDeleted" = false
    `;
        const commentVotesResult = yield client.query(commentVotesQuery, [postId]);
        const commentUpvotes = parseInt(((_d = commentVotesResult.rows[0]) === null || _d === void 0 ? void 0 : _d.comment_up_votes) || '0');
        const commentDownvotes = parseInt(((_e = commentVotesResult.rows[0]) === null || _e === void 0 ? void 0 : _e.comment_down_votes) || '0');
        // Get report count (only APPROVED reports)
        const reportsQuery = `
      SELECT COUNT(*) as report_count
      FROM post_reports
      WHERE "postId" = $1 AND "status" = 'APPROVED'
    `;
        const reportsResult = yield client.query(reportsQuery, [postId]);
        const reportCount = parseInt(((_f = reportsResult.rows[0]) === null || _f === void 0 ? void 0 : _f.report_count) || '0');
        // Calculate verification score
        const baseScore = 50;
        const postUpvoteScore = postUpvotes * 2;
        const postDownvoteScore = postDownvotes * -1;
        const commentScore = commentCount * 1;
        const commentUpvoteScore = commentUpvotes * 0.5;
        const commentDownvoteScore = commentDownvotes * -0.25;
        const reportScore = reportCount * -5;
        const verificationScore = baseScore +
            postUpvoteScore +
            postDownvoteScore +
            commentScore +
            commentUpvoteScore +
            commentDownvoteScore +
            reportScore;
        // Update post with new verification score and report count
        const updateQuery = `
      UPDATE posts
      SET "verificationScore" = $1, "reportCount" = $2, "updatedAt" = $3
      WHERE id = $4
    `;
        yield client.query(updateQuery, [
            verificationScore,
            reportCount,
            new Date(),
            postId,
        ]);
        // Auto-remove post if verification score <= 0 OR report count >= 10
        if (verificationScore <= 0 || reportCount >= 10) {
            const deleteQuery = `
        UPDATE posts
        SET "isDeleted" = true, "updatedAt" = $1
        WHERE id = $2
      `;
            yield client.query(deleteQuery, [new Date(), postId]);
        }
        return verificationScore;
    });
    // If transaction client provided, use it; otherwise create new transaction
    if (transactionClient) {
        return yield executeQuery(transactionClient);
    }
    else {
        return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
            return yield executeQuery(client);
        }));
    }
});
// Report Post Feature
const reportPost = (postId, userId, reportData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // Check if post exists
        const postQuery = `
      SELECT id FROM posts WHERE id = $1 AND "isDeleted" = false
    `;
        const postResult = yield client.query(postQuery, [postId]);
        if (postResult.rows.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Post not found');
        }
        // Check if user already reported this post
        const existingReportQuery = `
      SELECT id FROM post_reports
      WHERE "postId" = $1 AND "userId" = $2
    `;
        const existingReportResult = yield client.query(existingReportQuery, [
            postId,
            userId,
        ]);
        if (existingReportResult.rows.length > 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already reported this post');
        }
        // Create report with PENDING status
        const reportId = generateUuid();
        const insertReportQuery = `
      INSERT INTO post_reports (id, "postId", "userId", reason, description, status, "createdAt")
      VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
      RETURNING *
    `;
        yield client.query(insertReportQuery, [
            reportId,
            postId,
            userId,
            reportData.reason,
            reportData.description || null,
            new Date(),
        ]);
        // Note: Verification score is NOT recalculated here
        // It will only update when admin approves the report
        const currentScoreQuery = `SELECT "verificationScore" FROM posts WHERE id = $1`;
        const scoreResult = yield client.query(currentScoreQuery, [postId]);
        return {
            message: 'Report submitted successfully. It will be reviewed by an admin.',
            verificationScore: ((_a = scoreResult.rows[0]) === null || _a === void 0 ? void 0 : _a.verificationScore) || 50,
        };
    }));
});
// Get reports for a post (Admin only)
const getPostReports = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT 
      pr.*,
      u.name as "userName",
      u.email as "userEmail",
      u."profilePhoto" as "userProfilePhoto",
      reviewer.name as "reviewerName",
      reviewer.email as "reviewerEmail"
    FROM post_reports pr
    INNER JOIN users u ON pr."userId" = u.id
    LEFT JOIN users reviewer ON pr."reviewedBy" = reviewer.id
    WHERE pr."postId" = $1
    ORDER BY 
      CASE pr.status 
        WHEN 'PENDING' THEN 1 
        WHEN 'APPROVED' THEN 2 
        WHEN 'REJECTED' THEN 3 
      END,
      pr."createdAt" DESC
  `;
    const result = yield database_1.default.query(query, [postId]);
    return result.rows;
});
// Get all pending reports (Admin only)
const getAllPendingReports = () => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT 
      pr.*,
      u.name as "userName",
      u.email as "userEmail",
      u."profilePhoto" as "userProfilePhoto",
      p.title as "postTitle",
      p."verificationScore" as "postVerificationScore"
    FROM post_reports pr
    INNER JOIN users u ON pr."userId" = u.id
    INNER JOIN posts p ON pr."postId" = p.id
    WHERE pr.status = 'PENDING' AND p."isDeleted" = false
    ORDER BY pr."createdAt" DESC
  `;
    const result = yield database_1.default.query(query);
    return result.rows;
});
// Review report (Approve or Reject) - Admin only
const reviewReport = (reportId, adminId, action) => __awaiter(void 0, void 0, void 0, function* () {
    return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
        // Get report details
        const reportQuery = `
      SELECT * FROM post_reports WHERE id = $1
    `;
        const reportResult = yield client.query(reportQuery, [
            reportId,
        ]);
        if (reportResult.rows.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
        }
        const report = reportResult.rows[0];
        if (report.status !== 'PENDING') {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Report has already been reviewed');
        }
        // Update report status
        const updateReportQuery = `
      UPDATE post_reports
      SET status = $1, "reviewedBy" = $2, "reviewedAt" = $3
      WHERE id = $4
    `;
        yield client.query(updateReportQuery, [
            action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            adminId,
            new Date(),
            reportId,
        ]);
        // Recalculate verification score (will count approved reports)
        // Pass the transaction client so it can see the status update
        const newScore = yield calculateVerificationScore(report.postId, client);
        return {
            message: `Report ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
            verificationScore: newScore,
        };
    }));
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
    calculateVerificationScore,
    reportPost,
    getPostReports,
    getAllPendingReports,
    reviewReport,
};
