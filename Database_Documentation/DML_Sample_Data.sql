-- ============================================
-- WARDEN - CRIME REPORTING PLATFORM
-- DML (Data Manipulation Language) - Sample Data
-- Database: PostgreSQL (Neon)
-- ============================================

-- ============================================
-- 1. LOCATION DATA - DIVISIONS (Bangladesh)
-- ============================================

INSERT INTO division (id, name, bn_name, url) VALUES
(1, 'Chattagram', 'চট্টগ্রাম', 'www.chittagongdiv.gov.bd'),
(2, 'Rajshahi', 'রাজশাহী', 'www.rajshahidiv.gov.bd'),
(3, 'Khulna', 'খুলনা', 'www.khulnadiv.gov.bd'),
(4, 'Barisal', 'বরিশাল', 'www.barisaldiv.gov.bd'),
(5, 'Sylhet', 'সিলেট', 'www.sylhetdiv.gov.bd'),
(6, 'Dhaka', 'ঢাকা', 'www.dhakadiv.gov.bd'),
(7, 'Rangpur', 'রংপুর', 'www.rangpurdiv.gov.bd'),
(8, 'Mymensingh', 'ময়মনসিংহ', 'www.mymensinghdiv.gov.bd');

-- ============================================
-- 2. LOCATION DATA - DISTRICTS (Sample)
-- ============================================

INSERT INTO district (id, division_id, name, bn_name, lat, lon, url) VALUES
-- Dhaka Division
(1, 6, 'Dhaka', 'ঢাকা', 23.8103, 90.4125, 'www.dhaka.gov.bd'),
(2, 6, 'Gazipur', 'গাজীপুর', 24.0022, 90.4264, 'www.gazipur.gov.bd'),
(3, 6, 'Narayanganj', 'নারায়ণগঞ্জ', 23.6238, 90.5000, 'www.narayanganj.gov.bd'),
(4, 6, 'Tangail', 'টাঙ্গাইল', 24.2513, 89.9167, 'www.tangail.gov.bd'),

-- Chattagram Division
(5, 1, 'Chattagram', 'চট্টগ্রাম', 22.3569, 91.7832, 'www.chittagong.gov.bd'),
(6, 1, 'Cox\'s Bazar', 'কক্সবাজার', 21.4272, 92.0058, 'www.coxsbazar.gov.bd'),
(7, 1, 'Comilla', 'কুমিল্লা', 23.4607, 91.1809, 'www.comilla.gov.bd'),

-- Sylhet Division
(8, 5, 'Sylhet', 'সিলেট', 24.8949, 91.8687, 'www.sylhet.gov.bd'),
(9, 5, 'Moulvibazar', 'মৌলভীবাজার', 24.3095, 91.7315, 'www.moulvibazar.gov.bd'),

-- Rajshahi Division
(10, 2, 'Rajshahi', 'রাজশাহী', 24.3745, 88.6042, 'www.rajshahi.gov.bd'),
(11, 2, 'Bogra', 'বগুড়া', 24.8465, 89.3770, 'www.bogra.gov.bd');

-- ============================================
-- 3. USER DATA
-- ============================================

-- Sample Users (Passwords are bcrypt hashed: "password123")
INSERT INTO users (
  "id", "name", "email", "password", "phone", "address", "role", "status", 
  "isVerified", "latitude", "longitude", "safeTravelMode", "notificationRadius",
  "needPasswordChange", "createdAt", "updatedAt"
) VALUES
-- Regular User 1
(
  'user_001', 
  'Md. Karim Rahman', 
  'karim.rahman@example.com', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIbRJ3I1pe',
  '+8801712345678',
  'Mirpur-10, Dhaka',
  'USER',
  'ACTIVE',
  true,
  23.8069,
  90.3686,
  false,
  1000,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),

