/* eslint-disable @typescript-eslint/no-explicit-any */
import database from '../../../shared/database';

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  crimeDate: Date;
  title: string;
  district: string;
  division: string;
}

interface DistrictStats {
  district: string;
  division: string;
  crimeCount: number;
  recentCount: number; // Last 30 days
  severity: number; // 0-100
  lat?: number;
  lng?: number;
}

interface DivisionStats {
  division: string;
  crimeCount: number;
  districts: number;
  severity: number;
}

interface HeatmapFilters {
  startDate?: string;
  endDate?: string;
  districts?: string[];
  divisions?: string[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  minVerificationScore?: number;
}

// Calculate crime intensity weight based on multiple factors
const calculateCrimeWeight = (
  verificationScore: number,
  reportCount: number,
  daysAgo: number
): number => {
  // Base weight from verification score (inverse - lower score = more serious)
  const scoreWeight = Math.max(0, (100 - verificationScore) / 100) * 0.4;

  // Report count weight
  const reportWeight = Math.min(reportCount / 10, 1) * 0.3;

  // Recency weight (crimes in last 30 days weighted more)
  const recencyWeight = Math.max(0, 1 - daysAgo / 365) * 0.2;

  // Verification factor (approved posts weighted slightly higher)
  const verifiedWeight = verificationScore > 0 ? 0.1 : 0;

  return scoreWeight + reportWeight + recencyWeight + verifiedWeight;
};

// Get point data for heatmap overlay
const getHeatmapPoints = async (
  filters: HeatmapFilters = {}
): Promise<HeatmapPoint[]> => {
  const conditions: string[] = [`p."isDeleted" = false`];
  const values: any[] = [];
  let paramIndex = 1;

  // Only show approved posts by default
  if (filters.status) {
    conditions.push(`p.status = $${paramIndex}`);
    values.push(filters.status);
    paramIndex++;
  } else {
    conditions.push(`p.status = 'APPROVED'`);
  }

  // Date range filter
  if (filters.startDate) {
    conditions.push(`p."crimeDate" >= $${paramIndex}`);
    values.push(new Date(filters.startDate));
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`p."crimeDate" <= $${paramIndex}`);
    values.push(new Date(filters.endDate));
    paramIndex++;
  }

  // District filter
  if (filters.districts && filters.districts.length > 0) {
    conditions.push(`p.district = ANY($${paramIndex})`);
    values.push(filters.districts);
    paramIndex++;
  }

  // Division filter
  if (filters.divisions && filters.divisions.length > 0) {
    conditions.push(`p.division = ANY($${paramIndex})`);
    values.push(filters.divisions);
    paramIndex++;
  }

