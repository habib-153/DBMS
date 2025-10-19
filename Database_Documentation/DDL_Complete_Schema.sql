-- ============================================
-- WARDEN - CRIME REPORTING PLATFORM
-- DDL (Data Definition Language) - Complete Schema
-- Database: PostgreSQL (Neon)
-- ============================================

-- ============================================
-- 1. CREATE ENUM TYPES
-- ============================================

-- User Role Enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- User Status Enum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- Post Status Enum
CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Vote Type Enum
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

-- Crime Category Enum
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

-- Report Status Enum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Notification Type Enum
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

-- ============================================
-- 2. USER MANAGEMENT TABLES
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "profilePhoto" TEXT,
    "role" "UserRole" DEFAULT 'USER' NOT NULL,
    "status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
    "isVerified" BOOLEAN DEFAULT false NOT NULL,
    "otp" TEXT,
    "otp_expires_at" TIMESTAMP WITHOUT TIME ZONE,
    "needPasswordChange" BOOLEAN DEFAULT true NOT NULL,
    "passwordChangedAt" TIMESTAMP WITHOUT TIME ZONE,
    
    -- Location fields
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastLocationLatitude" DOUBLE PRECISION,
    "lastLocationLongitude" DOUBLE PRECISION,
    "lastLocationUpdated" TIMESTAMP WITHOUT TIME ZONE,
    
    -- Safety features
    "safeTravelMode" BOOLEAN DEFAULT false,
    "notificationRadius" INTEGER DEFAULT 1000,
    
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id")
);

-- Indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON users USING btree (phone);
CREATE INDEX IF NOT EXISTS users_lastLocationLatitude_idx ON users USING btree ("lastLocationLatitude");
CREATE INDEX IF NOT EXISTS users_lastLocationLongitude_idx ON users USING btree ("lastLocationLongitude");

-- User Sessions Table
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

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS user_sessions_userId_idx ON user_sessions USING btree ("userId");
CREATE INDEX IF NOT EXISTS user_sessions_isActive_idx ON user_sessions USING btree ("isActive");
CREATE INDEX IF NOT EXISTS user_sessions_loginAt_idx ON user_sessions USING btree ("loginAt");

