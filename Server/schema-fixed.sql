-- Database Schema for Neon PostgreSQL
-- Fixed version with proper ENUM types
-- Create ENUM types first
CREATE TYPE "VoteType" AS ENUM ('UP', 'DOWN');

CREATE TYPE "PostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
DROP TYPE IF EXISTS "UserStatus" CASCADE;
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

ALTER TABLE "users" ADD COLUMN "status" "UserStatus" DEFAULT 'ACTIVE' NOT NULL;

-- Table: users (must be created first due to foreign keys)
CREATE TABLE
    IF NOT EXISTS users (
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
        "needPasswordChange" BOOLEAN DEFAULT true NOT NULL,
        "passwordChangedAt" TIMESTAMP WITHOUT TIME ZONE,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        PRIMARY KEY ("id")
    );

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users USING btree (email);

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key ON users USING btree (phone);

-- Table: posts
CREATE TABLE
    IF NOT EXISTS posts (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "district" TEXT NOT NULL,
        "division" TEXT NOT NULL,
        "postDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "crimeDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "status" "PostStatus" DEFAULT 'PENDING' NOT NULL,
        "isDeleted" BOOLEAN DEFAULT false NOT NULL,
        "authorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT posts_authorId_fkey FOREIGN KEY ("authorId") REFERENCES users ("id")
    );

-- Table: comments
CREATE TABLE
    IF NOT EXISTS comments (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "image" TEXT,
        "postId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "parentId" TEXT REFERENCES comments("id"),
        "isDeleted" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT comments_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id"),
        CONSTRAINT comments_authorId_fkey FOREIGN KEY ("authorId") REFERENCES users ("id")
    );

-- Table: follows
CREATE TABLE
    IF NOT EXISTS follows (
        "id" TEXT NOT NULL,
        "followerId" TEXT NOT NULL,
        "followingId" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT follows_followerId_fkey FOREIGN KEY ("followerId") REFERENCES users ("id"),
        CONSTRAINT follows_followingId_fkey FOREIGN KEY ("followingId") REFERENCES users ("id")
    );

CREATE UNIQUE INDEX IF NOT EXISTS follows_followerId_followingId_key ON follows USING btree ("followerId", "followingId");

-- Table: post_votes
CREATE TABLE
    IF NOT EXISTS post_votes (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "type" "VoteType" NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT post_votes_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id"),
        CONSTRAINT post_votes_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id")
    );

CREATE UNIQUE INDEX IF NOT EXISTS post_votes_userId_postId_key ON post_votes USING btree ("userId", "postId");

-- Table: comment_votes
CREATE TABLE
    IF NOT EXISTS comment_votes (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "commentId" TEXT NOT NULL,
        "type" "VoteType" NOT NULL,
        "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT comment_votes_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id"),
        CONSTRAINT comment_votes_commentId_fkey FOREIGN KEY ("commentId") REFERENCES comments ("id")
    );

CREATE UNIQUE INDEX IF NOT EXISTS comment_votes_userId_commentId_key ON comment_votes USING btree ("userId", "commentId");

CREATE TABLE
    IF NOT EXISTS division (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        bn_name VARCHAR(100),
        url VARCHAR(255)
    );

-- Table: district (Bangladesh districts)
CREATE TABLE
    IF NOT EXISTS district (
        id SERIAL PRIMARY KEY,
        division_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        bn_name VARCHAR(100),
        lat DECIMAL(10, 7),
        lon DECIMAL(10, 7),
        url VARCHAR(255),
        CONSTRAINT fk_division FOREIGN KEY (division_id) REFERENCES division (id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS post_reports (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT post_reports_postId_fkey FOREIGN KEY ("postId") REFERENCES posts ("id") ON DELETE CASCADE,
    CONSTRAINT post_reports_userId_fkey FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

-- Ensure one user can only report a post once
CREATE UNIQUE INDEX IF NOT EXISTS post_reports_userId_postId_key ON post_reports USING btree ("userId", "postId");

-- Add verification score and report count to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "verificationScore" DECIMAL(10, 2) DEFAULT 50.0 NOT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS "reportCount" INTEGER DEFAULT 0 NOT NULL;

-- Create index for faster queries on verification score
CREATE INDEX IF NOT EXISTS posts_verificationScore_idx ON posts USING btree ("verificationScore");
CREATE INDEX IF NOT EXISTS posts_reportCount_idx ON posts USING btree ("reportCount");

DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to post_reports table
ALTER TABLE post_reports 
ADD COLUMN IF NOT EXISTS "status" "ReportStatus" DEFAULT 'PENDING' NOT NULL;

-- Add reviewedBy and reviewedAt columns for admin tracking
ALTER TABLE post_reports 
ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT,
ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP WITHOUT TIME ZONE;

-- Add foreign key constraint for reviewedBy
DO $$ BEGIN
    ALTER TABLE post_reports 
    ADD CONSTRAINT post_reports_reviewedBy_fkey 
    FOREIGN KEY ("reviewedBy") REFERENCES users ("id") ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for faster queries on report status
CREATE INDEX IF NOT EXISTS post_reports_status_idx ON post_reports USING btree ("status");

-- Update existing reports to APPROVED status (migration compatibility)
UPDATE post_reports SET "status" = 'APPROVED' WHERE "status" = 'PENDING';