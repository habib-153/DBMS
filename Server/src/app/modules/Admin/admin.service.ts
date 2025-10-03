import database from '../../../shared/database';

const getAdminStats = async () => {
  // Get total users count (excluding deleted)
  const usersCountQuery = `
    SELECT COUNT(*) as total,
           COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
           COUNT(CASE WHEN status = 'BLOCKED' THEN 1 END) as blocked,
           COUNT(CASE WHEN "isVerified" = true THEN 1 END) as verified,
           COUNT(CASE WHEN role = 'ADMIN' OR role = 'SUPER_ADMIN' THEN 1 END) as admins
    FROM users
  `;

  const usersResult = await database.query(usersCountQuery);
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

  const postsResult = await database.query(postsCountQuery);
  const postsStats = postsResult.rows[0];

  // Get recent activity (last 7 days)
  const recentActivityQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_users,
      (SELECT COUNT(*) FROM posts WHERE "createdAt" >= NOW() - INTERVAL '7 days' AND "isDeleted" = false) as new_posts,
      (SELECT COUNT(*) FROM post_votes WHERE "createdAt" >= NOW() - INTERVAL '7 days') as new_votes
  `;

  const activityResult = await database.query(recentActivityQuery);
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

  const locationsResult = await database.query(topLocationsQuery);
  const topLocations = locationsResult.rows;

  return {
    users: {
      total: parseInt(usersStats.total as string),
      active: parseInt(usersStats.active as string),
      blocked: parseInt(usersStats.blocked as string),
      verified: parseInt(usersStats.verified as string),
      admins: parseInt(usersStats.admins as string),
    },
    posts: {
      total: parseInt(postsStats.total as string),
      pending: parseInt(postsStats.pending as string),
      approved: parseInt(postsStats.approved as string),
      rejected: parseInt(postsStats.rejected as string),
    },
    recentActivity: {
      newUsers: parseInt(recentActivity.new_users as string),
      newPosts: parseInt(recentActivity.new_posts as string),
      newVotes: parseInt(recentActivity.new_votes as string),
    },
    topLocations,
  };
};

const getDashboardOverview = async () => {
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

  const growthResult = await database.query(monthlyGrowthQuery);
  const monthlyGrowth = growthResult.rows;

  // Get post status distribution
  const postDistributionQuery = `
    SELECT status, COUNT(*) as count
    FROM posts
    WHERE "isDeleted" = false
    GROUP BY status
  `;

  const distributionResult = await database.query(postDistributionQuery);
  const postDistribution = distributionResult.rows;

  return {
    monthlyGrowth,
    postDistribution,
  };
};

export const AdminService = {
  getAdminStats,
  getDashboardOverview,
};