-- Migration: Add crime categories and enhanced features
-- Date: 2025-01-16

-- Add crime category enum
CREATE TYPE "CrimeCategory" AS ENUM (
  'MURDER',
  'THEFT',
  'PICKPOCKET',
  'BURGLARY',
  'DACOITY',
  'ASSAULT',
  'FRAUD',
  'VANDALISM',
  'KIDNAPPING',
  'OTHERS'
);

-- Add category column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS "category" "CrimeCategory" DEFAULT 'OTHERS';

-- Create index for faster category queries
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts USING btree ("category");

-- ============================================
-- USER SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "device" TEXT,
  "country" TEXT,
  "city" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "isActive" BOOLEAN DEFAULT true,
  "lastActivity" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "loginAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "logoutAt" TIMESTAMP WITHOUT TIME ZONE,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT user_sessions_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS user_sessions_userId_idx ON user_sessions USING btree ("userId");
CREATE INDEX IF NOT EXISTS user_sessions_isActive_idx ON user_sessions USING btree ("isActive");
CREATE INDEX IF NOT EXISTS user_sessions_loginAt_idx ON user_sessions USING btree ("loginAt");

-- ============================================
-- AI ANALYSIS LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "analysisType" TEXT NOT NULL, -- 'roboflow', 'image_classification', etc.
  "model" TEXT,
  "confidence" DECIMAL(5, 2),
  "predictions" JSONB, -- Store detailed predictions/results
  "isCrimeRelated" BOOLEAN,
  "detectedObjects" TEXT[],
  "processingTime" INTEGER, -- milliseconds
  "status" TEXT DEFAULT 'SUCCESS', -- SUCCESS, FAILED, PENDING
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT ai_analysis_logs_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ai_analysis_logs_postId_idx ON ai_analysis_logs USING btree ("postId");
CREATE INDEX IF NOT EXISTS ai_analysis_logs_analysisType_idx ON ai_analysis_logs USING btree ("analysisType");
CREATE INDEX IF NOT EXISTS ai_analysis_logs_createdAt_idx ON ai_analysis_logs USING btree ("createdAt");

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TYPE "NotificationType" AS ENUM (
  'GEOFENCE_WARNING',
  'POST_APPROVED',
  'POST_REJECTED',
  'COMMENT_REPLY',
  'UPVOTE',
  'FOLLOW',
  'REPORT_REVIEWED',
  'SYSTEM_ALERT'
);

CREATE TABLE IF NOT EXISTS notifications (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB, -- Additional data like postId, commentId, etc.
  "isRead" BOOLEAN DEFAULT false,
  "isPush" BOOLEAN DEFAULT false, -- Whether it was sent as push notification
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT notifications_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS notifications_userId_idx ON notifications USING btree ("userId");
CREATE INDEX IF NOT EXISTS notifications_isRead_idx ON notifications USING btree ("isRead");
CREATE INDEX IF NOT EXISTS notifications_createdAt_idx ON notifications USING btree ("createdAt");

-- ============================================
-- GEOFENCE ZONES TABLE (High Crime Areas)
-- ============================================
CREATE TABLE IF NOT EXISTS geofence_zones (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "centerLatitude" DOUBLE PRECISION NOT NULL,
  "centerLongitude" DOUBLE PRECISION NOT NULL,
  "radiusMeters" INTEGER NOT NULL, -- Radius in meters
  "crimeCount" INTEGER DEFAULT 0,
  "averageVerificationScore" DECIMAL(5, 2) DEFAULT 50.0,
  "riskLevel" TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  "district" TEXT,
  "division" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS geofence_zones_centerLatitude_idx ON geofence_zones USING btree ("centerLatitude");
CREATE INDEX IF NOT EXISTS geofence_zones_centerLongitude_idx ON geofence_zones USING btree ("centerLongitude");
CREATE INDEX IF NOT EXISTS geofence_zones_isActive_idx ON geofence_zones USING btree ("isActive");
CREATE INDEX IF NOT EXISTS geofence_zones_riskLevel_idx ON geofence_zones USING btree ("riskLevel");

-- ============================================
-- USER LOCATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_location_history (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracy" DOUBLE PRECISION, -- GPS accuracy in meters
  "address" TEXT,
  "activity" TEXT, -- 'stationary', 'walking', 'in_vehicle', etc.
  "geofenceZoneId" TEXT, -- If user entered a geofence zone
  "notificationSent" BOOLEAN DEFAULT false,
  "timestamp" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT user_location_history_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE,
  CONSTRAINT user_location_history_geofenceZoneId_fkey FOREIGN KEY ("geofenceZoneId") REFERENCES geofence_zones ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS user_location_history_userId_idx ON user_location_history USING btree ("userId");
CREATE INDEX IF NOT EXISTS user_location_history_timestamp_idx ON user_location_history USING btree ("timestamp");
CREATE INDEX IF NOT EXISTS user_location_history_geofenceZoneId_idx ON user_location_history USING btree ("geofenceZoneId");

-- ============================================
-- PUSH NOTIFICATION TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "platform" TEXT NOT NULL, -- 'web', 'android', 'ios'
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT push_notification_tokens_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS push_notification_tokens_userId_idx ON push_notification_tokens USING btree ("userId");
CREATE INDEX IF NOT EXISTS push_notification_tokens_isActive_idx ON push_notification_tokens USING btree ("isActive");

-- Add AI verification score to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS "aiVerificationScore" DECIMAL(5, 2) DEFAULT NULL;

-- Add last location to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "lastLocationLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "lastLocationLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "lastLocationUpdated" TIMESTAMP WITHOUT TIME ZONE;

-- Add safe travel mode preference
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "safeTravelMode" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "notificationRadius" INTEGER DEFAULT 1000; -- Default 1km radius

CREATE INDEX IF NOT EXISTS users_lastLocationLatitude_idx ON users USING btree ("lastLocationLatitude");
CREATE INDEX IF NOT EXISTS users_lastLocationLongitude_idx ON users USING btree ("lastLocationLongitude");
