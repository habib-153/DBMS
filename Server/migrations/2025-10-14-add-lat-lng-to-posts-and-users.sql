-- Migration: add latitude and longitude columns to posts and users
-- Run this on your database (development first). Make a backup before running on production.
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Optionally, populate coordinates for existing rows where you have textual location data by running an update with known mappings.
-- Example (do not run unless you have a mapping table):
-- UPDATE posts SET latitude = d.latitude, longitude = d.longitude FROM district_coords d WHERE posts.district = d.id;
COMMIT;