import { randomBytes } from 'crypto';
import database from '../../../shared/database';
import {
  TCreateNotification,
  TNotification,
} from '../../interfaces/features.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

// Simple UUID generator
const generateUuid = (): string => {
  return randomBytes(16)
    .toString('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
};

const createNotification = async (
  notificationData: TCreateNotification
): Promise<TNotification> => {
  const notificationId = generateUuid();
  const now = new Date();

  const query = `
    INSERT INTO notifications (
      id, "userId", type, title, message, data, "isRead", "isPush", "createdAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
    RETURNING *
  `;

  const values = [
    notificationId,
    notificationData.userId,
    notificationData.type,
    notificationData.title,
    notificationData.message,
    notificationData.data ? JSON.stringify(notificationData.data) : null,
    notificationData.isPush || false,
    now,
  ];

  const result = await database.query(query, values);
  const createdNotification = result.rows[0] as unknown as TNotification;

  if (!createdNotification) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create notification'
    );
  }

  return createdNotification;
};

const getUserNotifications = async (
  userId: string,
  limit = 50
): Promise<TNotification[]> => {
  const query = `
    SELECT * FROM notifications
    WHERE "userId" = $1
    ORDER BY "createdAt" DESC
    LIMIT $2
  `;

  const result = await database.query(query, [userId, limit]);
  return result.rows as unknown as TNotification[];
};

const getUnreadNotifications = async (
  userId: string
): Promise<TNotification[]> => {
  const query = `
    SELECT * FROM notifications
    WHERE "userId" = $1 AND "isRead" = false
    ORDER BY "createdAt" DESC
  `;

  const result = await database.query(query, [userId]);
  return result.rows as unknown as TNotification[];
};

const markAsRead = async (notificationId: string): Promise<void> => {
  const query = `
    UPDATE notifications
    SET "isRead" = true
    WHERE id = $1
  `;

  await database.query(query, [notificationId]);
};

const markAllAsRead = async (userId: string): Promise<void> => {
  const query = `
    UPDATE notifications
    SET "isRead" = true
    WHERE "userId" = $1 AND "isRead" = false
  `;

  await database.query(query, [userId]);
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  const query = `
    DELETE FROM notifications
    WHERE id = $1
  `;

  await database.query(query, [notificationId]);
};

// Create geofence warning notification
const createGeofenceWarning = async (
  userId: string,
  zoneName: string,
  riskLevel: string
): Promise<TNotification> => {
  const notification = await createNotification({
    userId,
    type: 'GEOFENCE_WARNING',
    title: '⚠️ Entering High-Crime Area',
    message: `You are approaching ${zoneName}, a ${riskLevel.toLowerCase()}-risk zone. Stay cautious or consider an alternative route.`,
    data: { zoneName, riskLevel },
    isPush: true,
  });

  // Send push notification asynchronously
  import('../PushNotification/push.service')
    .then(({ PushNotificationService }) => {
      PushNotificationService.sendGeofenceWarningPush(
        userId,
        zoneName,
        riskLevel
      );
    })
    .catch((err) => console.error('Failed to send push notification:', err));

  return notification;
};

export const NotificationService = {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createGeofenceWarning,
};
