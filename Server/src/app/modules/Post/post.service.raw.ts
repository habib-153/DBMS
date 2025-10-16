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
  DbPostReport,
  DbPostReportWithUser,
  PaginatedResult,
} from '../../interfaces/database.types';
import { TCreatePost, TUpdatePost, TReportPost } from './post.interface';
import { TUser } from '../User/user.interface';
import { TImageFile } from '../../interfaces/image.interface';
import { JwtPayload } from 'jsonwebtoken';

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
    INSERT INTO posts (id, title, description, image, location, district, division, "crimeDate", category, "authorId", latitude, longitude, status, "isDeleted", "postDate", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING', false, $13, $14, $15)
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
    postData.latitude ?? null,
    postData.longitude ?? null,
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

  // Trigger AI analysis asynchronously (non-blocking)
  if (imageFile && imageFile.path) {
    // Import AIAnalysisService dynamically to avoid circular dependencies
    import('../AIAnalysis/aianalysis.service')
      .then(({ AIAnalysisService }) => {
        AIAnalysisService.analyzeImageWithRoboflow(
          imageFile.path,
          createdPost.id
        ).catch((error) => {
          console.error('AI analysis failed:', error);
        });
      })
      .catch((err) => {
        console.error('Failed to import AI service:', err);
      });
  }

  // Get post with author details
  const postWithDetails = await getSinglePost(createdPost.id);
  return postWithDetails;
};