  // Verification score filter
  if (filters.minVerificationScore !== undefined) {
    conditions.push(`p."verificationScore" >= $${paramIndex}`);
    values.push(filters.minVerificationScore);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Posts table stores district/division as IDs (text format like "47", "6")
  // Join with district table to get coordinates and names
  const query = `
    SELECT 
      p.id,
      p.title,
      p.location,
      p.district as district_id,
      p.division as division_id,
      p."crimeDate",
      p."verificationScore",
      p."reportCount",
      p."createdAt",
      d.name as district_name,
      d.lat,
      d.lon as lng,
      div.name as division_name
    FROM posts p
    LEFT JOIN district d ON p.district::integer = d.id
    LEFT JOIN division div ON p.division::integer = div.id
    ${whereClause}
    ORDER BY p."crimeDate" DESC
  `;

  const result = await database.query(query, values);

  // eslint-disable-next-line no-console
  console.log('📊 Heatmap Query Results:', {
    totalRows: result.rows.length,
    sampleLocation: result.rows[0]?.location,
    sampleDistrictId: result.rows[0]?.district_id,
    sampleDistrictName: result.rows[0]?.district_name,
    sampleDivisionId: result.rows[0]?.division_id,
    sampleDivisionName: result.rows[0]?.division_name,
    sampleLat: result.rows[0]?.lat,
    sampleLng: result.rows[0]?.lng,
  });

  // Parse location and calculate weights
  const points: HeatmapPoint[] = result.rows
    .map((row: any) => {
      // Get coordinates from district table join
      const lat = row.lat ? parseFloat(row.lat) : null;
      const lng = row.lng ? parseFloat(row.lng) : null;

      if (lat === null || lng === null) {
        // eslint-disable-next-line no-console
        console.log(
          `⚠️ No coordinates for district ID: ${row.district_id} (${
            row.district_name || 'unknown'
          })`
        );
        return null; // Skip if no valid coordinates
      }

      // Calculate days since crime
      const daysAgo = Math.floor(
        (Date.now() - new Date(row.crimeDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate weight
      const weight = calculateCrimeWeight(
        parseFloat(row.verificationScore) || 50,
        parseInt(row.reportCount) || 0,
        daysAgo
      );

      return {
        lat,
        lng,
        weight,
        crimeDate: row.crimeDate,
        title: row.title,
        district: row.district_name || `District ${row.district_id}`,
        division: row.division_name || `Division ${row.division_id}`,
      };
    })
    .filter((point: HeatmapPoint | null) => point !== null) as HeatmapPoint[];

  return points;
};

// Get crime statistics aggregated by district
const getDistrictStats = async (
  filters: HeatmapFilters = {}
): Promise<DistrictStats[]> => {
  const conditions: string[] = [
    `p."isDeleted" = false`,
    `p.status = 'APPROVED'`,
  ];
  const values: any[] = [];
  let paramIndex = 1;

  // Date range filter
  if (filters.startDate) {
    conditions.push(`p."crimeDate" >= $${paramIndex}`);
    values.push(new Date(filters.startDate));
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`p."crimeDate" <= $${paramIndex}`);
    values.push(new Date(filters.endDate));
    paramIndex++;
  }

  // Division filter
  if (filters.divisions && filters.divisions.length > 0) {
    conditions.push(`p.division = ANY($${paramIndex})`);
    values.push(filters.divisions);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      d.name as district,
      div.name as division,
      COUNT(*) as crime_count,
      COUNT(CASE 
        WHEN p."crimeDate" >= NOW() - INTERVAL '30 days' 
        THEN 1 
      END) as recent_count,
      AVG(100 - p."verificationScore") as avg_severity,
      d.lat,
      d.lon as lng
    FROM posts p
    LEFT JOIN district d ON p.district::integer = d.id
    LEFT JOIN division div ON p.division::integer = div.id
    ${whereClause}
    GROUP BY d.name, div.name, d.lat, d.lon
    ORDER BY crime_count DESC
  `;

  const result = await database.query(query, values);

  return result.rows.map((row: any) => ({
    district: row.district,
    division: row.division,
    crimeCount: parseInt(row.crime_count) || 0,
    recentCount: parseInt(row.recent_count) || 0,
    severity: parseFloat(row.avg_severity) || 0,
    lat: row.lat ? parseFloat(row.lat) : undefined,
    lng: row.lng ? parseFloat(row.lng) : undefined,
  }));
};

// Get crime statistics aggregated by division
const getDivisionStats = async (
  filters: HeatmapFilters = {}
): Promise<DivisionStats[]> => {
  const conditions: string[] = [
    `p."isDeleted" = false`,
    `p.status = 'APPROVED'`,
  ];
  const values: any[] = [];
  let paramIndex = 1;

  // Date range filter
  if (filters.startDate) {
    conditions.push(`p."crimeDate" >= $${paramIndex}`);
    values.push(new Date(filters.startDate));
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`p."crimeDate" <= $${paramIndex}`);
    values.push(new Date(filters.endDate));
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      div.name as division,
      COUNT(*) as crime_count,
      COUNT(DISTINCT p.district) as district_count,
      AVG(100 - p."verificationScore") as avg_severity
    FROM posts p
    LEFT JOIN division div ON p.division::integer = div.id
    ${whereClause}
    GROUP BY div.name
    ORDER BY crime_count DESC
  `;

  const result = await database.query(query, values);

  return result.rows.map((row: any) => ({
    division: row.division,
    crimeCount: parseInt(row.crime_count) || 0,
    districts: parseInt(row.district_count) || 0,
    severity: parseFloat(row.avg_severity) || 0,
  }));
};

// Get all districts with their coordinates
const getAllDistricts = async (): Promise<any[]> => {
  const query = `
    SELECT 
      id,
      division_id,
      name,
      bn_name,
      lat,
      lon as lng,
      url
    FROM district
    ORDER BY name
  `;

  const result = await database.query(query);
  return result.rows;
};

// Get all divisions
const getAllDivisions = async (): Promise<any[]> => {
  const query = `
    SELECT 
      id,
      name,
      bn_name,
      url
    FROM division
    ORDER BY name
  `;

  const result = await database.query(query);
  return result.rows;
};

export const HeatmapService = {
  getHeatmapPoints,
  getDistrictStats,
  getDivisionStats,
  getAllDistricts,
  getAllDivisions,
};
