import { randomBytes } from 'crypto';
import { PoolClient } from 'pg';
import httpStatus from 'http-status';

import database from '../../../shared/database';
import AppError from '../../errors/AppError';
import { DbUser, PaginatedResult } from '../../interfaces/database.types';
import { TUser } from './user.interface';
import { TImageFile } from '../../interfaces/image.interface';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const createUser = async (userData: Partial<TUser>): Promise<DbUser> => {
  const userId = generateUuid();
  const now = new Date();

  const query = `
    INSERT INTO users (
      id, name, email, password, phone, address, "profilePhoto", 
      role, status, "isVerified", "needPasswordChange", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;

  const values = [
    userId,
    userData.name,
    userData.email,
    userData.password,
    userData.phone || null,
    userData.address || null,
    userData.profilePhoto || null,
    userData.role || 'USER',
    userData.status || 'ACTIVE',
    userData.isVerified || false,
    userData.needPasswordChange || true,
    now,
    now,
  ];

  const result = await database.query<DbUser>(query, values);
  const createdUser = result.rows[0];

  if (!createdUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user'
    );
  }

  return createdUser;
};

const getAllUsers = async (
  filters: Record<string, unknown>
): Promise<PaginatedResult<DbUser>> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    searchTerm,
    ...filterData
  } = filters;

  const offset = (Number(page) - 1) * Number(limit);
  const conditions: string[] = [`status != 'DELETED'`];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Add search conditions
  if (searchTerm) {
    conditions.push(
      `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
    );
    values.push(`%${searchTerm}%`);
    paramIndex++;
  }

  // Add filter conditions
  if (filterData.role) {
    conditions.push(`role = $${paramIndex}`);
    values.push(filterData.role);
    paramIndex++;
  }

  if (filterData.status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(filterData.status);
    paramIndex++;
  }

  if (filterData.isVerified !== undefined) {
    conditions.push(`"isVerified" = $${paramIndex}`);
    values.push(filterData.isVerified);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total
    FROM users
    ${whereClause}
  `;

  const countResult = await database.query<{ total: string }>(
    countQuery,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Main query with pagination
  const mainQuery = `
    SELECT *
    FROM users
    ${whereClause}
    ORDER BY "${sortBy as string}" ${sortOrder as string}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  values.push(Number(limit), offset);

  const result = await database.query<DbUser>(mainQuery, values);

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
    data: result.rows,
  };
};

const getSingleUser = async (id: string): Promise<DbUser> => {
  const query = `
    SELECT *
    FROM users
    WHERE id = $1 AND status != 'DELETED'
  `;

  const result = await database.query<DbUser>(query, [id]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserByEmail = async (email: string): Promise<DbUser> => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1 AND status != 'DELETED'
  `;

  const result = await database.query<DbUser>(query, [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (
  id: string,
  updateData: Partial<TUser>,
  imageFile?: TImageFile
): Promise<DbUser> => {
  // Check if user exists
  const checkQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;

  const checkResult = await database.query<{ id: string }>(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Build update query dynamically
  const updateFields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updateData.name !== undefined) {
    updateFields.push(`name = $${paramIndex}`);
    values.push(updateData.name);
    paramIndex++;
  }

  if (updateData.phone !== undefined) {
    updateFields.push(`phone = $${paramIndex}`);
    values.push(updateData.phone);
    paramIndex++;
  }

  if (updateData.address !== undefined) {
    updateFields.push(`address = $${paramIndex}`);
    values.push(updateData.address);
    paramIndex++;
  }

  if (imageFile) {
    updateFields.push(`"profilePhoto" = $${paramIndex}`);
    values.push(imageFile.path);
    paramIndex++;
  }

  if (updateData.isVerified !== undefined) {
    updateFields.push(`"isVerified" = $${paramIndex}`);
    values.push(updateData.isVerified);
    paramIndex++;
  }

  if (updateData.role !== undefined) {
    updateFields.push(`role = $${paramIndex}`);
    values.push(updateData.role);
    paramIndex++;
  }

  if (updateData.status !== undefined) {
    updateFields.push(`status = $${paramIndex}`);
    values.push(updateData.status);
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
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await database.query<DbUser>(updateQuery, values);
  const updatedUser = result.rows[0];

  if (!updatedUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update user'
    );
  }

  return updatedUser;
};

const deleteUser = async (id: string): Promise<{ message: string }> => {
  // Check if user exists
  const checkQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;

  const checkResult = await database.query<{ id: string }>(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Soft delete the user
  const deleteQuery = `
    UPDATE users 
    SET status = 'DELETED', "updatedAt" = $1
    WHERE id = $2
  `;

  await database.query(deleteQuery, [new Date(), id]);

  return { message: 'User deleted successfully' };
};

const followUser = async (
  followerId: string,
  followingId: string
): Promise<{ message: string }> => {
  return await database.transaction(async (client: PoolClient) => {
    // Check if both users exist
    const usersCheckQuery = `
      SELECT id FROM users 
      WHERE id IN ($1, $2) AND status = 'ACTIVE'
    `;

    const usersResult = await client.query(usersCheckQuery, [
      followerId,
      followingId,
    ]);
    if (usersResult.rows.length !== 2) {
      throw new AppError(httpStatus.NOT_FOUND, 'One or both users not found');
    }

    // Check if follow relationship already exists
    const existingFollowQuery = `
      SELECT id FROM follows 
      WHERE "followerId" = $1 AND "followingId" = $2
    `;

    const existingResult = await client.query(existingFollowQuery, [
      followerId,
      followingId,
    ]);
    if (existingResult.rows.length > 0) {
      throw new AppError(httpStatus.CONFLICT, 'Already following this user');
    }

    // Create follow relationship
    const followId = generateUuid();
    const createFollowQuery = `
      INSERT INTO follows (id, "followerId", "followingId", "createdAt")
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(createFollowQuery, [
      followId,
      followerId,
      followingId,
      new Date(),
    ]);

    return { message: 'User followed successfully' };
  });
};

