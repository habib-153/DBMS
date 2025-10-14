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
    WITH recent AS (
      SELECT p.id, p.district::int as district_id, p."crimeDate"
      FROM posts p
      WHERE p.status = 'APPROVED' AND p."isDeleted" = false AND p."crimeDate" >= NOW() - INTERVAL '30 days'
    )
    SELECT d.name as district, COUNT(r.id) as cnt, d.lat::double precision as lat, d.lon::double precision as lon
    FROM recent r
    LEFT JOIN district d ON d.id = r.district_id
    GROUP BY d.name, d.lat, d.lon
    ORDER BY cnt DESC
    LIMIT 10;
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
  // crude crime type grouping by keyword in title (example)
  const q = `
    SELECT category, COUNT(*) as cnt FROM (
      SELECT CASE
        WHEN LOWER(title) ~ 'theft|robbery|steal' THEN 'Theft'
        WHEN LOWER(title) ~ 'assault|attack' THEN 'Assault'
        WHEN LOWER(title) ~ 'fraud|scam' THEN 'Fraud'
        ELSE 'Other' END as category
      FROM posts
      WHERE "isDeleted" = false
    ) s
    GROUP BY category;
  `;

  const r = await database.query(q);
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
};
