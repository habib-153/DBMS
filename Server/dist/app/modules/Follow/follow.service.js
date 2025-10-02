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
exports.FollowService = void 0;
const crypto_1 = require("crypto");
const http_status_1 = __importDefault(require("http-status"));
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
const followUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user is trying to follow themselves
    if (followerId === followingId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You cannot follow yourself');
    }
    console.log(followingId);
    console.log(followerId);
    // Check if the user to be followed exists
    const userQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status IN ('ACTIVE', 'BLOCKED')
  `;
    console.log(userQuery);
    const userResult = yield database_1.default.query(userQuery, [followingId]);
    console.log(userResult);
    if (userResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Check if already following
    const existingFollowQuery = `
    SELECT * FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    const existingFollow = yield database_1.default.query(existingFollowQuery, [
        followerId,
        followingId,
    ]);
    if (existingFollow.rows.length > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are already following this user');
    }
    // Create follow relationship
    const followId = generateUuid();
    const now = new Date();
    const insertQuery = `
    INSERT INTO follows (id, "followerId", "followingId", "createdAt")
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const result = yield database_1.default.query(insertQuery, [
        followId,
        followerId,
        followingId,
        now,
    ]);
    const follow = result.rows[0];
    if (!follow) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to follow user');
    }
    return follow;
});
const unfollowUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if follow relationship exists
    const existingFollowQuery = `
    SELECT * FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    const existingFollow = yield database_1.default.query(existingFollowQuery, [
        followerId,
        followingId,
    ]);
    if (existingFollow.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'You are not following this user');
    }
    // Delete follow relationship
    const deleteQuery = `
    DELETE FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    yield database_1.default.query(deleteQuery, [followerId, followingId]);
    return { message: 'Successfully unfollowed user' };
});
const getFollowers = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const getFollowing = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield database_1.default.query(query, [userId]);
    return result.rows;
});
const isFollowing = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT id FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    const result = yield database_1.default.query(query, [followerId, followingId]);
    return result.rows.length > 0;
});
const getFollowStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const followersQuery = `
    SELECT COUNT(*) as count FROM follows WHERE "followingId" = $1
  `;
    const followingQuery = `
    SELECT COUNT(*) as count FROM follows WHERE "followerId" = $1
  `;
    const [followersResult, followingResult] = yield Promise.all([
        database_1.default.query(followersQuery, [userId]),
        database_1.default.query(followingQuery, [userId]),
    ]);
    return {
        followers: parseInt(followersResult.rows[0].count, 10),
        following: parseInt(followingResult.rows[0].count, 10),
    };
});
exports.FollowService = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    getFollowStats,
};