-- Follows Table (User Follow Relationships)
CREATE TABLE IF NOT EXISTS follows (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT follows_followerId_fkey FOREIGN KEY ("followerId") REFERENCES users ("id") ON DELETE CASCADE,
    CONSTRAINT follows_followingId_fkey FOREIGN KEY ("followingId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Unique index on follows
CREATE UNIQUE INDEX IF NOT EXISTS follows_followerId_followingId_key ON follows USING btree ("followerId", "followingId");

-- ============================================
-- 3. LOCATION MANAGEMENT TABLES
-- ============================================

-- Divisions Table (Bangladesh Administrative Divisions)
CREATE TABLE IF NOT EXISTS division (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100),
    url VARCHAR(255)
);

-- Districts Table (Bangladesh Administrative Districts)
CREATE TABLE IF NOT EXISTS district (
    id SERIAL PRIMARY KEY,
    division_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    bn_name VARCHAR(100),
    lat DECIMAL(10, 7),
    lon DECIMAL(10, 7),
    url VARCHAR(255),
    CONSTRAINT fk_division FOREIGN KEY (division_id) REFERENCES division (id) ON DELETE CASCADE
);

-- ============================================
-- 4. CRIME REPORTING TABLES
-- ============================================

-- Posts Table (Crime Reports)
CREATE TABLE IF NOT EXISTS posts (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    
    -- Crime details
    "category" "CrimeCategory" DEFAULT 'OTHERS',
    "postDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "crimeDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    -- Moderation
    "status" "PostStatus" DEFAULT 'PENDING' NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false NOT NULL,
    
    -- Verification and engagement
    "verificationScore" DECIMAL(10, 2) DEFAULT 50.0 NOT NULL,
    "aiVerificationScore" DECIMAL(5, 2) DEFAULT NULL,
    "reportCount" INTEGER DEFAULT 0 NOT NULL,
    
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT posts_authorId_fkey FOREIGN KEY ("authorId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Indexes for posts
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts USING btree ("category");
CREATE INDEX IF NOT EXISTS posts_verificationScore_idx ON posts USING btree ("verificationScore");
CREATE INDEX IF NOT EXISTS posts_reportCount_idx ON posts USING btree ("reportCount");

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT REFERENCES comments("id") ON DELETE CASCADE,
    "isDeleted" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT comments_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE,
    CONSTRAINT comments_authorId_fkey FOREIGN KEY ("authorId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Post Votes Table
CREATE TABLE IF NOT EXISTS post_votes (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT post_votes_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE,
    CONSTRAINT post_votes_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE
);

-- Unique index on post_votes
CREATE UNIQUE INDEX IF NOT EXISTS post_votes_userId_postId_key ON post_votes USING btree ("userId", "postId");

-- Comment Votes Table
CREATE TABLE IF NOT EXISTS comment_votes (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT comment_votes_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE,
    CONSTRAINT comment_votes_commentId_fkey FOREIGN KEY ("commentId") REFERENCES comments ("id") ON DELETE CASCADE
);

-- Unique index on comment_votes
CREATE UNIQUE INDEX IF NOT EXISTS comment_votes_userId_commentId_key ON comment_votes USING btree ("userId", "commentId");

-- Post Reports Table (User-reported inappropriate content)
CREATE TABLE IF NOT EXISTS post_reports (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP WITHOUT TIME ZONE,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT post_reports_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE,
    CONSTRAINT post_reports_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE,
    CONSTRAINT post_reports_reviewedBy_fkey FOREIGN KEY ("reviewedBy") REFERENCES users ("id") ON DELETE SET NULL
);

-- Indexes for post_reports
CREATE UNIQUE INDEX IF NOT EXISTS post_reports_userId_postId_key ON post_reports USING btree ("userId", "postId");
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports USING btree ("status");

-- ============================================
-- 5. GEOFENCING & LOCATION TRACKING
-- ============================================

-- Geofence Zones Table (High-crime danger zones)
CREATE TABLE IF NOT EXISTS geofence_zones (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "centerLatitude" DOUBLE PRECISION NOT NULL,
  "centerLongitude" DOUBLE PRECISION NOT NULL,
  "radiusMeters" INTEGER NOT NULL,
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

-- Indexes for geofence_zones
CREATE INDEX IF NOT EXISTS geofence_zones_centerLatitude_idx ON geofence_zones USING btree ("centerLatitude");
CREATE INDEX IF NOT EXISTS geofence_zones_centerLongitude_idx ON geofence_zones USING btree ("centerLongitude");
CREATE INDEX IF NOT EXISTS geofence_zones_isActive_idx ON geofence_zones USING btree ("isActive");
CREATE INDEX IF NOT EXISTS geofence_zones_riskLevel_idx ON geofence_zones USING btree ("riskLevel");

-- User Location History Table
CREATE TABLE IF NOT EXISTS user_location_history (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracy" DOUBLE PRECISION,
  "address" TEXT,
  "activity" TEXT,
  "geofenceZoneId" TEXT,
  "notificationSent" BOOLEAN DEFAULT false,
  "timestamp" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT user_location_history_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE,
  CONSTRAINT user_location_history_geofenceZoneId_fkey FOREIGN KEY ("geofenceZoneId") REFERENCES geofence_zones ("id") ON DELETE SET NULL
);

-- Indexes for user_location_history
CREATE INDEX IF NOT EXISTS user_location_history_userId_idx ON user_location_history USING btree ("userId");
CREATE INDEX IF NOT EXISTS user_location_history_timestamp_idx ON user_location_history USING btree ("timestamp");
CREATE INDEX IF NOT EXISTS user_location_history_geofenceZoneId_idx ON user_location_history USING btree ("geofenceZoneId");

-- ============================================
-- 6. NOTIFICATIONS
-- ============================================

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  "isRead" BOOLEAN DEFAULT false,
  "isPush" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT notifications_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS notifications_userId_idx ON notifications USING btree ("userId");
CREATE INDEX IF NOT EXISTS notifications_isRead_idx ON notifications USING btree ("isRead");
CREATE INDEX IF NOT EXISTS notifications_createdAt_idx ON notifications USING btree ("createdAt");

-- Push Notification Tokens Table (FCM)
CREATE TABLE IF NOT EXISTS push_notification_tokens (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "platform" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT push_notification_tokens_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Indexes for push_notification_tokens
CREATE INDEX IF NOT EXISTS push_notification_tokens_userId_idx ON push_notification_tokens USING btree ("userId");
CREATE INDEX IF NOT EXISTS push_notification_tokens_isActive_idx ON push_notification_tokens USING btree ("isActive");

-- ============================================
-- 7. AI ANALYSIS & ANALYTICS
-- ============================================

-- AI Analysis Logs Table
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "analysisType" TEXT NOT NULL,
  "model" TEXT,
  "confidence" DECIMAL(5, 2),
  "predictions" JSONB,
  "isCrimeRelated" BOOLEAN,
  "detectedObjects" TEXT[],
  "processingTime" INTEGER,
  "status" TEXT DEFAULT 'SUCCESS',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT ai_analysis_logs_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE
);

-- Indexes for ai_analysis_logs
CREATE INDEX IF NOT EXISTS ai_analysis_logs_postId_idx ON ai_analysis_logs USING btree ("postId");
CREATE INDEX IF NOT EXISTS ai_analysis_logs_analysisType_idx ON ai_analysis_logs USING btree ("analysisType");
CREATE INDEX IF NOT EXISTS ai_analysis_logs_createdAt_idx ON ai_analysis_logs USING btree ("createdAt");

-- ============================================
-- END OF DDL SCRIPT
-- ============================================
