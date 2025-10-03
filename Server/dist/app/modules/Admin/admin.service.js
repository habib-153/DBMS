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
exports.AdminService = void 0;
const database_1 = __importDefault(require("../../../shared/database"));
const getAdminStats = () => __awaiter(void 0, void 0, void 0, function* () {
    // Get total users count (excluding deleted)
    const usersCountQuery = `
    SELECT COUNT(*) as total,
           COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
           COUNT(CASE WHEN status = 'BLOCKED' THEN 1 END) as blocked,
           COUNT(CASE WHEN "isVerified" = true THEN 1 END) as verified,
           COUNT(CASE WHEN role = 'ADMIN' OR role = 'SUPER_ADMIN' THEN 1 END) as admins
    FROM users
  `;
    const usersResult = yield database_1.default.query(usersCountQuery);
    const usersStats = usersResult.rows[0];
    // Get total posts count
    const postsCountQuery = `
    SELECT COUNT(*) as total,
           COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
           COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected
    FROM posts
    WHERE "isDeleted" = false
  `;
    const postsResult = yield database_1.default.query(postsCountQuery);
    const postsStats = postsResult.rows[0];
    // Get recent activity (last 7 days)
    const recentActivityQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_users,
      (SELECT COUNT(*) FROM posts WHERE "createdAt" >= NOW() - INTERVAL '7 days' AND "isDeleted" = false) as new_posts,
      (SELECT COUNT(*) FROM post_votes WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_votes
  `;
    const activityResult = yield database_1.default.query(recentActivityQuery);
    const recentActivity = activityResult.rows[0];
    // Get top locations
    const topLocationsQuery = `
    SELECT location, COUNT(*) as count
    FROM posts
    WHERE "isDeleted" = false AND location IS NOT NULL AND location != ''
    GROUP BY location
    ORDER BY count DESC
    LIMIT 5
  `;
    const locationsResult = yield database_1.default.query(topLocationsQuery);
    const topLocations = locationsResult.rows;
    return {
        users: {
            total: parseInt(usersStats.total),
            active: parseInt(usersStats.active),
            blocked: parseInt(usersStats.blocked),
            verified: parseInt(usersStats.verified),
            admins: parseInt(usersStats.admins),
        },
        posts: {
            total: parseInt(postsStats.total),
            pending: parseInt(postsStats.pending),
            approved: parseInt(postsStats.approved),
            rejected: parseInt(postsStats.rejected),
        },
        recentActivity: {
            newUsers: parseInt(recentActivity.new_users),
            newPosts: parseInt(recentActivity.new_posts),
            newVotes: parseInt(recentActivity.new_votes),
        },
        topLocations,
    };
});
const getDashboardOverview = () => __awaiter(void 0, void 0, void 0, function* () {
    // Get monthly growth data (last 6 months)
    const monthlyGrowthQuery = `
    SELECT 
      TO_CHAR(date_trunc('month', "createdAt"), 'Mon YYYY') as month,
      COUNT(*) as count
    FROM users
    WHERE "createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY date_trunc('month', "createdAt")
    ORDER BY date_trunc('month', "createdAt")
  `;
    const growthResult = yield database_1.default.query(monthlyGrowthQuery);
    const monthlyGrowth = growthResult.rows;
    // Get post status distribution
    const postDistributionQuery = `
    SELECT status, COUNT(*) as count
    FROM posts
    WHERE "isDeleted" = false
    GROUP BY status
  `;
    const distributionResult = yield database_1.default.query(postDistributionQuery);
    const postDistribution = distributionResult.rows;
    return {
        monthlyGrowth,
        postDistribution,
    };
});
exports.AdminService = {
    getAdminStats,
    getDashboardOverview,
};
