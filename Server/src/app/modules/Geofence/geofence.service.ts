/* eslint-disable no-unused-vars */
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

  // Debug: log computed distances and entered zone
  try {
    console.debug(
      '[Geofence] user:',
      userId,
      'lat:',
      locationData.latitude,
      'lng:',
      locationData.longitude
    );
    if (enteredZone) {
      console.debug(
        '[Geofence] Entered zone detected:',
        enteredZone.id,
        enteredZone.name,
        'risk:',
        enteredZone.riskLevel
      );
    } else {
      console.debug('[Geofence] No geofence zone detected for this location');
    }
  } catch (err) {
    // swallow logging errors
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
      // Debug: log recentCheck rows
      try {
        console.debug('[Geofence] recentCheck rows:', recentCheck.rows);
      } catch (err) {
        /* ignore */
      }

      // Debug: fetch user's push tokens
      try {
        const tokensResult = await database.query(
          `SELECT * FROM push_notification_tokens WHERE "userId" = $1 AND "isActive" = true`,
          [userId]
        );
        console.debug('[Geofence] user push tokens:', tokensResult.rows);
      } catch (err) {
        console.error('[Geofence] Failed to fetch push tokens:', err);
      }

      // Send notification
      try {
        await NotificationService.createGeofenceWarning(
          userId,
          enteredZone.name,
          enteredZone.riskLevel
        );
        notificationSent = true;
        console.debug(
          '[Geofence] Notification created for user',
          userId,
          'zone',
          enteredZone.id
        );
      } catch (err) {
        console.error(
          '[Geofence] Failed to create geofence notification:',
          err
        );
      }
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

// Create geofence zone for a single approved post (auto-triggered)
const createGeofenceForPost = async (postId: string): Promise<void> => {
  // Fetch post details
  const postQuery = `
    SELECT id, title, latitude, longitude, district, division, "verificationScore"
    FROM posts
    WHERE id = $1 
      AND "isDeleted" = false 
      AND status = 'APPROVED'
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
  `;

  const postResult = await database.query(postQuery, [postId]);
  const post = postResult.rows[0];

  if (!post) {
    // eslint-disable-next-line no-console
    console.log(
      `[Geofence] Post ${postId} not found or not eligible for geofence`
    );
    return;
  }

  // Check if geofence zone already exists for this exact location (within 2 meters)
  const existingZoneQuery = `
    SELECT * FROM geofence_zones
    WHERE (6371000 * acos(
      cos(radians($1)) * cos(radians("centerLatitude")) * 
      cos(radians("centerLongitude") - radians($2)) + 
      sin(radians($1)) * sin(radians("centerLatitude"))
    )) <= 2
  `;

  const existingZone = await database.query(existingZoneQuery, [
    post.latitude,
    post.longitude,
  ]);

  if (existingZone.rows.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `[Geofence] Zone already exists for post ${postId} at this location`
    );
    return;
  }

  // Determine risk level based on verification score
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
  const score = parseFloat(post.verificationScore as string) || 50;

  if (score >= 80) riskLevel = 'CRITICAL';
  else if (score >= 60) riskLevel = 'HIGH';
  else if (score >= 40) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  // Create geofence zone with 2-meter radius
  try {
    await createGeofenceZone({
      name:
        (post.title as string) ||
        `Crime Location ${(post.district as string) || 'Unknown'}`,
      centerLatitude: parseFloat(post.latitude as string),
      centerLongitude: parseFloat(post.longitude as string),
      radiusMeters: 2,
      riskLevel,
      district: (post.district as string) || undefined,
      division: (post.division as string) || undefined,
    });

    // eslint-disable-next-line no-console
    console.log(
      `[Geofence] ✓ Created 2m zone for post ${postId}: "${
        post.title as string
      }" (${riskLevel})`
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[Geofence] ✗ Failed to create zone for post ${postId}:`,
      error
    );
  }
};

// Auto-generate geofence zones from all approved posts (manual button trigger)
const autoGenerateGeofenceZones = async (): Promise<{
  created: number;
  skipped: number;
  totalPosts: number;
}> => {
  // Get all approved posts with coordinates that don't have a geofence zone yet
  const postsQuery = `
    SELECT id, title, latitude, longitude, district, division, "verificationScore"
    FROM posts
    WHERE "isDeleted" = false 
      AND status = 'APPROVED'
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
    ORDER BY "crimeDate" DESC
  `;

  const postsResult = await database.query(postsQuery);
  const posts = postsResult.rows;

  // eslint-disable-next-line no-console
  console.log(
    `[Geofence Auto-Generate] Total approved posts with coordinates: ${posts.length}`
  );

  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    // Check if zone already exists at this exact location (within 2 meters)
    const existingZoneQuery = `
      SELECT * FROM geofence_zones
      WHERE (6371000 * acos(
        cos(radians($1)) * cos(radians("centerLatitude")) * 
        cos(radians("centerLongitude") - radians($2)) + 
        sin(radians($1)) * sin(radians("centerLatitude"))
      )) <= 2
    `;

    const existingZone = await database.query(existingZoneQuery, [
      post.latitude,
      post.longitude,
    ]);

    if (existingZone.rows.length > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `[Geofence] Skipping post ${
          post.id as string
        } - zone already exists at this location`
      );
      skipped++;
      continue;
    }

    // Determine risk level based on verification score
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    const score = parseFloat(post.verificationScore as string) || 50;

    if (score >= 80) riskLevel = 'CRITICAL';
    else if (score >= 60) riskLevel = 'HIGH';
    else if (score >= 40) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    // Create geofence zone with 2-meter radius
    try {
      await createGeofenceZone({
        name:
          (post.title as string) ||
          `Crime Location ${(post.district as string) || 'Unknown'}`,
        centerLatitude: parseFloat(post.latitude as string),
        centerLongitude: parseFloat(post.longitude as string),
        radiusMeters: 2,
        riskLevel,
        district: (post.district as string) || undefined,
        division: (post.division as string) || undefined,
      });
      created++;
      // eslint-disable-next-line no-console
      console.log(
        `[Geofence] ✓ Created 2m zone for post ${post.id as string}: "${
          post.title as string
        }" (${riskLevel})`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `[Geofence] ✗ Failed to create zone for post ${post.id as string}:`,
        error
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `[Geofence Auto-Generate] Summary - Created: ${created}, Skipped: ${skipped}, Total posts: ${posts.length}`
  );

  return {
    created,
    skipped,
    totalPosts: posts.length,
  };
};

