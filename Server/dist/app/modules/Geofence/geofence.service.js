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
exports.GeofenceService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../../../shared/database"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const notification_service_1 = require("../Notification/notification.service");
// Simple UUID generator
const generateUuid = () => {
    return (0, crypto_1.randomBytes)(16)
        .toString('hex')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};
// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};
const createGeofenceZone = (zoneData) => __awaiter(void 0, void 0, void 0, function* () {
    const zoneId = generateUuid();
    const now = new Date();
    const query = `
    INSERT INTO geofence_zones (
      id, name, "centerLatitude", "centerLongitude", "radiusMeters",
      "riskLevel", district, division, "isActive", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)
    RETURNING *
  `;
    const values = [
        zoneId,
        zoneData.name,
        zoneData.centerLatitude,
        zoneData.centerLongitude,
        zoneData.radiusMeters,
        zoneData.riskLevel || 'MEDIUM',
        zoneData.district || null,
        zoneData.division || null,
        now,
        now,
    ];
    const result = yield database_1.default.query(query, values);
    const createdZone = result.rows[0];
    if (!createdZone) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create geofence zone');
    }
    return createdZone;
});
const getActiveGeofenceZones = () => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    SELECT * FROM geofence_zones
    WHERE "isActive" = true
    ORDER BY "riskLevel" DESC, "crimeCount" DESC
  `;
    const result = yield database_1.default.query(query);
    return result.rows;
});
const updateGeofenceStats = (zoneId) => __awaiter(void 0, void 0, void 0, function* () {
    // Calculate crime statistics for the zone
    const statsQuery = `
    SELECT 
      COUNT(*) as crime_count,
      AVG("verificationScore") as avg_score
    FROM geofence_zones gz
    JOIN posts p ON 
      (6371000 * acos(
        cos(radians(gz."centerLatitude")) * 
        cos(radians(p.latitude)) * 
        cos(radians(p.longitude) - radians(gz."centerLongitude")) + 
        sin(radians(gz."centerLatitude")) * 
        sin(radians(p.latitude))
      )) <= gz."radiusMeters"
    WHERE gz.id = $1 
      AND p."isDeleted" = false 
      AND p.status = 'APPROVED'
      AND p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
  `;
    const statsResult = yield database_1.default.query(statsQuery, [zoneId]);
    const stats = statsResult.rows[0];
    // Determine risk level based on crime count and verification scores
    let riskLevel = 'LOW';
    const crimeCount = parseInt(stats === null || stats === void 0 ? void 0 : stats.crime_count) || 0;
    const avgScore = parseFloat(stats.avg_score) || 50;
    if (crimeCount >= 20 || avgScore < 40)
        riskLevel = 'CRITICAL';
    else if (crimeCount >= 10 || avgScore < 50)
        riskLevel = 'HIGH';
    else if (crimeCount >= 5 || avgScore < 60)
        riskLevel = 'MEDIUM';
    const updateQuery = `
    UPDATE geofence_zones
    SET "crimeCount" = $1,
        "averageVerificationScore" = $2,
        "riskLevel" = $3,
        "updatedAt" = $4
    WHERE id = $5
  `;
    yield database_1.default.query(updateQuery, [
        crimeCount,
        avgScore,
        riskLevel,
        new Date(),
        zoneId,
    ]);
});
const recordUserLocation = (locationData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const locationId = generateUuid();
    // Check if user is in any geofence zone
    const zones = yield getActiveGeofenceZones();
    let enteredZone = null;
    for (const zone of zones) {
        const distance = calculateDistance(locationData.latitude, locationData.longitude, zone.centerLatitude, zone.centerLongitude);
        if (distance <= zone.radiusMeters) {
            enteredZone = zone;
            break;
        }
    }
    // Check if notification was already sent for this zone recently (within 1 hour)
    let notificationSent = false;
    if (enteredZone) {
        const recentCheck = yield database_1.default.query(`
      SELECT * FROM user_location_history
      WHERE "userId" = $1 
        AND "geofenceZoneId" = $2 
        AND "notificationSent" = true
        AND timestamp > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `, [userId, enteredZone.id]);
        if (recentCheck.rows.length === 0) {
            // Send notification
            yield notification_service_1.NotificationService.createGeofenceWarning(userId, enteredZone.name, enteredZone.riskLevel);
            notificationSent = true;
        }
    }
    const query = `
    INSERT INTO user_location_history (
      id, "userId", latitude, longitude, accuracy, address, activity,
      "geofenceZoneId", "notificationSent", timestamp
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
    const values = [
        locationId,
        userId,
        locationData.latitude,
        locationData.longitude,
        locationData.accuracy || null,
        locationData.address || null,
        locationData.activity || null,
        (enteredZone === null || enteredZone === void 0 ? void 0 : enteredZone.id) || null,
        notificationSent,
        new Date(),
    ];
    const result = yield database_1.default.query(query, values);
    return result.rows[0];
});
const getUserLocationHistory = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 100) {
    const query = `
    SELECT ulh.*, gz.name as zone_name, gz."riskLevel" as zone_risk
    FROM user_location_history ulh
    LEFT JOIN geofence_zones gz ON ulh."geofenceZoneId" = gz.id
    WHERE ulh."userId" = $1
    ORDER BY ulh.timestamp DESC
    LIMIT $2
  `;
    const result = yield database_1.default.query(query, [
        userId,
        limit,
    ]);
    return result.rows;
});
// Auto-generate geofence zones from crime data
const autoGenerateGeofenceZones = () => __awaiter(void 0, void 0, void 0, function* () {
    // Find crime hotspots using spatial clustering
    const hotspotsQuery = `
    WITH crime_clusters AS (
      SELECT 
        AVG(latitude) as center_lat,
        AVG(longitude) as center_lng,
        COUNT(*) as crime_count,
        district,
        division,
        AVG("verificationScore") as avg_score
      FROM posts
      WHERE "isDeleted" = false 
        AND status = 'APPROVED'
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND "crimeDate" >= NOW() - INTERVAL '90 days'
      GROUP BY 
        ROUND(latitude::numeric, 2),
        ROUND(longitude::numeric, 2),
        district,
        division
      HAVING COUNT(*) >= 3
    )
    SELECT * FROM crime_clusters
    ORDER BY crime_count DESC
    LIMIT 20
  `;
    const hotspots = yield database_1.default.query(hotspotsQuery);
    for (const hotspot of hotspots.rows) {
        // Check if zone already exists
        const existingZone = yield database_1.default.query(`
      SELECT * FROM geofence_zones
      WHERE (6371000 * acos(
        cos(radians($1)) * cos(radians("centerLatitude")) * 
        cos(radians("centerLongitude") - radians($2)) + 
        sin(radians($1)) * sin(radians("centerLatitude"))
      )) <= 500
    `, [hotspot.center_lat, hotspot.center_lng]);
        if (existingZone.rows.length === 0) {
            // Create new geofence zone
            const crimeCount = parseInt(hotspot.crime_count) || 0;
            let riskLevel = 'MEDIUM';
            if (crimeCount >= 10)
                riskLevel = 'CRITICAL';
            else if (crimeCount >= 7)
                riskLevel = 'HIGH';
            else if (crimeCount >= 5)
                riskLevel = 'MEDIUM';
            yield createGeofenceZone({
                name: `${hotspot.district || 'Unknown'} Crime Hotspot`,
                centerLatitude: parseFloat(hotspot.center_lat),
                centerLongitude: parseFloat(hotspot.center_lng),
                radiusMeters: 500,
                riskLevel,
                district: hotspot.district,
                division: hotspot.division,
            });
        }
    }
});
exports.GeofenceService = {
    createGeofenceZone,
    getActiveGeofenceZones,
    updateGeofenceStats,
    recordUserLocation,
    getUserLocationHistory,
    autoGenerateGeofenceZones,
    calculateDistance,
};
