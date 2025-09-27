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
exports.UserService = void 0;
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
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield database_1.default.query(query, values);
    const createdUser = result.rows[0];
    if (!createdUser) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create user');
    }
    return createdUser;
});
const getAllUsers = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchTerm } = filters, filterData = __rest(filters, ["page", "limit", "sortBy", "sortOrder", "searchTerm"]);
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [`status != 'DELETED'`];
    const values = [];
    let paramIndex = 1;
    // Add search conditions
    if (searchTerm) {
        conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    FROM users
    ${whereClause}
  `;
    const countResult = yield database_1.default.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    // Main query with pagination
    const mainQuery = `
    SELECT *
    FROM users
    ${whereClause}
    ORDER BY "${sortBy}" ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    values.push(Number(limit), offset);
    const result = yield database_1.default.query(mainQuery, values);
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
        },
        data: result.rows,
    };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT *
    FROM users
    WHERE id = $1 AND status != 'DELETED'
  `;
    const result = yield database_1.default.query(query, [id]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT *
    FROM users
    WHERE email = $1 AND status != 'DELETED'
  `;
    const result = yield database_1.default.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
const updateUser = (id, updateData, imageFile) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const checkQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Build update query dynamically
    const updateFields = [];
    const values = [];
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
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No fields to update');
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
    const result = yield database_1.default.query(updateQuery, values);
    const updatedUser = result.rows[0];
    if (!updatedUser) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update user');
    }
    return updatedUser;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const checkQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;
    const checkResult = yield database_1.default.query(checkQuery, [id]);
    if (checkResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Soft delete the user
    const deleteQuery = `
    UPDATE users 
    SET status = 'DELETED', "updatedAt" = $1
    WHERE id = $2
  `;
    yield database_1.default.query(deleteQuery, [new Date(), id]);
    return { message: 'User deleted successfully' };
});
const followUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield database_1.default.transaction((client) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if both users exist
        const usersCheckQuery = `
      SELECT id FROM users 
      WHERE id IN ($1, $2) AND status = 'ACTIVE'
    `;
        const usersResult = yield client.query(usersCheckQuery, [
            followerId,
            followingId,
        ]);
        if (usersResult.rows.length !== 2) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'One or both users not found');
        }
        // Check if follow relationship already exists
        const existingFollowQuery = `
      SELECT id FROM follows 
      WHERE "followerId" = $1 AND "followingId" = $2
    `;
        const existingResult = yield client.query(existingFollowQuery, [
            followerId,
            followingId,
        ]);
        if (existingResult.rows.length > 0) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Already following this user');
        }
        // Create follow relationship
        const followId = generateUuid();
        const createFollowQuery = `
      INSERT INTO follows (id, "followerId", "followingId", "createdAt")
      VALUES ($1, $2, $3, $4)
    `;
        yield client.query(createFollowQuery, [
            followId,
            followerId,
            followingId,
            new Date(),
        ]);
        return { message: 'User followed successfully' };
    }));
});
const unfollowUser = (followerId, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if follow relationship exists
    const existingFollowQuery = `
    SELECT id FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    const existingResult = yield database_1.default.query(existingFollowQuery, [followerId, followingId]);
    if (existingResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Follow relationship not found');
    }
    // Remove follow relationship
    const unfollowQuery = `
    DELETE FROM follows 
    WHERE "followerId" = $1 AND "followingId" = $2
  `;
    yield database_1.default.query(unfollowQuery, [followerId, followingId]);
    return { message: 'User unfollowed successfully' };
});
const getUserFollowers = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;
    const userResult = yield database_1.default.query(userCheckQuery, [
        userId,
    ]);
    if (userResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Get followers
    const followersQuery = `
    SELECT u.*
    FROM users u
    INNER JOIN follows f ON u.id = f."followerId"
    WHERE f."followingId" = $1 AND u.status = 'ACTIVE'
    ORDER BY f."createdAt" DESC
  `;
    const result = yield database_1.default.query(followersQuery, [userId]);
    return result.rows;
});
const getUserFollowing = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;
    const userResult = yield database_1.default.query(userCheckQuery, [
        userId,
    ]);
    if (userResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Get following
    const followingQuery = `
    SELECT u.*
    FROM users u
    INNER JOIN follows f ON u.id = f."followingId"
    WHERE f."followerId" = $1 AND u.status = 'ACTIVE'
    ORDER BY f."createdAt" DESC
  `;
    const result = yield database_1.default.query(followingQuery, [userId]);
    return result.rows;
});
const getUserStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const userCheckQuery = `
    SELECT id FROM users 
    WHERE id = $1 AND status != 'DELETED'
  `;
    const userResult = yield database_1.default.query(userCheckQuery, [
        userId,
    ]);
    if (userResult.rows.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Get all stats in parallel
    const [postCountResult, followerCountResult, followingCountResult, upVotesResult,] = yield Promise.all([
        // Post count
        database_1.default.query(`SELECT COUNT(*) as count FROM posts WHERE "authorId" = $1 AND "isDeleted" = false`, [userId]),
        // Follower count
        database_1.default.query(`SELECT COUNT(*) as count FROM follows WHERE "followingId" = $1`, [userId]),
        // Following count
        database_1.default.query(`SELECT COUNT(*) as count FROM follows WHERE "followerId" = $1`, [userId]),
        // Total upvotes on user's posts
        database_1.default.query(`SELECT COUNT(*) as count 
       FROM post_votes pv
       INNER JOIN posts p ON pv."postId" = p.id
       WHERE p."authorId" = $1 AND pv.type = 'UP' AND p."isDeleted" = false`, [userId]),
    ]);
    return {
        postCount: parseInt(postCountResult.rows[0].count, 10),
        followerCount: parseInt(followerCountResult.rows[0].count, 10),
        followingCount: parseInt(followingCountResult.rows[0].count, 10),
        totalUpVotes: parseInt(upVotesResult.rows[0].count, 10),
    };
});
exports.UserService = {
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
