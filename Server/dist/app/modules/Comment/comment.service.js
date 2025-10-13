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
exports.CommentService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const post_service_raw_1 = require("../Post/post.service.raw");
const generateUuid = () => (0, crypto_1.randomBytes)(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
// Top-level comment vote helpers (mirror post vote behavior)
const addCommentVote = (commentId, userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
        const commentCheckQuery = `
      SELECT id FROM comments
      WHERE id = $1 AND "isDeleted" = false
    `;
        const commentResult = yield client.query(commentCheckQuery, [commentId]);
        if (commentResult.rows.length === 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
        }
        const existingVoteQuery = `
      SELECT * FROM comment_votes
      WHERE "userId" = $1 AND "commentId" = $2
    `;
        const existingVoteResult = yield client.query(existingVoteQuery, [userId, commentId]);
        const existingVote = existingVoteResult.rows[0];
        if (existingVote) {
            if (existingVote.type === type) {
                yield client.query(`DELETE FROM comment_votes WHERE id = $1`, [
                    existingVote.id,
                ]);
            }
            else {
                yield client.query(`UPDATE comment_votes SET type = $1, "createdAt" = $2 WHERE id = $3`, [type, new Date(), existingVote.id]);
            }
        }
        else {
            const voteId = (0, crypto_1.randomBytes)(16)
                .toString('hex')
                .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
            yield client.query(`INSERT INTO comment_votes (id, "userId", "commentId", type, "createdAt") VALUES ($1, $2, $3, $4, $5)`, [voteId, userId, commentId, type, new Date()]);
        }
        const commentQuery = `
      SELECT * FROM comments WHERE id = $1 AND "isDeleted" = false
    `;
        const commentRes = yield client.query(commentQuery, [commentId]);
        const comment = commentRes.rows[0];
        // Recalculate verification score for the post after comment vote
        if (comment === null || comment === void 0 ? void 0 : comment.postId) {
            yield post_service_raw_1.PostService.calculateVerificationScore(comment.postId);
        }
        return comment;
    }));
});
const addCommentUpvote = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addCommentVote(commentId, userId, 'UP');
});
const addCommentDownvote = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield addCommentVote(commentId, userId, 'DOWN');
});
const removeCommentVote = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteQuery = `
    DELETE FROM comment_votes
    WHERE "userId" = $1 AND "commentId" = $2
  `;
    yield database_1.default.query(deleteQuery, [userId, commentId]);
    const commentQuery = `
    SELECT * FROM comments WHERE id = $1 AND "isDeleted" = false
  `;
    const result = yield database_1.default.query(commentQuery, [commentId]);
    const comment = result.rows[0];
    // Recalculate verification score for the post after comment vote removal
    if (comment === null || comment === void 0 ? void 0 : comment.postId) {
        yield post_service_raw_1.PostService.calculateVerificationScore(comment.postId);
    }
    return comment;
});
const removeCommentUpvote = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield removeCommentVote(commentId, userId);
});
const removeCommentDownvote = (commentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield removeCommentVote(commentId, userId);
});
exports.CommentService = {
    createComment: (commentData, authorId) => __awaiter(void 0, void 0, void 0, function* () {
        const commentId = generateUuid();
        const now = new Date();
        // If parentId is provided, validate the parent exists and belongs to same post
        if (commentData.parentId) {
            const parentQuery = `SELECT id, "postId" FROM comments WHERE id = $1 AND "isDeleted" = false`;
            const parentRes = yield database_1.default.query(parentQuery, [commentData.parentId]);
            const parent = parentRes.rows[0];
            if (!parent) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Parent comment not found');
            }
            if (parent.postId !== commentData.postId) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Parent comment does not belong to the same post');
            }
        }
        const query = `
            INSERT INTO comments (id, content, image, "postId", "parentId", "authorId", "isDeleted", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
            RETURNING *
        `;
        const values = [
            commentId,
            commentData.content,
            commentData.image || null,
            commentData.postId,
            commentData.parentId || null,
            authorId,
            now,
            now,
        ];
        const result = yield database_1.default.query(query, values);
        const createdComment = result.rows[0];
        if (!createdComment) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create comment');
        }
        // Recalculate verification score for the post after comment is added
        yield post_service_raw_1.PostService.calculateVerificationScore(commentData.postId);
        return createdComment;
    }),
    updateComment: (id, updateData, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    deleteComment: (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    getCommentsByPost: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        const query = `
      SELECT
        c.*,
        u.name as "authorName",
        u."profilePhoto" as "authorProfilePhoto"
      FROM comments c
      INNER JOIN users u ON c."authorId" = u.id
      WHERE c."postId" = $1 AND c."isDeleted" = false
      ORDER BY c."createdAt" DESC
    `;
        const result = yield database_1.default.query(query, [postId]);
        const comments = result.rows;
        const commentIds = comments.map((c) => c.id);
        if (commentIds.length === 0)
            return comments;
        const votesQuery = `
      SELECT cv.*, u.name as "userName"
      FROM comment_votes cv
      INNER JOIN users u ON cv."userId" = u.id
      WHERE cv."commentId" = ANY($1)
      ORDER BY cv."createdAt" DESC
    `;
        const votesResult = yield database_1.default.query(votesQuery, [commentIds]);
        const votesByComment = votesResult.rows.reduce((acc, vote) => {
            if (!acc[vote.commentId])
                acc[vote.commentId] = [];
            acc[vote.commentId].push(vote);
            return acc;
        }, {});
        // attach votes
        const commentsWithVotes = comments.map((c) => (Object.assign(Object.assign({}, c), { votes: votesByComment[c.id] || [], children: [] })));
        // Build nested tree
        const byId = commentsWithVotes.reduce((acc, c) => {
            acc[c.id] = c;
            return acc;
        }, {});
        const tree = [];
        commentsWithVotes.forEach((c) => {
            if (c.parentId) {
                const parent = byId[c.parentId];
                if (parent) {
                    parent.children.push(c);
                }
                else {
                    // parent missing (shouldn't happen), push as root
                    tree.push(c);
                }
            }
            else {
                tree.push(c);
            }
        });
        return tree;
    }),
    addCommentVote: addCommentVote,
    addCommentUpvote: addCommentUpvote,
    addCommentDownvote: addCommentDownvote,
    removeCommentVote: removeCommentVote,
    removeCommentUpvote: removeCommentUpvote,
    removeCommentDownvote: removeCommentDownvote,
};
exports.default = exports.CommentService;
