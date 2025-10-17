/* eslint-disable @typescript-eslint/no-explicit-any */
import database from '../../../shared/database';

/**
 * AnalyticsService: collection of analytical SQL queries for the Real-Time Crime Dashboard.
 * Queries use CTEs, window functions, aggregations and joins to showcase DBMS features.
 */
const crimesPerHour = async () => {
  const q = `
    WITH recent AS (
      SELECT "crimeDate"
      FROM posts
      WHERE "isDeleted" = false AND status = 'APPROVED' AND "crimeDate" >= NOW() - INTERVAL '24 hours'
    )
    SELECT date_trunc('hour', "crimeDate") as hour, COUNT(*) as count
    FROM recent
    GROUP BY hour
    ORDER BY hour;
  `;

  const r = await database.query(q);
  return r.rows;
};

const crimeTrendWithMovingAvg = async () => {
  const q = `
    WITH daily AS (
      SELECT date_trunc('day', "crimeDate")::date as day, COUNT(*)::int as cnt
      FROM posts
      WHERE "isDeleted" = false AND status = 'APPROVED' AND "crimeDate" >= NOW() - INTERVAL '90 days'
      GROUP BY day
      ORDER BY day
    ),
    mov AS (
      SELECT day, cnt,
        ROUND(AVG(cnt) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)::numeric, 2) as ma_7d
      FROM daily
    )
    SELECT * FROM mov;
  `;

  const r = await database.query(q);
  return r.rows;
};

const hotspotDistricts = async () => {
  const q = `
    SELECT 
      d.name as district, 
      COUNT(p.id) as cnt, 
      d.lat::double precision as lat, 
      d.lon::double precision as lon,
      json_agg(DISTINCT p.category) FILTER (WHERE p.category IS NOT NULL) as top_categories
    FROM posts p
    LEFT JOIN district d ON d.id = p.district::int
    WHERE p.status = 'APPROVED' AND p."isDeleted" = false
    GROUP BY d.name, d.lat, d.lon
    HAVING COUNT(p.id) > 0
    ORDER BY cnt DESC
    LIMIT 15;
  `;

  const r = await database.query(q);
  return r.rows;
};

const timePatternAnalysis = async () => {
  const q = `
    SELECT extract(hour from "crimeDate")::int as hour_of_day, COUNT(*) as cnt
    FROM posts
    WHERE "isDeleted" = false AND status = 'APPROVED' AND "crimeDate" >= NOW() - INTERVAL '60 days'
    GROUP BY hour_of_day
    ORDER BY hour_of_day;
  `;

  const r = await database.query(q);
  return r.rows;
};

const verificationAnalytics = async () => {
  const q = `
    WITH buckets AS (
      SELECT case
        when "verificationScore" >= 80 then '80-100'
        when "verificationScore" >= 60 then '60-79'
        when "verificationScore" >= 40 then '40-59'
        else '0-39' end as bucket,
        COUNT(*) as cnt,
        AVG("verificationScore") as avg_score
      FROM posts
      WHERE "isDeleted" = false
      GROUP BY bucket
    )
    SELECT * FROM buckets ORDER BY bucket DESC;
  `;

  const r = await database.query(q);
  return r.rows;
};

const responseEffectiveness = async () => {
  // Using updatedAt - createdAt as a proxy for response time
  const q = `
    SELECT
      ROUND(AVG(EXTRACT(EPOCH FROM (p."updatedAt" - p."createdAt"))/60)::numeric,2) as avg_response_minutes,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (p."updatedAt" - p."createdAt"))/60) as median_minutes
    FROM posts p
    WHERE p.status = 'APPROVED' AND p."createdAt" >= NOW() - INTERVAL '180 days';
  `;

  const r = await database.query(q);
  return r.rows[0] || { avg_response_minutes: null, median_minutes: null };
};

const topContributors = async () => {
  const q = `
    SELECT u.id as user_id, u.name, u.email, COUNT(p.id) as posts
    FROM posts p
    LEFT JOIN users u ON u.id = p.authorId
    WHERE p."isDeleted" = false
    GROUP BY u.id, u.name, u.email
    ORDER BY posts DESC
    LIMIT 10;
  `;

  const r = await database.query(q);
  return r.rows;
};

