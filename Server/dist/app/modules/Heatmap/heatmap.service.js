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
exports.HeatmapService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = __importDefault(require("../../../shared/database"));
// Calculate crime intensity weight based on multiple factors
const calculateCrimeWeight = (verificationScore, reportCount, daysAgo) => {
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
const getHeatmapPoints = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    var _a, _b, _c, _d, _e, _f, _g;
    const conditions = [`p."isDeleted" = false`];
    const values = [];
    let paramIndex = 1;
    // Only show approved posts by default
    if (filters.status) {
        conditions.push(`p.status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
    }
    else {
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
    const result = yield database_1.default.query(query, values);
    // eslint-disable-next-line no-console
    console.log('📊 Heatmap Query Results:', {
        totalRows: result.rows.length,
        sampleLocation: (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.location,
        sampleDistrictId: (_b = result.rows[0]) === null || _b === void 0 ? void 0 : _b.district_id,
        sampleDistrictName: (_c = result.rows[0]) === null || _c === void 0 ? void 0 : _c.district_name,
        sampleDivisionId: (_d = result.rows[0]) === null || _d === void 0 ? void 0 : _d.division_id,
        sampleDivisionName: (_e = result.rows[0]) === null || _e === void 0 ? void 0 : _e.division_name,
        sampleLat: (_f = result.rows[0]) === null || _f === void 0 ? void 0 : _f.lat,
        sampleLng: (_g = result.rows[0]) === null || _g === void 0 ? void 0 : _g.lng,
    });
    // Parse location and calculate weights
    const points = result.rows
        .map((row) => {
        // Get coordinates from district table join
        const lat = row.lat ? parseFloat(row.lat) : null;
        const lng = row.lng ? parseFloat(row.lng) : null;
        if (lat === null || lng === null) {
            // eslint-disable-next-line no-console
            console.log(`⚠️ No coordinates for district ID: ${row.district_id} (${row.district_name || 'unknown'})`);
            return null; // Skip if no valid coordinates
        }
        // Calculate days since crime
        const daysAgo = Math.floor((Date.now() - new Date(row.crimeDate).getTime()) / (1000 * 60 * 60 * 24));
        // Calculate weight
        const weight = calculateCrimeWeight(parseFloat(row.verificationScore) || 50, parseInt(row.reportCount) || 0, daysAgo);
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
        .filter((point) => point !== null);
    return points;
});
// Get crime statistics aggregated by district
const getDistrictStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const conditions = [
        `p."isDeleted" = false`,
        `p.status = 'APPROVED'`,
    ];
    const values = [];
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
    const result = yield database_1.default.query(query, values);
    return result.rows.map((row) => ({
        district: row.district,
        division: row.division,
        crimeCount: parseInt(row.crime_count) || 0,
        recentCount: parseInt(row.recent_count) || 0,
        severity: parseFloat(row.avg_severity) || 0,
        lat: row.lat ? parseFloat(row.lat) : undefined,
        lng: row.lng ? parseFloat(row.lng) : undefined,
    }));
});
// Get crime statistics aggregated by division
const getDivisionStats = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const conditions = [
        `p."isDeleted" = false`,
        `p.status = 'APPROVED'`,
    ];
    const values = [];
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
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
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
    const result = yield database_1.default.query(query, values);
    return result.rows.map((row) => ({
        division: row.division,
        crimeCount: parseInt(row.crime_count) || 0,
        districts: parseInt(row.district_count) || 0,
        severity: parseFloat(row.avg_severity) || 0,
    }));
});
// Get all districts with their coordinates
const getAllDistricts = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield database_1.default.query(query);
    return result.rows;
});
// Get all divisions
const getAllDivisions = () => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT 
      id,
      name,
      bn_name,
      url
    FROM division
    ORDER BY name
  `;
    const result = yield database_1.default.query(query);
    return result.rows;
});
exports.HeatmapService = {
    getHeatmapPoints,
    getDistrictStats,
    getDivisionStats,
    getAllDistricts,
    getAllDivisions,
};
