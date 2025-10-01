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
const createPost = (postData, imageFile, authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = generateUuid();
    const crimeDate = new Date(postData.crimeDate);
    const now = new Date();
    const query = `
    INSERT INTO posts (id, title, description, image, location, district, division, "crimeDate", "authorId", status, "isDeleted", "postDate", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', false, $10, $11, $12)
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
        authorId,
        now,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdPost = result.rows[0];
    if (!createdPost) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create post');
    }
    // Get post with author details
    const postWithDetails = yield getSinglePost(createdPost.id);
    return postWithDetails;
});
const getAllPosts = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchTerm } = filters, filterData = __rest(filters, ["page", "limit", "sortBy", "sortOrder", "searchTerm"]);
    console.log('filters:', filterData);
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
    console.log(conditions, 'conditions');
    if (filterData.status) {
        conditions.push(`p.status = $${paramIndex}`);
        values.push(filterData.status);
        paramIndex++;
    }
    else {
        // Default: show only APPROVED and PENDING posts
        conditions.push(`p.status IN ('APPROVED', 'PENDING')`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    console.log(whereClause);
    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    FROM posts p
    ${whereClause}
  `;
    const countResult = yield database_1.default.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    console.log(sortBy, 'sortBy', sortOrder, 'sortOrder');
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
    // Calculate vote counts
    const upVotes = votesResult.rows.filter((vote) => vote.type === 'UP').length;
    const downVotes = votesResult.rows.filter((vote) => vote.type === 'DOWN').length;
    return Object.assign(Object.assign({}, post), { upVotes,
        downVotes, voteCount: upVotes + downVotes, commentCount: commentsResult.rows.length, votes: votesResult.rows, comments: commentsResult.rows });
});
const updatePost = (id, updateData, imageFile, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (post.authorId !== userId) {
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
    // Return post with details
    return yield getSinglePost(updatedPost.id);
});
const deletePost = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (post.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to delete this post');
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
    return yield removePostVote(postId, user.id);
});
const removePostDownvote = (postId, user) => __awaiter(void 0, void 0, void 0, function* () {
    return yield removePostVote(postId, user.id);
});
const createComment = (commentData, authorId) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = generateUuid();
    const now = new Date();
    const query = `
    INSERT INTO comments (id, content, image, "postId", "authorId", "isDeleted", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, false, $6, $7)
    RETURNING *
  `;
    const values = [
        commentId,
        commentData.content,
        commentData.image || null,
        commentData.postId,
        authorId,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdComment = result.rows[0];
    if (!createdComment) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create comment');
    }
    return createdComment;
});
const updateComment = (id, updateData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if comment exists and user owns it
    const checkQuery = `
    SELECT * FROM comments 
    WHERE id = $1 AND "isDeleted" = false
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    const comment = checkResult.rows[0];
    if (!comment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    if (comment.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to update this comment');
    }
    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    if (updateData.content !== undefined) {
        updateFields.push(`content = $${paramIndex}`);
        values.push(updateData.content);
        paramIndex++;
    }
    if (updateData.image !== undefined) {
        updateFields.push(`image = $${paramIndex}`);
        values.push(updateData.image);
        paramIndex++;
    }
    updateFields.push(`"updatedAt" = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;
    values.push(id);
    const updateQuery = `
    UPDATE comments 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
    const result = yield database_1.default.query(updateQuery, values);
    return result.rows[0];
});
const deleteComment = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if comment exists and user owns it
    const checkQuery = `
    SELECT * FROM comments 
    WHERE id = $1 AND "isDeleted" = false
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    const comment = checkResult.rows[0];
    if (!comment) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    if (comment.authorId !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not authorized to delete this comment');
    }
    // Soft delete the comment
    const deleteQuery = `
    UPDATE comments 
    SET "isDeleted" = true, "updatedAt" = $1
    WHERE id = $2
  `;
    yield database_1.default.query(deleteQuery, [new Date(), id]);
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
