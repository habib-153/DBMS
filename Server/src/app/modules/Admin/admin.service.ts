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

const getActiveSessions = async () => {
  const query = `
    SELECT 
      s.id,
      s."userId",
      u.name as "userName",
      u.email as "userEmail",
      s.latitude,
      s.longitude,
      s.country,
      s.city,
      s.browser,
      s.os,
      s.device,
      s."lastActivity",
      s."loginAt"
    FROM user_sessions s
    JOIN users u ON s."userId" = u.id
    WHERE s."isActive" = true
    ORDER BY s."lastActivity" DESC
  `;

  const result = await database.query(query);
  return result.rows;
};

const getLocationStats = async () => {
  // Total users
  const totalUsersQuery = `SELECT COUNT(*) as count FROM users WHERE status != 'DELETED'`;
  const totalUsersResult = await database.query(totalUsersQuery);
  const totalUsers = parseInt(totalUsersResult.rows[0].count as string);

  // Active users (logged in)
  const activeUsersQuery = `SELECT COUNT(DISTINCT "userId") as count FROM user_sessions WHERE "isActive" = true`;
  const activeUsersResult = await database.query(activeUsersQuery);
  const activeUsers = parseInt(activeUsersResult.rows[0].count as string);

  // Users with location
  const usersWithLocationQuery = `
    SELECT COUNT(DISTINCT "userId") as count 
    FROM user_location_history
  `;
  const usersWithLocationResult = await database.query(usersWithLocationQuery);
  const usersWithLocation = parseInt(
    usersWithLocationResult.rows[0].count as string
  );

  // Total location records
  const totalLocationRecordsQuery = `SELECT COUNT(*) as count FROM user_location_history`;
  const totalLocationRecordsResult = await database.query(
    totalLocationRecordsQuery
  );
  const totalLocationRecords = parseInt(
    totalLocationRecordsResult.rows[0].count as string
  );

  // Geofence warnings sent
  const geofenceWarningsQuery = `
    SELECT COUNT(*) as count 
    FROM user_location_history 
    WHERE "notificationSent" = true
  `;
  const geofenceWarningsResult = await database.query(geofenceWarningsQuery);
  const geofenceWarningsSent = parseInt(
    geofenceWarningsResult.rows[0].count as string
  );

  // Top countries
  const topCountriesQuery = `
    SELECT country, COUNT(DISTINCT "userId") as count
    FROM user_sessions
    WHERE country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
    LIMIT 10
  `;
  const topCountriesResult = await database.query(topCountriesQuery);
  const topCountries = topCountriesResult.rows;

  // Top cities
  const topCitiesQuery = `
    SELECT city, COUNT(DISTINCT "userId") as count
    FROM user_sessions
    WHERE city IS NOT NULL
    GROUP BY city
    ORDER BY count DESC
    LIMIT 10
  `;
  const topCitiesResult = await database.query(topCitiesQuery);
  const topCities = topCitiesResult.rows;

  // Location records by day (last 7 days)
  const locationsByDayQuery = `
    SELECT 
      TO_CHAR(DATE(timestamp), 'MM/DD') as date,
      COUNT(*) as count
    FROM user_location_history
    WHERE timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(timestamp)
    ORDER BY DATE(timestamp)
  `;
  const locationsByDayResult = await database.query(locationsByDayQuery);
  const locationsByDay = locationsByDayResult.rows;

  // Risk level distribution
  const riskLevelQuery = `
    SELECT "riskLevel" as "riskLevel", COUNT(*) as count
    FROM geofence_zones
    WHERE "isActive" = true
    GROUP BY "riskLevel"
  `;
  const riskLevelResult = await database.query(riskLevelQuery);
  const riskLevelDistribution = riskLevelResult.rows;

  return {
    totalUsers,
    activeUsers,
    usersWithLocation,
    totalLocationRecords,
    geofenceWarningsSent,
    topCountries,
    topCities,
    locationsByDay,
    riskLevelDistribution,
  };
};

export const AdminService = {
  getAdminStats,
  getDashboardOverview,
  getActiveSessions,
  getLocationStats,
};
