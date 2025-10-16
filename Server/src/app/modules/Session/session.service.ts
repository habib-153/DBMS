import { randomBytes } from 'crypto';
import database from '../../../shared/database';
import {
  TCreateUserSession,
  TUserSession,
} from '../../interfaces/features.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

// Parse User-Agent string to extract browser, OS, and device info
const parseUserAgent = (
  userAgent: string
): { browser: string; os: string; device: string } => {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'MacOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  // Device detection
  if (userAgent.includes('Mobile')) device = 'Mobile';
  else if (userAgent.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
};

const createSession = async (
  sessionData: TCreateUserSession
): Promise<TUserSession> => {
  const sessionId = generateUuid();
  const sessionToken = randomBytes(32).toString('hex');
  const now = new Date();

  // Parse user agent if provided
  let browser = sessionData.browser;
  let os = sessionData.os;
  let device = sessionData.device;

  if (sessionData.userAgent && !browser) {
    const parsed = parseUserAgent(sessionData.userAgent);
    browser = parsed.browser;
    os = parsed.os;
    device = parsed.device;
  }

  const query = `
    INSERT INTO user_sessions (
      id, "userId", "sessionToken", "ipAddress", "userAgent",
      browser, os, device, country, city, latitude, longitude,
      "isActive", "lastActivity", "loginAt", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, $14, $15)
    RETURNING *
  `;

  const values = [
    sessionId,
    sessionData.userId,
    sessionToken,
    sessionData.ipAddress || null,
    sessionData.userAgent || null,
    browser || null,
    os || null,
    device || null,
    sessionData.country || null,
    sessionData.city || null,
    sessionData.latitude || null,
    sessionData.longitude || null,
    now,
    now,
    now,
  ];

  const result = await database.query(query, values);
  const createdSession = result.rows[0] as unknown as TUserSession;

  if (!createdSession) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create session'
    );
  }

  return createdSession;
};

const getActiveUserSessions = async (
  userId: string
): Promise<TUserSession[]> => {
  const query = `
    SELECT * FROM user_sessions
    WHERE "userId" = $1 AND "isActive" = true
    ORDER BY "lastActivity" DESC
  `;

  const result = await database.query(query, [userId]);
  return result.rows as unknown as TUserSession[];
};

const getAllUserSessions = async (userId: string): Promise<TUserSession[]> => {
  const query = `
    SELECT * FROM user_sessions
    WHERE "userId" = $1
    ORDER BY "loginAt" DESC
    LIMIT 50
  `;

  const result = await database.query(query, [userId]);
  return result.rows as unknown as TUserSession[];
};

const updateSessionActivity = async (sessionToken: string): Promise<void> => {
  const query = `
    UPDATE user_sessions
    SET "lastActivity" = $1
    WHERE "sessionToken" = $2 AND "isActive" = true
  `;

  await database.query(query, [new Date(), sessionToken]);
};

const endSession = async (sessionToken: string): Promise<void> => {
  const query = `
    UPDATE user_sessions
    SET "isActive" = false, "logoutAt" = $1
    WHERE "sessionToken" = $2
  `;

  await database.query(query, [new Date(), sessionToken]);
};

const endAllUserSessions = async (userId: string): Promise<void> => {
  const query = `
    UPDATE user_sessions
    SET "isActive" = false, "logoutAt" = $1
    WHERE "userId" = $2 AND "isActive" = true
  `;

  await database.query(query, [new Date(), userId]);
};

const updateActiveSessionLocation = async (
  userId: string,
  locationData: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    country?: string;
    city?: string;
    address?: string;
  }
): Promise<void> => {
  const updates: string[] = [];
  const values: (number | string | Date)[] = [];
  let paramIndex = 1;

  if (locationData.latitude !== undefined) {
    updates.push(`latitude = $${paramIndex++}`);
    values.push(locationData.latitude);
  }

  if (locationData.longitude !== undefined) {
    updates.push(`longitude = $${paramIndex++}`);
    values.push(locationData.longitude);
  }

  if (locationData.country !== undefined) {
    updates.push(`country = $${paramIndex++}`);
    values.push(locationData.country);
  }

  if (locationData.city !== undefined) {
    updates.push(`city = $${paramIndex++}`);
    values.push(locationData.city);
  }

  if (updates.length === 0) {
    return; // Nothing to update
  }

  updates.push(`"lastActivity" = $${paramIndex++}`);
  values.push(new Date());

  values.push(userId);

  const query = `
    UPDATE user_sessions
    SET ${updates.join(', ')}
    WHERE "userId" = $${paramIndex} AND "isActive" = true
  `;

  await database.query(query, values);
};

export const SessionService = {
  createSession,
  getActiveUserSessions,
  getAllUserSessions,
  updateSessionActivity,
  endSession,
  endAllUserSessions,
  updateActiveSessionLocation,
  parseUserAgent,
};
