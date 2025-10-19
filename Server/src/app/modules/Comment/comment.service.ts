/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { randomBytes } from 'crypto';
import { PoolClient } from 'pg';
import { DbComment, DbCommentVote } from '../../interfaces/database.types';
import { TCreateComment, TUpdateComment } from './comment.interface';
import database from '../../../shared/database';
import AppError from '../../errors/AppError';
import { PostService } from '../Post/post.service.raw';
import { TImageFile } from '../../interfaces/image.interface';

const generateUuid = (): string =>
  randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

// Top-level comment vote helpers (mirror post vote behavior)
const addCommentVote = async (
  commentId: string,
  userId: string,
  type: 'UP' | 'DOWN'
): Promise<DbComment> => {
  return await database.transaction(async (client: PoolClient) => {
    const commentCheckQuery = `
      SELECT id FROM comments
      WHERE id = $1 AND "isDeleted" = false
    `;

    const commentResult = await client.query(commentCheckQuery, [commentId]);
    if (commentResult.rows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    const existingVoteQuery = `
      SELECT * FROM comment_votes
      WHERE "userId" = $1 AND "commentId" = $2
    `;

    const existingVoteResult = await client.query<DbCommentVote>(
      existingVoteQuery,
      [userId, commentId]
    );
    const existingVote = existingVoteResult.rows[0];

    if (existingVote) {
      if (existingVote.type === type) {
        await client.query(`DELETE FROM comment_votes WHERE id = $1`, [
          existingVote.id,
        ]);
      } else {
        await client.query(
          `UPDATE comment_votes SET type = $1, "createdAt" = $2 WHERE id = $3`,
          [type, new Date(), existingVote.id]
        );
      }
    } else {
      const voteId = randomBytes(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
      await client.query(
        `INSERT INTO comment_votes (id, "userId", "commentId", type, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
        [voteId, userId, commentId, type, new Date()]
      );
    }

    const commentQuery = `
      SELECT * FROM comments WHERE id = $1 AND "isDeleted" = false
    `;
    const commentRes = await client.query<DbComment>(commentQuery, [commentId]);
    const comment = commentRes.rows[0];

    // Recalculate verification score for the post after comment vote
    if (comment?.postId) {
      await PostService.calculateVerificationScore(comment.postId);
    }

    return comment;
  });
};

const addCommentUpvote = async (commentId: string, userId: string) => {
  return await addCommentVote(commentId, userId, 'UP');
};

const addCommentDownvote = async (commentId: string, userId: string) => {
  return await addCommentVote(commentId, userId, 'DOWN');
};

const removeCommentVote = async (commentId: string, userId: string) => {
  const deleteQuery = `
    DELETE FROM comment_votes
    WHERE "userId" = $1 AND "commentId" = $2
  `;

  await database.query(deleteQuery, [userId, commentId]);

  const commentQuery = `
    SELECT * FROM comments WHERE id = $1 AND "isDeleted" = false
  `;
  const result = await database.query<DbComment>(commentQuery, [commentId]);
  const comment = result.rows[0];

  // Recalculate verification score for the post after comment vote removal
  if (comment?.postId) {
    await PostService.calculateVerificationScore(comment.postId);
  }

  return comment;
};

const removeCommentUpvote = async (commentId: string, userId: string) => {
  return await removeCommentVote(commentId, userId);
};

const removeCommentDownvote = async (commentId: string, userId: string) => {
  return await removeCommentVote(commentId, userId);
};

export const CommentService = {
  createComment: async (
    commentData: TCreateComment,
    authorId: string,
    imageFile?: TImageFile
  ): Promise<DbComment> => {
    const commentId = generateUuid();
    const now = new Date();
    // If parentId is provided, validate the parent exists and belongs to same post
    if (commentData.parentId) {
      const parentQuery = `SELECT id, "postId" FROM comments WHERE id = $1 AND "isDeleted" = false`;
      const parentRes = await database.query(parentQuery, [
        commentData.parentId,
      ]);
      const parent = parentRes.rows[0];
      if (!parent) {
        throw new AppError(httpStatus.NOT_FOUND, 'Parent comment not found');
      }
      if (parent.postId !== commentData.postId) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Parent comment does not belong to the same post'
        );
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
      imageFile?.path || commentData.image || null,
      commentData.postId,
      commentData.parentId || null,
      authorId,
      now,
      now,
    ];

    const result = await database.query<DbComment>(query, values);
    const createdComment = result.rows[0];

    if (!createdComment) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create comment'
      );
    }

    // Recalculate verification score for the post after comment is added
    await PostService.calculateVerificationScore(commentData.postId);

    return createdComment;
  },

  updateComment: async (
    id: string,
    updateData: TUpdateComment,
    userId: string,
    imageFile?: TImageFile
  ): Promise<DbComment> => {
    // Check if comment exists and user owns it
    const checkQuery = `
			SELECT * FROM comments 
			WHERE id = $1 AND "isDeleted" = false
		`;

    const checkResult = await database.query<DbComment>(checkQuery, [id]);
    const comment = checkResult.rows[0];

    if (!comment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You are not authorized to update this comment'
      );
    }

    // Build update query
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updateData.content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      values.push(updateData.content);
      paramIndex++;
    }

    if (imageFile) {
      updateFields.push(`image = $${paramIndex}`);
      values.push(imageFile.path);
      paramIndex++;
    } else if (updateData.image !== undefined) {
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

    const result = await database.query<DbComment>(updateQuery, values);
    return result.rows[0];
  },

  deleteComment: async (
    id: string,
    userId: string
  ): Promise<{ message: string }> => {
    // Check if comment exists and user owns it
    const checkQuery = `
			SELECT * FROM comments 
			WHERE id = $1 AND "isDeleted" = false
		`;

    const checkResult = await database.query<DbComment>(checkQuery, [id]);
    const comment = checkResult.rows[0];

    if (!comment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You are not authorized to delete this comment'
      );
    }

    // Soft delete the comment
    const deleteQuery = `
			UPDATE comments 
			SET "isDeleted" = true, "updatedAt" = $1
			WHERE id = $2
		`;

    await database.query(deleteQuery, [new Date(), id]);

    return { message: 'Comment deleted successfully' };
  },

  getCommentsByPost: async (postId: string): Promise<DbComment[]> => {
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

    const result = await database.query<
      DbComment & { authorName: string; authorProfilePhoto?: string }
    >(query, [postId]);
    const comments = result.rows;

    const commentIds = comments.map((c) => c.id);
    if (commentIds.length === 0) return comments;

    const votesQuery = `
      SELECT cv.*, u.name as "userName"
      FROM comment_votes cv
      INNER JOIN users u ON cv."userId" = u.id
      WHERE cv."commentId" = ANY($1)
      ORDER BY cv."createdAt" DESC
    `;

    const votesResult = await database.query<
      DbCommentVote & { userName: string }
    >(votesQuery, [commentIds]);
    const votesByComment = votesResult.rows.reduce((acc, vote) => {
      if (!acc[vote.commentId]) acc[vote.commentId] = [];
      acc[vote.commentId].push(vote);
      return acc;
    }, {} as Record<string, (DbCommentVote & { userName: string })[]>);

    // attach votes
    const commentsWithVotes = comments.map((c) => ({
      ...c,
      votes: votesByComment[c.id] || [],
      children: [] as DbComment[],
    }));

    // Build nested tree
    const byId = commentsWithVotes.reduce((acc, c: any) => {
      acc[c.id] = c;
      return acc;
    }, {} as Record<string, any>);

    const tree: any[] = [];

    commentsWithVotes.forEach((c: any) => {
      if (c.parentId) {
        const parent = byId[c.parentId];
        if (parent) {
          parent.children.push(c);
        } else {
          // parent missing (shouldn't happen), push as root
          tree.push(c);
        }
      } else {
        tree.push(c);
      }
    });

    return tree;
  },
  addCommentVote: addCommentVote,
  addCommentUpvote: addCommentUpvote,
  addCommentDownvote: addCommentDownvote,
  removeCommentVote: removeCommentVote,
  removeCommentUpvote: removeCommentUpvote,
  removeCommentDownvote: removeCommentDownvote,
};

export default CommentService;