const getAllPosts = async (
  filters: Record<string, unknown>,
  user: JwtPayload
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

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isViewingOwnPosts = authorEmail && user?.email === authorEmail;

  if (!isAdmin && !isViewingOwnPosts && !filterData.status) {
    // Regular users only see APPROVED posts
    conditions.push(`p.status = 'APPROVED'`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

  const reportsResult = await database.query<DbPostReportWithUser>(
    reportsQuery,
    [id]
  );

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
    reports: reportsResult.rows,
  };
};

const updatePost = async (
  id: string,
  updateData: TUpdatePost,
  imageFile: TImageFile | undefined,
  user: JwtPayload
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

  const isOwner = post.authorId === user.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (!isOwner && !isAdmin) {
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

  // Send push notification and create notification if status was changed by admin
  if (
    updateData.status !== undefined &&
    isAdmin &&
    post.status !== updateData.status
  ) {
    // Create notification in database
    import('../Notification/notification.service')
      .then(({ NotificationService }) => {
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
      .catch((err) =>
        console.error('Failed to import NotificationService:', err)
      );

    // Send push notification
    import('../PushNotification/push.service')
      .then(({ PushNotificationService }) => {
        PushNotificationService.sendPostStatusPush(
          post.authorId,
          post.title,
          updateData.status as 'APPROVED' | 'REJECTED'
        ).catch((err) =>
          console.error('Failed to send post status push notification:', err)
        );
      })
      .catch((err) =>
        console.error('Failed to import PushNotificationService:', err)
      );
  }

  // Return post with details
  return await getSinglePost(updatedPost.id);
};

const deletePost = async (
  id: string,
  user: JwtPayload
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

  const isOwner = post.authorId === user.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this post'
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

    // Recalculate verification score after vote change
    await calculateVerificationScore(postId);

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
  const result = await removePostVote(postId, user.id);
  // Recalculate verification score after vote removal
  await calculateVerificationScore(postId);
  return result;
};

const removePostDownvote = async (postId: string, user: TUser) => {
  const result = await removePostVote(postId, user.id);
  // Recalculate verification score after vote removal
  await calculateVerificationScore(postId);
  return result;
};

// Verification Score Calculation
// Formula: Base(50) + (PostUpvotes * 2) - (PostDownvotes * 1) + (Comments * 1) + (CommentUpvotes * 0.5) - (CommentDownvotes * 0.25) - (Reports * 5)
const calculateVerificationScore = async (
  postId: string,
  transactionClient?: PoolClient
): Promise<number> => {
  const executeQuery = async (client: PoolClient) => {
    // Get post votes
    const postVotesQuery = `
      SELECT 
        COUNT(CASE WHEN type = 'UP' THEN 1 END) as up_votes,
        COUNT(CASE WHEN type = 'DOWN' THEN 1 END) as down_votes
      FROM post_votes
      WHERE "postId" = $1
    `;
    const postVotesResult = await client.query<{
      up_votes: string;
      down_votes: string;
    }>(postVotesQuery, [postId]);
    const postUpvotes = parseInt(postVotesResult.rows[0]?.up_votes || '0');
    const postDownvotes = parseInt(postVotesResult.rows[0]?.down_votes || '0');

    // Get comments count for this post
    const commentsQuery = `
      SELECT COUNT(*) as comment_count
      FROM comments
      WHERE "postId" = $1 AND "isDeleted" = false
    `;
    const commentsResult = await client.query<{ comment_count: string }>(
      commentsQuery,
      [postId]
    );
    const commentCount = parseInt(commentsResult.rows[0]?.comment_count || '0');

    // Get comment votes for all comments on this post
    const commentVotesQuery = `
      SELECT 
        COUNT(CASE WHEN cv.type = 'UP' THEN 1 END) as comment_up_votes,
        COUNT(CASE WHEN cv.type = 'DOWN' THEN 1 END) as comment_down_votes
      FROM comment_votes cv
      INNER JOIN comments c ON cv."commentId" = c.id
      WHERE c."postId" = $1 AND c."isDeleted" = false
    `;
    const commentVotesResult = await client.query<{
      comment_up_votes: string;
      comment_down_votes: string;
    }>(commentVotesQuery, [postId]);
    const commentUpvotes = parseInt(
      commentVotesResult.rows[0]?.comment_up_votes || '0'
    );
    const commentDownvotes = parseInt(
      commentVotesResult.rows[0]?.comment_down_votes || '0'
    );

    // Get report count (only APPROVED reports)
    const reportsQuery = `
      SELECT COUNT(*) as report_count
      FROM post_reports
      WHERE "postId" = $1 AND "status" = 'APPROVED'
    `;
    const reportsResult = await client.query<{ report_count: string }>(
      reportsQuery,
      [postId]
    );
    const reportCount = parseInt(reportsResult.rows[0]?.report_count || '0');

    // Calculate verification score
    const baseScore = 50;
    const postUpvoteScore = postUpvotes * 2;
    const postDownvoteScore = postDownvotes * -1;
    const commentScore = commentCount * 1;
    const commentUpvoteScore = commentUpvotes * 0.5;
    const commentDownvoteScore = commentDownvotes * -0.25;
    const reportScore = reportCount * -5;

    const verificationScore =
      baseScore +
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
    await client.query(updateQuery, [
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
      await client.query(deleteQuery, [new Date(), postId]);
    }

    return verificationScore;
  };

  // If transaction client provided, use it; otherwise create new transaction
  if (transactionClient) {
    return await executeQuery(transactionClient);
  } else {
    return await database.transaction(async (client: PoolClient) => {
      return await executeQuery(client);
    });
  }
};

// Report Post Feature
const reportPost = async (
  postId: string,
  userId: string,
  reportData: TReportPost
): Promise<{ message: string; verificationScore: number }> => {
  return await database.transaction(async (client: PoolClient) => {
    // Check if post exists
    const postQuery = `
      SELECT id FROM posts WHERE id = $1 AND "isDeleted" = false
    `;
    const postResult = await client.query(postQuery, [postId]);
    if (postResult.rows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
    }

    // Check if user already reported this post
    const existingReportQuery = `
      SELECT id FROM post_reports
      WHERE "postId" = $1 AND "userId" = $2
    `;
    const existingReportResult = await client.query(existingReportQuery, [
      postId,
      userId,
    ]);

    if (existingReportResult.rows.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have already reported this post'
      );
    }

    // Create report with PENDING status
    const reportId = generateUuid();
    const insertReportQuery = `
      INSERT INTO post_reports (id, "postId", "userId", reason, description, status, "createdAt")
      VALUES ($1, $2, $3, $4, $5, 'PENDING', $6)
      RETURNING *
    `;
    await client.query<DbPostReport>(insertReportQuery, [
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
    const scoreResult = await client.query<{ verificationScore: number }>(
      currentScoreQuery,
      [postId]
    );

    return {
      message:
        'Report submitted successfully. It will be reviewed by an admin.',
      verificationScore: scoreResult.rows[0]?.verificationScore || 50,
    };
  });
};

// Get reports for a post (Admin only)
const getPostReports = async (
  postId: string
): Promise<DbPostReportWithUser[]> => {
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

  const result = await database.query<DbPostReportWithUser>(query, [postId]);
  return result.rows;
};

// Get all pending reports (Admin only)
const getAllPendingReports = async (): Promise<DbPostReportWithUser[]> => {
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

  const result = await database.query<DbPostReportWithUser>(query);
  return result.rows;
};

// Review report (Approve or Reject) - Admin only
const reviewReport = async (
  reportId: string,
  adminId: string,
  action: 'APPROVE' | 'REJECT'
): Promise<{ message: string; verificationScore?: number }> => {
  return await database.transaction(async (client: PoolClient) => {
    // Get report details
    const reportQuery = `
      SELECT * FROM post_reports WHERE id = $1
    `;
    const reportResult = await client.query<DbPostReport>(reportQuery, [
      reportId,
    ]);

    if (reportResult.rows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'Report not found');
    }

    const report = reportResult.rows[0];

    if (report.status !== 'PENDING') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Report has already been reviewed'
      );
    }

    // Update report status
    const updateReportQuery = `
      UPDATE post_reports
      SET status = $1, "reviewedBy" = $2, "reviewedAt" = $3
      WHERE id = $4
    `;
    await client.query(updateReportQuery, [
      action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      adminId,
      new Date(),
      reportId,
    ]);

    // Recalculate verification score (will count approved reports)
    // Pass the transaction client so it can see the status update
    const newScore = await calculateVerificationScore(report.postId, client);

    return {
      message: `Report ${
        action === 'APPROVE' ? 'approved' : 'rejected'
      } successfully`,
      verificationScore: newScore,
    };
  });
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
  calculateVerificationScore,
  reportPost,
  getPostReports,
  getAllPendingReports,
  reviewReport,
};
