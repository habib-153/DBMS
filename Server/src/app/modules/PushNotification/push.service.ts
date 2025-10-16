import { randomBytes } from 'crypto';
import database from '../../../shared/database';
import {
  TCreatePushToken,
  TPushNotificationToken,
} from '../../interfaces/features.interface';
import { FirebaseService } from '../../config/firebase.config';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const registerPushToken = async (
  tokenData: TCreatePushToken
): Promise<TPushNotificationToken> => {
  const tokenId = generateUuid();
  const now = new Date();

  // Check if token already exists
  const existingToken = await database.query(
    'SELECT * FROM push_notification_tokens WHERE token = $1',
    [tokenData.token]
  );

  if (existingToken.rows.length > 0) {
    // Update existing token
    const updateQuery = `
      UPDATE push_notification_tokens
      SET "userId" = $1, platform = $2, "isActive" = true, "updatedAt" = $3
      WHERE token = $4
      RETURNING *
    `;

    const result = await database.query<TPushNotificationToken>(updateQuery, [
      tokenData.userId,
      tokenData.platform,
      now,
      tokenData.token,
    ]);

    return result.rows[0];
  }

  // Create new token
  const query = `
    INSERT INTO push_notification_tokens (
      id, "userId", token, platform, "isActive", "createdAt", "updatedAt"
    )
    VALUES ($1, $2, $3, $4, true, $5, $6)
    RETURNING *
  `;

  const values = [
    tokenId,
    tokenData.userId,
    tokenData.token,
    tokenData.platform,
    now,
    now,
  ];

  const result = await database.query<TPushNotificationToken>(query, values);
  const createdToken = result.rows[0];

  if (!createdToken) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to register push token'
    );
  }

  return createdToken;
};

const getUserPushTokens = async (
  userId: string
): Promise<TPushNotificationToken[]> => {
  const query = `
    SELECT * FROM push_notification_tokens
    WHERE "userId" = $1 AND "isActive" = true
  `;

  const result = await database.query<TPushNotificationToken>(query, [userId]);
  return result.rows;
};

const deactivateToken = async (token: string): Promise<void> => {
  const query = `
    UPDATE push_notification_tokens
    SET "isActive" = false, "updatedAt" = $1
    WHERE token = $2
  `;

  await database.query(query, [new Date(), token]);
};

const sendPushToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> => {
  const tokens = await getUserPushTokens(userId);

  if (tokens.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const tokenStrings = tokens.map((t) => t.token);
  let sent = 0;
  let failed = 0;

  // Send to each token individually to handle failures
  for (const token of tokenStrings) {
    const success = await FirebaseService.sendPushNotification(
      token,
      title,
      body,
      data
    );

    if (success) {
      sent++;
    } else {
      failed++;
      // Deactivate invalid token
      await deactivateToken(token);
    }
  }

  return { sent, failed };
};

const sendPushToMultipleUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number }> => {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, title, body, data);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { sent: totalSent, failed: totalFailed };
};

const sendGeofenceWarningPush = async (
  userId: string,
  zoneName: string,
  riskLevel: string
): Promise<void> => {
  const emoji = riskLevel === 'CRITICAL' ? '🚨' : '⚠️';

  await sendPushToUser(
    userId,
    `${emoji} Danger Zone Alert`,
    `You are entering ${zoneName}, a ${riskLevel.toLowerCase()}-risk area. Stay cautious!`,
    {
      type: 'GEOFENCE_WARNING',
      zoneName,
      riskLevel,
    }
  );
};

const sendPostStatusPush = async (
  userId: string,
  postTitle: string,
  status: 'APPROVED' | 'REJECTED'
): Promise<void> => {
  const title = status === 'APPROVED' ? '✅ Post Approved' : '❌ Post Rejected';
  const body =
    status === 'APPROVED'
      ? `Your post "${postTitle}" has been approved and is now visible to everyone.`
      : `Your post "${postTitle}" has been rejected. Please check the guidelines.`;

  await sendPushToUser(userId, title, body, {
    type: `POST_${status}`,
    postTitle,
  });
};

export const PushNotificationService = {
  registerPushToken,
  getUserPushTokens,
  deactivateToken,
  sendPushToUser,
  sendPushToMultipleUsers,
  sendGeofenceWarningPush,
  sendPostStatusPush,
};
