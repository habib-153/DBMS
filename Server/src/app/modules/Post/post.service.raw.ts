import { PoolClient } from 'pg';
import { randomBytes } from 'crypto';
import database from '../../../shared/database';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import {
  DbPost,
  DbPostWithAuthor,
  DbPostWithDetails,
  DbPostVote,
  DbComment,
  PaginatedResult,
} from '../../interfaces/database.types';
import { TCreatePost, TUpdatePost } from './post.interface';
import { TUser } from '../User/user.interface';
import { TImageFile } from '../../interfaces/image.interface';

// Simple UUID generator replacement
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const createPost = async (
  postData: TCreatePost,
  imageFile: TImageFile,
  authorId: string
): Promise<DbPostWithDetails> => {
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

  const result = await database.query<DbPost>(query, values);
  const createdPost = result.rows[0];

  if (!createdPost) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create post'
    );
  }

  // Get post with author details
  const postWithDetails = await getSinglePost(createdPost.id);
  return postWithDetails;
};

const getAllPosts = async (
  filters: Record<string, unknown>
): Promise<PaginatedResult<DbPostWithAuthor>> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    searchTerm,
    authorEmail,
    ...filterData
  } = filters;
  console.log('filters:', filterData);
  const offset = (Number(page) - 1) * Number(limit);
  const conditions: string[] = [`p."isDeleted" = false`];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Add search conditions
  if (searchTerm) {
    conditions.push(
      `(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`
    );
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
  console.log(conditions, 'conditions');
  if (filterData.status) {
    conditions.push(`p.status = $${paramIndex}`);
    values.push(filterData.status);
    paramIndex++;
  } else {
    // Default: show only APPROVED and PENDING posts
    conditions.push(`p.status IN ('APPROVED', 'PENDING')`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  console.log(whereClause);
  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM posts p
    INNER JOIN users u ON p."authorId" = u.id
    ${whereClause}
  `;

  const countResult = await database.query<{ total: string }>(
    countQuery,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);
  console.log(sortBy, 'sortBy', sortOrder, 'sortOrder');
  // Determine ORDER BY clause
  let orderByClause = '';
  if (sortBy === 'votes') {
    orderByClause = `ORDER BY (COALESCE(vote_counts.up_votes, 0) + COALESCE(vote_counts.down_votes, 0)) ${sortOrder}`;
  } else {
    orderByClause = `ORDER BY p."${sortBy as string}" ${sortOrder}`;
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

  const result = await database.query<DbPostWithAuthor>(mainQuery, values);
  const posts = result.rows;
  const postIds = posts.map((post) => post.id);

  // Fetch votes for all posts in this page
  let votesByPost: Record<string, (DbPostVote & { userName: string })[]> = {};
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
    const votesResult = await database.query<DbPostVote & { userName: string }>(
      votesQuery,
      [postIds]
    );
    votesByPost = votesResult.rows.reduce((acc, vote) => {
      if (!acc[vote.postId]) acc[vote.postId] = [];
      acc[vote.postId].push(vote);
      return acc;
    }, {} as Record<string, (DbPostVote & { userName: string })[]>);
  }

  // Attach votes array to each post
  const postsWithVotes = posts.map((post) => ({
    ...post,
    votes: votesByPost[post.id] || [],
  }));

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: postsWithVotes,
  };
};

const getSinglePost = async (id: string): Promise<DbPostWithDetails> => {
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

  const postResult = await database.query<DbPostWithAuthor>(postQuery, [id]);
  const post = postResult.rows[0];

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
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

  const votesResult = await database.query<DbPostVote & { userName: string }>(
    votesQuery,
    [id]
  );

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

  const commentsResult = await database.query<
    DbComment & { authorName: string; authorProfilePhoto?: string }
  >(commentsQuery, [id]);

  // Calculate vote counts
  const upVotes = votesResult.rows.filter((vote) => vote.type === 'UP').length;
  const downVotes = votesResult.rows.filter(
    (vote) => vote.type === 'DOWN'
  ).length;

  return {
    ...post,
    upVotes,
    downVotes,
    voteCount: upVotes + downVotes,
    commentCount: commentsResult.rows.length,
    votes: votesResult.rows,
    comments: commentsResult.rows,
  };
};

const updatePost = async (
  id: string,
  updateData: TUpdatePost,
  imageFile: TImageFile | undefined,
  userId: string
): Promise<DbPostWithDetails> => {
  // First, check if post exists and user owns it
  const checkQuery = `
    SELECT * FROM posts 
    WHERE id = $1 AND "isDeleted" = false
  `;

  const checkResult = await database.query<DbPost>(checkQuery, [id]);
  const post = checkResult.rows[0];

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this post'
    );
  }

  // Build update query dynamically
  const updateFields: string[] = [];
  const values: unknown[] = [];
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
    throw new AppError(httpStatus.BAD_REQUEST, 'No fields to update');
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

  const result = await database.query<DbPost>(updateQuery, values);
  const updatedPost = result.rows[0];

  if (!updatedPost) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update post'
    );
  }

  // Return post with details
  return await getSinglePost(updatedPost.id);
};

const deletePost = async (
  id: string,
  userId: string
): Promise<{ message: string }> => {
  // Check if post exists and user owns it
  const checkQuery = `
    SELECT * FROM posts 
    WHERE id = $1 AND "isDeleted" = false
  `;

  const checkResult = await database.query<DbPost>(checkQuery, [id]);
  const post = checkResult.rows[0];

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.authorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this post'
    );
  }

  // Soft delete the post
  const deleteQuery = `
    UPDATE posts 
    SET "isDeleted" = true, "updatedAt" = $1
    WHERE id = $2
  `;

  await database.query(deleteQuery, [new Date(), id]);

  return { message: 'Post deleted successfully' };
};

// Vote functionality
const addPostVote = async (
  postId: string,
  userId: string,
  type: 'UP' | 'DOWN'
): Promise<DbPostWithDetails> => {
  return await database.transaction(async (client: PoolClient) => {
    // Check if post exists
    const postCheckQuery = `
      SELECT id FROM posts 
      WHERE id = $1 AND "isDeleted" = false
    `;

    const postResult = await client.query(postCheckQuery, [postId]);
    if (postResult.rows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
    }
    // Check if user already voted
    const existingVoteQuery = `
      SELECT * FROM post_votes 
      WHERE "userId" = $1 AND "postId" = $2
    `;

    const existingVoteResult = await client.query<DbPostVote>(
      existingVoteQuery,
      [userId, postId]
    );
    const existingVote = existingVoteResult.rows[0];

    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type - remove the vote
        await client.query(`DELETE FROM post_votes WHERE id = $1`, [
          existingVote.id,
        ]);
      } else {
        // Different vote type - update the vote
        await client.query(
          `UPDATE post_votes SET type = $1, "createdAt" = $2 WHERE id = $3`,
          [type, new Date(), existingVote.id]
        );
      }
    } else {
      // New vote
      const voteId = generateUuid();
      await client.query(
        `INSERT INTO post_votes (id, "userId", "postId", type, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
        [voteId, userId, postId, type, new Date()]
      );
    }

    // Return updated post details
    return await getSinglePost(postId);
  });
};

const addPostUpvote = async (postId: string, user: TUser) => {
  return await addPostVote(postId, user.id, 'UP');
};

const addPostDownvote = async (postId: string, user: TUser) => {
  return await addPostVote(postId, user.id, 'DOWN');
};

const removePostVote = async (
  postId: string,
  userId: string
): Promise<DbPostWithDetails> => {
  const deleteQuery = `
    DELETE FROM post_votes 
    WHERE "userId" = $1 AND "postId" = $2
  `;

  await database.query(deleteQuery, [userId, postId]);
  return await getSinglePost(postId);
};

const removePostUpvote = async (postId: string, user: TUser) => {
  return await removePostVote(postId, user.id);
};

const removePostDownvote = async (postId: string, user: TUser) => {
  return await removePostVote(postId, user.id);
};

export const PostService = {
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
};