const updateGeofenceZone = async (
  zoneId: string,
  updateData: Partial<TCreateGeofenceZone>
): Promise<TGeofenceZone> => {
  const now = new Date();

  // Build dynamic update query
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updateData.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updateData.name);
  }
  if (updateData.centerLatitude !== undefined) {
    fields.push(`"centerLatitude" = $${paramIndex++}`);
    values.push(updateData.centerLatitude);
  }
  if (updateData.centerLongitude !== undefined) {
    fields.push(`"centerLongitude" = $${paramIndex++}`);
    values.push(updateData.centerLongitude);
  }
  if (updateData.radiusMeters !== undefined) {
    fields.push(`"radiusMeters" = $${paramIndex++}`);
    values.push(updateData.radiusMeters);
  }
  if (updateData.riskLevel !== undefined) {
    fields.push(`"riskLevel" = $${paramIndex++}`);
    values.push(updateData.riskLevel);
  }
  if (updateData.district !== undefined) {
    fields.push(`district = $${paramIndex++}`);
    values.push(updateData.district);
  }
  if (updateData.division !== undefined) {
    fields.push(`division = $${paramIndex++}`);
    values.push(updateData.division);
  }

  fields.push(`"updatedAt" = $${paramIndex++}`);
  values.push(now);

  values.push(zoneId);

  const query = `
    UPDATE geofence_zones
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await database.query<TGeofenceZone>(query, values);
  const updatedZone = result.rows[0];

  if (!updatedZone) {
    throw new AppError(httpStatus.NOT_FOUND, 'Geofence zone not found');
  }

  return updatedZone;
};

const deleteGeofenceZone = async (zoneId: string): Promise<void> => {
  // Soft delete by setting isActive to false
  const query = `
    UPDATE geofence_zones
    SET "isActive" = false, "updatedAt" = $1
    WHERE id = $2
    RETURNING id
  `;

  const result = await database.query(query, [new Date(), zoneId]);

  if (result.rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Geofence zone not found');
  }
};

export const GeofenceService = {
  createGeofenceZone,
  getActiveGeofenceZones,
  updateGeofenceStats,
  updateGeofenceZone,
  deleteGeofenceZone,
  recordUserLocation,
  getUserLocationHistory,
  autoGenerateGeofenceZones,
  createGeofenceForPost,
  calculateDistance,
};