-- Regular User 2
(
  'user_002',
  'Fatema Begum',
  'fatema.begum@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIbRJ3I1pe',
  '+8801812345679',
  'Dhanmondi, Dhaka',
  'USER',
  'ACTIVE',
  true,
  23.7461,
  90.3742,
  true,
  1500,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),

-- Admin User
(
  'admin_001',
  'Admin User',
  'admin@warden.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIbRJ3I1pe',
  '+8801912345680',
  'Gulshan-2, Dhaka',
  'ADMIN',
  'ACTIVE',
  true,
  23.7925,
  90.4078,
  false,
  2000,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),

-- Regular User 3
(
  'user_003',
  'Shakib Al Hasan',
  'shakib.hasan@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIbRJ3I1pe',
  '+8801612345681',
  'Agrabad, Chattagram',
  'USER',
  'ACTIVE',
  true,
  22.3310,
  91.8150,
  false,
  1000,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================
-- 4. USER RELATIONSHIPS - FOLLOWS
-- ============================================

INSERT INTO follows ("id", "followerId", "followingId", "createdAt") VALUES
('follow_001', 'user_001', 'user_002', CURRENT_TIMESTAMP),
('follow_002', 'user_002', 'user_001', CURRENT_TIMESTAMP),
('follow_003', 'user_001', 'user_003', CURRENT_TIMESTAMP),
('follow_004', 'user_003', 'user_001', CURRENT_TIMESTAMP);

-- ============================================
-- 5. CRIME REPORTS - POSTS
-- ============================================

INSERT INTO posts (
  "id", "title", "description", "image", "location", "district", "division",
  "latitude", "longitude", "category", "crimeDate", "status", "verificationScore",
  "aiVerificationScore", "reportCount", "authorId", "createdAt", "updatedAt"
) VALUES
-- Post 1: Theft in Mirpur
(
  'post_001',
  'Mobile Phone Snatching in Mirpur-10',
  'A person on a motorcycle snatched my phone near Mirpur-10 bus stand around 8 PM. Two people were involved. They were wearing black helmets.',
  'https://res.cloudinary.com/demo/image/upload/crime_scene_001.jpg',
  'Mirpur-10 Bus Stand, Dhaka',
  'Dhaka',
  'Dhaka',
  23.8069,
  90.3686,
  'THEFT',
  CURRENT_TIMESTAMP - INTERVAL '2 hours',
  'APPROVED',
  72.5,
  85.3,
  0,
  'user_001',
  CURRENT_TIMESTAMP - INTERVAL '1 hour',
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
),

-- Post 2: Pickpocket in Dhanmondi
(
  'post_002',
  'Pickpocketing Incident at Dhanmondi Lake',
  'My wallet was stolen while walking near Dhanmondi Lake. I noticed it missing after 10 minutes. The area was crowded during evening walk time.',
  'https://res.cloudinary.com/demo/image/upload/crime_scene_002.jpg',
  'Dhanmondi Lake, Dhaka',
  'Dhaka',
  'Dhaka',
  23.7461,
  90.3742,
  'PICKPOCKET',
  CURRENT_TIMESTAMP - INTERVAL '5 hours',
  'APPROVED',
  68.0,
  78.5,
  0,
  'user_002',
  CURRENT_TIMESTAMP - INTERVAL '4 hours',
  CURRENT_TIMESTAMP - INTERVAL '4 hours'
),

-- Post 3: Burglary in Gulshan
(
  'post_003',
  'House Burglary Attempt in Gulshan-2',
  'Attempted burglary at my house last night around 2 AM. The burglar tried to break in through the back window but fled when the alarm went off.',
  'https://res.cloudinary.com/demo/image/upload/crime_scene_003.jpg',
  'Gulshan-2, Dhaka',
  'Dhaka',
  'Dhaka',
  23.7925,
  90.4078,
  'BURGLARY',
  CURRENT_TIMESTAMP - INTERVAL '12 hours',
  'PENDING',
  55.0,
  65.2,
  0,
  'admin_001',
  CURRENT_TIMESTAMP - INTERVAL '10 hours',
  CURRENT_TIMESTAMP - INTERVAL '10 hours'
),

-- Post 4: Assault in Chattagram
(
  'post_004',
  'Physical Assault Near Agrabad',
  'Witnessed a fight that escalated into assault near Agrabad commercial area. Police arrived after 15 minutes.',
  'https://res.cloudinary.com/demo/image/upload/crime_scene_004.jpg',
  'Agrabad, Chattagram',
  'Chattagram',
  'Chattagram',
  22.3310,
  91.8150,
  'ASSAULT',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  'APPROVED',
  81.5,
  88.7,
  1,
  'user_003',
  CURRENT_TIMESTAMP - INTERVAL '20 hours',
  CURRENT_TIMESTAMP - INTERVAL '20 hours'
),

-- Post 5: Fraud
(
  'post_005',
  'Online Shopping Fraud Alert',
  'Scammed by a fake online seller on social media. Paid 5000 BDT but never received the product. Sharing details to warn others.',
  'https://res.cloudinary.com/demo/image/upload/crime_scene_005.jpg',
  'Banani, Dhaka',
  'Dhaka',
  'Dhaka',
  23.7937,
  90.4066,
  'FRAUD',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  'APPROVED',
  64.0,
  NULL,
  0,
  'user_002',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
);

-- ============================================
-- 6. COMMENTS ON POSTS
-- ============================================

INSERT INTO comments (
  "id", "content", "image", "postId", "authorId", "parentId",
  "isDeleted", "createdAt", "updatedAt"
) VALUES
-- Comments on Post 1
(
  'comment_001',
  'This is becoming too common in Mirpur area. Everyone please be careful especially during evening time.',
  NULL,
  'post_001',
  'user_002',
  NULL,
  false,
  CURRENT_TIMESTAMP - INTERVAL '50 minutes',
  CURRENT_TIMESTAMP - INTERVAL '50 minutes'
),
(
  'comment_002',
  'Did you report to the police? We should file complaints for every incident.',
  NULL,
  'post_001',
  'user_003',
  NULL,
  false,
  CURRENT_TIMESTAMP - INTERVAL '45 minutes',
  CURRENT_TIMESTAMP - INTERVAL '45 minutes'
),
(
  'comment_003',
  'Yes, I filed a GD at Mirpur Police Station. Reference number: GD-12345',
  NULL,
  'post_001',
  'user_001',
  'comment_002',
  false,
  CURRENT_TIMESTAMP - INTERVAL '40 minutes',
  CURRENT_TIMESTAMP - INTERVAL '40 minutes'
),

-- Comments on Post 2
(
  'comment_004',
  'Same thing happened to me last week near the lake. Need more police patrol in this area.',
  NULL,
  'post_002',
  'user_001',
  NULL,
  false,
  CURRENT_TIMESTAMP - INTERVAL '3 hours',
  CURRENT_TIMESTAMP - INTERVAL '3 hours'
),

-- Comments on Post 4
(
  'comment_005',
  'I was there and saw the incident. Your description is accurate. Hope the victim is okay now.',
  NULL,
  'post_004',
  'user_002',
  NULL,
  false,
  CURRENT_TIMESTAMP - INTERVAL '18 hours',
  CURRENT_TIMESTAMP - INTERVAL '18 hours'
);

-- ============================================
-- 7. VOTING ON POSTS
-- ============================================

INSERT INTO post_votes ("id", "userId", "postId", "type", "createdAt") VALUES
-- Upvotes on Post 1
('post_vote_001', 'user_002', 'post_001', 'UP', CURRENT_TIMESTAMP - INTERVAL '55 minutes'),
('post_vote_002', 'user_003', 'post_001', 'UP', CURRENT_TIMESTAMP - INTERVAL '50 minutes'),
('post_vote_003', 'admin_001', 'post_001', 'UP', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),

-- Votes on Post 2
('post_vote_004', 'user_001', 'post_002', 'UP', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('post_vote_005', 'user_003', 'post_002', 'UP', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

-- Votes on Post 4
('post_vote_006', 'user_001', 'post_004', 'UP', CURRENT_TIMESTAMP - INTERVAL '19 hours'),
('post_vote_007', 'user_002', 'post_004', 'UP', CURRENT_TIMESTAMP - INTERVAL '18 hours'),
('post_vote_008', 'admin_001', 'post_004', 'DOWN', CURRENT_TIMESTAMP - INTERVAL '17 hours'),

-- Votes on Post 5
('post_vote_009', 'user_001', 'post_005', 'UP', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('post_vote_010', 'user_003', 'post_005', 'UP', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================
-- 8. VOTING ON COMMENTS
-- ============================================

INSERT INTO comment_votes ("id", "userId", "commentId", "type", "createdAt") VALUES
('comment_vote_001', 'user_001', 'comment_001', 'UP', CURRENT_TIMESTAMP - INTERVAL '48 minutes'),
('comment_vote_002', 'user_003', 'comment_001', 'UP', CURRENT_TIMESTAMP - INTERVAL '47 minutes'),
('comment_vote_003', 'user_002', 'comment_002', 'UP', CURRENT_TIMESTAMP - INTERVAL '44 minutes'),
('comment_vote_004', 'user_001', 'comment_004', 'UP', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('comment_vote_005', 'user_003', 'comment_005', 'UP', CURRENT_TIMESTAMP - INTERVAL '17 hours');

-- ============================================
-- 9. GEOFENCE ZONES (High-Crime Areas)
-- ============================================

INSERT INTO geofence_zones (
  "id", "name", "centerLatitude", "centerLongitude", "radiusMeters",
  "crimeCount", "averageVerificationScore", "riskLevel", "district", "division",
  "isActive", "createdAt", "updatedAt"
) VALUES
-- Mirpur High-Crime Zone
(
  'geofence_001',
  'Mirpur-10 Bus Stand Area',
  23.8069,
  90.3686,
  500,
  15,
  68.5,
  'HIGH',
  'Dhaka',
  'Dhaka',
  true,
  CURRENT_TIMESTAMP - INTERVAL '30 days',
  CURRENT_TIMESTAMP
),

-- Dhanmondi Lake Area
(
  'geofence_002',
  'Dhanmondi Lake Surroundings',
  23.7461,
  90.3742,
  800,
  8,
  72.0,
  'MEDIUM',
  'Dhaka',
  'Dhaka',
  true,
  CURRENT_TIMESTAMP - INTERVAL '45 days',
  CURRENT_TIMESTAMP
),

-- Gulshan Commercial Area
(
  'geofence_003',
  'Gulshan-2 Residential',
  23.7925,
  90.4078,
  1000,
  5,
  65.0,
  'MEDIUM',
  'Dhaka',
  'Dhaka',
  true,
  CURRENT_TIMESTAMP - INTERVAL '20 days',
  CURRENT_TIMESTAMP
),

-- Chattagram High-Risk Zone
(
  'geofence_004',
  'Agrabad Commercial Zone',
  22.3310,
  91.8150,
  700,
  12,
  70.5,
  'HIGH',
  'Chattagram',
  'Chattagram',
  true,
  CURRENT_TIMESTAMP - INTERVAL '60 days',
  CURRENT_TIMESTAMP
);

-- ============================================
-- 10. USER LOCATION HISTORY
-- ============================================

INSERT INTO user_location_history (
  "id", "userId", "latitude", "longitude", "accuracy", "address",
  "activity", "geofenceZoneId", "notificationSent", "timestamp"
) VALUES
-- User 1 location tracking
(
  'location_001',
  'user_001',
  23.8069,
  90.3686,
  10.5,
  'Near Mirpur-10 Bus Stand',
  'walking',
  'geofence_001',
  true,
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
  'location_002',
  'user_001',
  23.8100,
  90.3700,
  8.2,
  'Mirpur-11',
  'driving',
  NULL,
  false,
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
),

-- User 2 location tracking
(
  'location_003',
  'user_002',
  23.7461,
  90.3742,
  12.0,
  'Dhanmondi Lake',
  'walking',
  'geofence_002',
  true,
  CURRENT_TIMESTAMP - INTERVAL '5 hours'
);

-- ============================================
-- 11. NOTIFICATIONS
-- ============================================

INSERT INTO notifications (
  "id", "userId", "type", "title", "message", "data",
  "isRead", "isPush", "createdAt"
) VALUES
-- Geofence warning for user_001
(
  'notif_001',
  'user_001',
  'GEOFENCE_WARNING',
  'High Crime Area Detected',
  'You are entering Mirpur-10 Bus Stand Area which has 15 reported crimes. Please stay alert!',
  '{"geofenceZoneId": "geofence_001", "riskLevel": "HIGH", "crimeCount": 15}',
  true,
  true,
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
),

-- Post approved notification
(
  'notif_002',
  'user_001',
  'POST_APPROVED',
  'Your Post Has Been Approved',
  'Your crime report "Mobile Phone Snatching in Mirpur-10" has been verified and approved.',
  '{"postId": "post_001"}',
  true,
  false,
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
),

-- Comment reply notification
(
  'notif_003',
  'user_003',
  'COMMENT_REPLY',
  'New Reply to Your Comment',
  'Md. Karim Rahman replied to your comment on "Mobile Phone Snatching in Mirpur-10"',
  '{"postId": "post_001", "commentId": "comment_003", "replyBy": "user_001"}',
  false,
  true,
  CURRENT_TIMESTAMP - INTERVAL '40 minutes'
),

-- Upvote notification
(
  'notif_004',
  'user_002',
  'UPVOTE',
  'Your Post Received an Upvote',
  'Your post "Pickpocketing Incident at Dhanmondi Lake" was upvoted by another user.',
  '{"postId": "post_002"}',
  false,
  false,
  CURRENT_TIMESTAMP - INTERVAL '3 hours'
),

-- Follow notification
(
  'notif_005',
  'user_002',
  'FOLLOW',
  'New Follower',
  'Md. Karim Rahman started following you.',
  '{"followerId": "user_001"}',
  true,
  false,
  CURRENT_TIMESTAMP - INTERVAL '1 day'
);

-- ============================================
-- 12. PUSH NOTIFICATION TOKENS (FCM)
-- ============================================

INSERT INTO push_notification_tokens (
  "id", "userId", "token", "platform", "isActive", "createdAt", "updatedAt"
) VALUES
(
  'token_001',
  'user_001',
  'fcm_token_abc123xyz789_user001_android',
  'ANDROID',
  true,
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP
),
(
  'token_002',
  'user_002',
  'fcm_token_def456uvw012_user002_ios',
  'IOS',
  true,
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  CURRENT_TIMESTAMP
),
(
  'token_003',
  'user_003',
  'fcm_token_ghi789rst345_user003_android',
  'ANDROID',
  true,
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP
),
(
  'token_004',
  'admin_001',
  'fcm_token_jkl012mno678_admin001_web',
  'WEB',
  true,
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  CURRENT_TIMESTAMP
);

-- ============================================
-- 13. AI ANALYSIS LOGS
-- ============================================

INSERT INTO ai_analysis_logs (
  "id", "postId", "analysisType", "model", "confidence", "predictions",
  "isCrimeRelated", "detectedObjects", "processingTime", "status", "createdAt"
) VALUES
-- Analysis for Post 1
(
  'ai_log_001',
  'post_001',
  'image_verification',
  'roboflow/crime-detection-v1',
  85.3,
  '{"crime_scene": 0.85, "street_robbery": 0.78, "motorcycle": 0.92}',
  true,
  ARRAY['motorcycle', 'person', 'street', 'night_scene'],
  1250,
  'SUCCESS',
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
),

-- Analysis for Post 2
(
  'ai_log_002',
  'post_002',
  'image_verification',
  'roboflow/crime-detection-v1',
  78.5,
  '{"crime_scene": 0.78, "crowded_area": 0.85, "lake": 0.90}',
  true,
  ARRAY['crowd', 'park', 'lake', 'pedestrians'],
  1100,
  'SUCCESS',
  CURRENT_TIMESTAMP - INTERVAL '4 hours'
),

-- Analysis for Post 3
(
  'ai_log_003',
  'post_003',
  'image_verification',
  'roboflow/crime-detection-v1',
  65.2,
  '{"crime_scene": 0.65, "residential_area": 0.88, "broken_window": 0.72}',
  true,
  ARRAY['house', 'window', 'residential_building'],
  980,
  'SUCCESS',
  CURRENT_TIMESTAMP - INTERVAL '10 hours'
),

-- Analysis for Post 4
(
  'ai_log_004',
  'post_004',
  'image_verification',
  'roboflow/crime-detection-v1',
  88.7,
  '{"crime_scene": 0.89, "assault": 0.82, "commercial_area": 0.91}',
  true,
  ARRAY['people', 'fight', 'commercial_building', 'street'],
  1320,
  'SUCCESS',
  CURRENT_TIMESTAMP - INTERVAL '20 hours'
);

-- ============================================
-- 14. USER SESSIONS
-- ============================================

INSERT INTO user_sessions (
  "id", "userId", "sessionToken", "ipAddress", "userAgent", "browser", "os", "device",
  "country", "city", "latitude", "longitude", "isActive", "lastActivity", "loginAt"
) VALUES
-- Active session for user_001
(
  'session_001',
  'user_001',
  'sess_tok_abc123xyz789def456',
  '103.15.200.15',
  'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36',
  'Chrome Mobile',
  'Android 12',
  'Samsung Galaxy S21',
  'Bangladesh',
  'Dhaka',
  23.8103,
  90.4125,
  true,
  CURRENT_TIMESTAMP - INTERVAL '10 minutes',
  CURRENT_TIMESTAMP - INTERVAL '2 hours'
),

-- Active session for user_002
(
  'session_002',
  'user_002',
  'sess_tok_uvw012ghi345jkl678',
  '103.15.201.20',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  'Safari',
  'iOS 16.0',
  'iPhone 13',
  'Bangladesh',
  'Dhaka',
  23.7461,
  90.3742,
  true,
  CURRENT_TIMESTAMP - INTERVAL '5 minutes',
  CURRENT_TIMESTAMP - INTERVAL '1 hour'
),

-- Expired session for user_001
(
  'session_003',
  'user_001',
  'sess_tok_mno901pqr234stu567',
  '103.15.202.25',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Chrome',
  'Windows 10',
  'Desktop',
  'Bangladesh',
  'Dhaka',
  23.8103,
  90.4125,
  false,
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
);

-- ============================================
-- 15. POST REPORTS (Inappropriate Content)
-- ============================================

INSERT INTO post_reports (
  "id", "postId", "userId", "reason", "description", "status",
  "reviewedBy", "reviewedAt", "createdAt"
) VALUES
-- Report on Post 4 (Assault post)
(
  'report_001',
  'post_004',
  'user_002',
  'Graphic Content',
  'The image contains disturbing violent content that may be inappropriate for some viewers.',
  'PENDING',
  NULL,
  NULL,
  CURRENT_TIMESTAMP - INTERVAL '15 hours'
);

-- ============================================
-- END OF DML SCRIPT
-- ============================================