const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<{ message: string }> => {
  // Check if follow relationship exists
  const existingFollowQuery = `
    SELECT id FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;

  const existingResult = await database.query<{ id: string }>(
    existingFollowQuery,
    [followerId, followingId]
  );
  if (existingResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Follow relationship not found');
  }

  // Remove follow relationship
  const unfollowQuery = `
    DELETE FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;

  await database.query(unfollowQuery, [followerId, followingId]);

  return { message: 'User unfollowed successfully' };
};

const getUserFollowers = async (userId: string): Promise<DbUser[]> => {
  // Check if user exists
  const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;

  const userResult = await database.query<{ id: string }>(userCheckQuery, [
    userId,
  ]);
  if (userResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get followers
  const followersQuery = `
    SELECT u.*
    FROM users u
    INNER JOIN follows f ON u.id = f."followerId"
    WHERE f."followingId" = $1 AND u.status = 'ACTIVE'
    ORDER BY f."createdAt" DESC
  `;

  const result = await database.query<DbUser>(followersQuery, [userId]);
  return result.rows;
};

const getUserFollowing = async (userId: string): Promise<DbUser[]> => {
  // Check if user exists
  const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;

  const userResult = await database.query<{ id: string }>(userCheckQuery, [
    userId,
  ]);
  if (userResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get following
  const followingQuery = `
    SELECT u.*
    FROM users u
    INNER JOIN follows f ON u.id = f."followingId"
    WHERE f."followerId" = $1 AND u.status = 'ACTIVE'
    ORDER BY f."createdAt" DESC
  `;

  const result = await database.query<DbUser>(followingQuery, [userId]);
  return result.rows;
};

const getUserStats = async (
  userId: string
): Promise<{
  postCount: number;
  followerCount: number;
  followingCount: number;
  totalUpVotes: number;
}> => {
  // Check if user exists
  const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;

  const userResult = await database.query<{ id: string }>(userCheckQuery, [
    userId,
  ]);
  if (userResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get all stats in parallel
  const [
    postCountResult,
    followerCountResult,
    followingCountResult,
    upVotesResult,
  ] = await Promise.all([
    // Post count
    database.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM posts WHERE "authorId" = $1 AND "isDeleted" = false`,
      [userId]
    ),
    // Follower count
    database.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM follows WHERE "followingId" = $1`,
      [userId]
    ),
    // Following count
    database.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM follows WHERE "followerId" = $1`,
      [userId]
    ),
    // Total upvotes on user's posts
    database.query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM post_votes pv
       INNER JOIN posts p ON pv."postId" = p.id
       WHERE p."authorId" = $1 AND pv.type = 'UP' AND p."isDeleted" = false`,
      [userId]
    ),
  ]);

  return {
    postCount: parseInt(postCountResult.rows[0].count, 10),
    followerCount: parseInt(followerCountResult.rows[0].count, 10),
    followingCount: parseInt(followingCountResult.rows[0].count, 10),
    totalUpVotes: parseInt(upVotesResult.rows[0].count, 10),
  };
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserStats,
};
