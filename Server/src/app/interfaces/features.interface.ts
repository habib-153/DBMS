/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TUserSession {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  lastActivity: Date;
  loginAt: Date;
  logoutAt?: Date;
  createdAt: Date;
}

export interface TCreateUserSession {
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface TAIAnalysisLog extends Record<string, unknown> {
  id: string;
  postId: string;
  analysisType: string;
  model?: string;
  confidence?: number;
  predictions?: any; // JSONB
  isCrimeRelated?: boolean;
  detectedObjects?: string[];
  processingTime?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorMessage?: string;
  createdAt: Date;
}

export interface TCreateAIAnalysisLog {
  postId: string;
  analysisType: string;
  model?: string;
  confidence?: number;
  predictions?: any;
  isCrimeRelated?: boolean;
  detectedObjects?: string[];
  processingTime?: number;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorMessage?: string;
}

export type NotificationType =
  | 'GEOFENCE_WARNING'
  | 'POST_APPROVED'
  | 'POST_REJECTED'
  | 'COMMENT_REPLY'
  | 'UPVOTE'
  | 'FOLLOW'
  | 'REPORT_REVIEWED'
  | 'SYSTEM_ALERT';

export interface TNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // JSONB
  isRead: boolean;
  isPush: boolean;
  createdAt: Date;
}

export interface TCreateNotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isPush?: boolean;
}

export interface TGeofenceZone extends Record<string, unknown> {
  id: string;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  crimeCount: number;
  averageVerificationScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  district?: string;
  division?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCreateGeofenceZone {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  district?: string;
  division?: string;
}

export interface TUserLocationHistory extends Record<string, unknown> {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  activity?: string;
  geofenceZoneId?: string;
  notificationSent: boolean;
  timestamp: Date;
}

export interface TCreateUserLocationHistory {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  activity?: string;
  geofenceZoneId?: string;
}

export interface TPushNotificationToken extends Record<string, unknown> {
  id: string;
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCreatePushToken {
  userId: string;
  token: string;
  platform: 'web' | 'android' | 'ios';
}
