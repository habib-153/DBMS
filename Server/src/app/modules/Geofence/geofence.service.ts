import { randomBytes } from 'crypto';
import database from '../../../shared/database';
import {
  TCreateGeofenceZone,
  TGeofenceZone,
  TCreateUserLocationHistory,
  TUserLocationHistory,
} from '../../interfaces/features.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { NotificationService } from '../Notification/notification.service';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const createGeofenceZone = async (
  zoneData: TCreateGeofenceZone
): Promise<TGeofenceZone> => {
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

  const result = await database.query<TGeofenceZone>(query, values);
  const createdZone = result.rows[0];

  if (!createdZone) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create geofence zone'
    );
  }

  return createdZone;
};

const getActiveGeofenceZones = async (): Promise<TGeofenceZone[]> => {
  const query = `
    SELECT * FROM geofence_zones
    WHERE "isActive" = true
    ORDER BY "riskLevel" DESC, "crimeCount" DESC
  `;

  const result = await database.query<TGeofenceZone>(query);
  return result.rows;
};

const updateGeofenceStats = async (zoneId: string): Promise<void> => {
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

  const statsResult = await database.query(statsQuery, [zoneId]);
  const stats = statsResult.rows[0];

  // Determine risk level based on crime count and verification scores
  let riskLevel = 'LOW';
  const crimeCount = parseInt(stats?.crime_count as string) || 0;
  const avgScore = parseFloat(stats.avg_score as string) || 50;

  if (crimeCount >= 20 || avgScore < 40) riskLevel = 'CRITICAL';
  else if (crimeCount >= 10 || avgScore < 50) riskLevel = 'HIGH';
  else if (crimeCount >= 5 || avgScore < 60) riskLevel = 'MEDIUM';

  const updateQuery = `
    UPDATE geofence_zones
    SET "crimeCount" = $1,
        "averageVerificationScore" = $2,
        "riskLevel" = $3,
        "updatedAt" = $4
    WHERE id = $5
  `;

  await database.query(updateQuery, [
    crimeCount,
    avgScore,
    riskLevel,
    new Date(),
    zoneId,
  ]);
};

const recordUserLocation = async (
  locationData: TCreateUserLocationHistory,
  userId: string
): Promise<TUserLocationHistory> => {
  const locationId = generateUuid();

  // Check if user is in any geofence zone
  const zones = await getActiveGeofenceZones();
  let enteredZone: TGeofenceZone | null = null;

  for (const zone of zones) {
    const distance = calculateDistance(
      locationData.latitude,
      locationData.longitude,
      zone.centerLatitude,
      zone.centerLongitude
    );

    if (distance <= zone.radiusMeters) {
      enteredZone = zone;
      break;
    }
  }

  // Check if notification was already sent for this zone recently (within 1 hour)
  let notificationSent = false;
  if (enteredZone) {
    const recentCheck = await database.query(
      `
      SELECT * FROM user_location_history
      WHERE "userId" = $1 
        AND "geofenceZoneId" = $2 
        AND "notificationSent" = true
        AND timestamp > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `,
      [userId, enteredZone.id]
    );

    if (recentCheck.rows.length === 0) {
      // Send notification
      await NotificationService.createGeofenceWarning(
        userId,
        enteredZone.name,
        enteredZone.riskLevel
      );
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
    enteredZone?.id || null,
    notificationSent,
    new Date(),
  ];

  const result = await database.query<TUserLocationHistory>(query, values);
  return result.rows[0];
};

const getUserLocationHistory = async (
  userId: string,
  limit = 100
): Promise<TUserLocationHistory[]> => {
  const query = `
    SELECT ulh.*, gz.name as zone_name, gz."riskLevel" as zone_risk
    FROM user_location_history ulh
    LEFT JOIN geofence_zones gz ON ulh."geofenceZoneId" = gz.id
    WHERE ulh."userId" = $1
    ORDER BY ulh.timestamp DESC
    LIMIT $2
  `;

  const result = await database.query<TUserLocationHistory>(query, [
    userId,
    limit,
  ]);
  return result.rows;
};

// Auto-generate geofence zones from crime data
const autoGenerateGeofenceZones = async (): Promise<void> => {
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

  const hotspots = await database.query(hotspotsQuery);

  for (const hotspot of hotspots.rows) {
    // Check if zone already exists
    const existingZone = await database.query(
      `
      SELECT * FROM geofence_zones
      WHERE (6371000 * acos(
        cos(radians($1)) * cos(radians("centerLatitude")) * 
        cos(radians("centerLongitude") - radians($2)) + 
        sin(radians($1)) * sin(radians("centerLatitude"))
      )) <= 500
    `,
      [hotspot.center_lat, hotspot.center_lng]
    );

    if (existingZone.rows.length === 0) {
      // Create new geofence zone
      const crimeCount = parseInt(hotspot.crime_count as string) || 0;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

      if (crimeCount >= 10) riskLevel = 'CRITICAL';
      else if (crimeCount >= 7) riskLevel = 'HIGH';
      else if (crimeCount >= 5) riskLevel = 'MEDIUM';

      await createGeofenceZone({
        name: `${hotspot.district || 'Unknown'} Crime Hotspot`,
        centerLatitude: parseFloat(hotspot.center_lat as string),
        centerLongitude: parseFloat(hotspot.center_lng as string),
        radiusMeters: 500,
        riskLevel,
        district: hotspot.district as string,
        division: hotspot.division as string,
      });
    }
  }
};

export const GeofenceService = {
  createGeofenceZone,
  getActiveGeofenceZones,
  updateGeofenceStats,
  recordUserLocation,
  getUserLocationHistory,
  autoGenerateGeofenceZones,
  calculateDistance,
};
