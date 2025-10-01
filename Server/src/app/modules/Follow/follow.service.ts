import { randomBytes } from 'crypto';
import httpStatus from 'http-status';
import database from '../../../shared/database';
import AppError from '../../errors/AppError';
import { DbFollow } from '../../interfaces/database.types';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const followUser = async (
  followerId: string,
  followingId: string
): Promise<DbFollow> => {
  // Check if user is trying to follow themselves
  if (followerId === followingId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You cannot follow yourself');
  }
console.log(followingId)
console.log(followerId)
  // Check if the user to be followed exists
  const userQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status IN ('ACTIVE', 'BLOCKED')
  `;
  console.log(userQuery);
  const userResult = await database.query(userQuery, [followingId]);
console.log(userResult)
  if (userResult.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if already following
  const existingFollowQuery = `
    SELECT * FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
  const existingFollow = await database.query<DbFollow>(existingFollowQuery, [
    followerId,
    followingId,
  ]);

  if (existingFollow.rows.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are already following this user'
    );
  }

  // Create follow relationship
  const followId = generateUuid();
  const now = new Date();

  const insertQuery = `
    INSERT INTO follows (id, "followerId", "followingId", "createdAt")
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await database.query<DbFollow>(insertQuery, [
    followId,
    followerId,
    followingId,
    now,
  ]);

  const follow = result.rows[0];

  if (!follow) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to follow user'
    );
  }

  return follow;
};

const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<{ message: string }> => {
  // Check if follow relationship exists
  const existingFollowQuery = `
    SELECT * FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
  const existingFollow = await database.query<DbFollow>(existingFollowQuery, [
    followerId,
    followingId,
  ]);

  if (existingFollow.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'You are not following this user');
  }

  // Delete follow relationship
  const deleteQuery = `
    DELETE FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;

  await database.query(deleteQuery, [followerId, followingId]);

  return { message: 'Successfully unfollowed user' };
};

const getFollowers = async (userId: string): Promise<DbFollow[]> => {
  const query = `
    SELECT 
      f.*,
      u.id as "followerUserId",
      u.name as "followerName",
      u.email as "followerEmail",
      u."profilePhoto" as "followerProfilePhoto"
    FROM follows f
    INNER JOIN users u ON f."followerId" = u.id
    WHERE f."followingId" = $1 AND u.status != 'DELETED'
    ORDER BY f."createdAt" DESC
  `;

  const result = await database.query<DbFollow>(query, [userId]);
  return result.rows;
};

const getFollowing = async (userId: string): Promise<DbFollow[]> => {
  const query = `
    SELECT 
      f.*,
      u.id as "followingUserId",
      u.name as "followingName",
      u.email as "followingEmail",
      u."profilePhoto" as "followingProfilePhoto"
    FROM follows f
    INNER JOIN users u ON f."followingId" = u.id
    WHERE f."followerId" = $1 AND u.status != 'DELETED'
    ORDER BY f."createdAt" DESC
  `;

  const result = await database.query<DbFollow>(query, [userId]);
  return result.rows;
};

const isFollowing = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  const query = `
    SELECT id FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;

  const result = await database.query(query, [followerId, followingId]);
  return result.rows.length > 0;
};

const getFollowStats = async (
  userId: string
): Promise<{ followers: number; following: number }> => {
  const followersQuery = `
    SELECT COUNT(*) as count FROM follows WHERE "followingId" = $1
  `;
  const followingQuery = `
    SELECT COUNT(*) as count FROM follows WHERE "followerId" = $1
  `;

  const [followersResult, followingResult] = await Promise.all([
    database.query<{ count: string }>(followersQuery, [userId]),
    database.query<{ count: string }>(followingQuery, [userId]),
  ]);

  return {
    followers: parseInt(followersResult.rows[0].count, 10),
    following: parseInt(followingResult.rows[0].count, 10),
  };
};

export const FollowService = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getFollowStats,
};