const crimeTypeDistribution = async () => {
  // Use the explicit `category` column (enum) in posts for accurate distribution
  const q = `
    SELECT 
      category, 
      COUNT(*) as cnt,
      ROUND(AVG("verificationScore")::numeric, 2) as avg_verification,
      COUNT(*) FILTER (WHERE status = 'APPROVED') as approved_cnt,
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending_cnt
    FROM posts
    WHERE "isDeleted" = false AND status = 'APPROVED' AND category IS NOT NULL
    GROUP BY category
    ORDER BY cnt DESC;
  `;

  const r = await database.query(q);
  return r.rows;
};

const statusBreakdown = async () => {
  const q = `
    SELECT 
      status,
      COUNT(*) as cnt,
      ROUND(AVG("verificationScore")::numeric, 2) as avg_score
    FROM posts
    WHERE "isDeleted" = false
    GROUP BY status
    ORDER BY cnt DESC;
  `;

  const r = await database.query(q);
  return r.rows;
};

const divisionStats = async () => {
  const q = `
    SELECT 
      dv.name as division,
      COUNT(p.id) as cnt,
      json_agg(DISTINCT p.category) FILTER (WHERE p.category IS NOT NULL) as categories
    FROM posts p
    LEFT JOIN division dv ON dv.id = p.division::int
    WHERE p.status = 'APPROVED' AND p."isDeleted" = false
    GROUP BY dv.name
    ORDER BY cnt DESC
    LIMIT 10;
  `;

  const r = await database.query(q);
  return r.rows;
};

const crimesByDayOfWeek = async () => {
  const q = `
    SELECT 
      TO_CHAR("crimeDate", 'Day') as day_name,
      EXTRACT(DOW FROM "crimeDate")::int as day_num,
      COUNT(*) as cnt
    FROM posts
    WHERE "isDeleted" = false AND status = 'APPROVED'
    GROUP BY day_name, day_num
    ORDER BY day_num;
  `;

  const r = await database.query(q);
  return r.rows;
};

const recentCrimeActivity = async () => {
  const q = `
    SELECT 
      DATE("crimeDate") as date,
      COUNT(*) as cnt,
      json_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories
    FROM posts
    WHERE "isDeleted" = false AND status = 'APPROVED' AND "crimeDate" >= NOW() - INTERVAL '14 days'
    GROUP BY DATE("crimeDate")
    ORDER BY date DESC;
  `;

  const r = await database.query(q);
  return r.rows;
};

const polarHeatmapData = async (
  latitude: number,
  longitude: number,
  radiusKm: number,
  startDate?: string,
  endDate?: string,
  category?: string
) => {
  // Use Haversine formula to filter crimes within radius
  // Then aggregate by hour of day (0-23) and day of week (0-6, 0=Sunday)
  let dateFilter = '';
  let categoryFilter = '';
  const params: any[] = [latitude, longitude, radiusKm];
  let paramIndex = 4;

  if (startDate && endDate) {
    dateFilter = `AND p."crimeDate" >= $${paramIndex} AND p."crimeDate" <= $${
      paramIndex + 1
    }`;
    params.push(startDate, endDate);
    paramIndex += 2;
  }

  if (category && category !== 'ALL') {
    categoryFilter = `AND p.category = $${paramIndex}`;
    params.push(category);
  }

  const q = `
    WITH nearby_crimes AS (
      SELECT 
        p.id,
        p."crimeDate",
        p.category,
        EXTRACT(HOUR FROM p."crimeDate")::int as hour_of_day,
        EXTRACT(DOW FROM p."crimeDate")::int as day_of_week,
        (6371 * acos(
          cos(radians($1)) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(p.latitude))
        )) as distance_km
      FROM posts p
      WHERE 
        p."isDeleted" = false 
        AND p.status = 'APPROVED'
        AND p.latitude IS NOT NULL 
        AND p.longitude IS NOT NULL
        ${dateFilter}
        ${categoryFilter}
    )
    SELECT 
      hour_of_day,
      day_of_week,
      COUNT(*) as crime_count,
      json_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) as categories,
      ROUND(AVG(distance_km)::numeric, 2) as avg_distance
    FROM nearby_crimes
    WHERE distance_km <= $3
    GROUP BY hour_of_day, day_of_week
    ORDER BY day_of_week, hour_of_day;
  `;

  const r = await database.query(q, params);
  return r.rows;
};

export const AnalyticsService = {
  crimesPerHour,
  crimeTrendWithMovingAvg,
  hotspotDistricts,
  timePatternAnalysis,
  verificationAnalytics,
  responseEffectiveness,
  topContributors,
  crimeTypeDistribution,
  statusBreakdown,
  divisionStats,
  crimesByDayOfWeek,
  recentCrimeActivity,
  polarHeatmapData,
};
