# Warden - Crime Reporting and Community Safety Platform

A comprehensive full-stack platform for crime reporting, community verification, and public safety management. The system enables users to report crimes, verify reports through community voting, receive geofence-based safety warnings, and access real-time crime analytics and heatmaps.

## Overview

Warden is designed to enhance community safety through collaborative crime reporting and verification. The platform leverages location-based services, AI-powered image analysis, and real-time notifications to keep communities informed and protected.

**Live Application:** [https://warden-dbms.vercel.app](https://warden-dbms.vercel.app)

## Key Features

### Crime Reporting & Management

- **Post Crime Reports:** Users can create detailed crime reports with multimedia support (images, videos)
- **AI-Powered Image Analysis:** Automatic crime detection and categorization using Roboflow AI
- **Community Verification:** Democratic voting system where community members can verify crime reports
- **Report Status Tracking:** Track reports through pending, approved, or rejected states
- **Comment System:** Engage in discussions on crime reports with nested comments

### Location-Based Safety

- **Real-Time Location Tracking:** Captures and stores user location during sessions
- **Geofence Zones:** Automatically generated danger zones based on crime hotspots
- **Safety Warnings:** Push notifications when users enter high-crime areas
- **Location History:** Complete tracking of user movements and check-ins
- **Crime Heatmaps:** Visual representation of crime density across different areas
- **Interactive Maps:** Mapbox integration for precise location visualization

### Analytics & Insights

- **Trending Crime Reports:** Identify trending criminal activities in your area
- **Crime Statistics:** Comprehensive analytics on crime types, frequencies, and patterns
- **District-wise Analysis:** Breakdown of crimes by geographical divisions
- **Time-series Data:** Track crime trends over time
- **Verification Scores:** Average community verification scores for different zones

### User Experience

- **OTP Authentication:** Secure login with email-based OTP verification
- **User Profiles:** Customizable profiles with location preferences
- **Follow System:** Follow other users and stay updated on their reports
- **Notification System:** Real-time push notifications using Firebase Cloud Messaging
- **Session Management:** Track active sessions with device and location information
- **Responsive Design:** Mobile-first design with full desktop support

### Administration

- **Admin Dashboard:** Comprehensive control panel for moderators and super admins
- **Content Moderation:** Approve, reject, or delete inappropriate content
- **User Management:** Block/unblock users, manage roles and permissions
- **Report Management:** Review and take action on reported posts
- **System Analytics:** Monitor platform usage and engagement metrics

## Technology Stack

### Frontend

- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** HeroUI (Custom component library)
- **State Management:** TanStack React Query
- **Forms:** React Hook Form with Zod validation
- **Maps:** Mapbox GL + React Map GL
- **Charts:** Recharts, Visx
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast, Sonner
- **HTTP Client:** Nexios HTTP

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** JWT (Access + Refresh tokens)
- **File Storage:** Cloudinary
- **Email Service:** Nodemailer
- **SMS Service:** Twilio
- **Push Notifications:** Firebase Admin SDK
- **AI Integration:** Roboflow API
- **Validation:** Zod

### DevOps & Deployment

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Vercel (Serverless Functions)
- **Database:** Neon PostgreSQL
- **CI/CD:** Vercel Git Integration
- **Environment Management:** dotenv

## Project Structure

```
DBMS/
├── Client/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── (DashboardLayout)/
│   │   │   │   └── (adminDashboard)/
│   │   │   └── (WithCommonLayout)/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── config/           # Configuration files
│   │   ├── context/          # React context providers
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript type definitions
│   └── public/               # Static assets
│
├── Server/                    # Express.js backend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/      # Feature modules
│   │   │   │   ├── Auth/
│   │   │   │   ├── User/
│   │   │   │   ├── Post/
│   │   │   │   ├── Comment/
│   │   │   │   ├── Geofence/
│   │   │   │   ├── Heatmap/
│   │   │   │   ├── Analytics/
│   │   │   │   ├── Notification/
│   │   │   │   └── Admin/
│   │   │   ├── config/       # App configuration
│   │   │   ├── middlewares/  # Express middlewares
│   │   │   ├── routes/       # API routes
│   │   │   ├── utils/        # Utility functions
│   │   │   └── zod/          # Validation schemas
│   │   └── shared/           # Shared utilities
│   └── migrations/           # Database migrations
│
└── Database_Documentation/    # Database schemas and documentation
    ├── dbdiagram_schema.dbml
    ├── DDL_Complete_Schema.sql
    └── DML_Sample_Data.sql
```

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** (v14 or higher) or access to Neon/Supabase
- **Git**

### Required Accounts & API Keys

You'll need to create accounts and obtain API keys for:

1. **Neon or Supabase** - PostgreSQL database hosting
2. **Cloudinary** - Image and video storage
3. **Firebase** - Push notifications (FCM)
4. **Mapbox** - Map services
5. **Roboflow** (Optional) - AI image analysis
6. **Twilio** (Optional) - SMS notifications

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/habib-153/DBMS.git
cd DBMS
```

### 2. Install Frontend Dependencies

```bash
cd Client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../Server
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `Server` directory:

```bash
cd Server
cp .env.example .env
```

Configure the following environment variables:

```env
# Environment
NODE_ENV=development

# Server Port
PORT=5000

# Database URL (PostgreSQL)
# Example for Neon: postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
DB_URL=your_postgresql_connection_string

# Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS=12

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=1y

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
ADMIN_PROFILE_PHOTO=https://example.com/profile.jpg
ADMIN_MOBILE_NUMBER=+1234567890

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Gmail recommended)
SENDER_EMAIL=your_email@gmail.com
SENDER_APP_PASS=your_gmail_app_password

# Client URL (for password reset links)
CLIENT_URL=http://localhost:3000

# Roboflow AI Configuration (Optional)
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_MODEL=crime-detection/1

# Firebase Service Account (JSON string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Payment Gateway (Optional)
PAYMENT_URL=https://payment-gateway-url.com
STORE_ID=your_store_id
SIGNATURE_KEY=your_signature_key
PAYMENT_VERIFY_URL=https://payment-verify-url.com
```

### Frontend Environment Variables

Create a `.env.local` file in the `Client` directory:

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Google AI (Gemini) API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## Database Setup

### Option 1: Using Prisma (Recommended)

1. **Generate Prisma Client:**

```bash
cd Server
npm run db:generate
```

2. **Push schema to database:**

```bash
npm run db:push
```

3. **Run migrations:**

```bash
npm run db:migrate
```

4. **Seed the database (optional):**

```bash
npm run db:seed
```

### Option 2: Using SQL Scripts

Execute the SQL scripts in order:

```bash
# Connect to your PostgreSQL database
psql -h your_host -U your_user -d your_database

# Run DDL script
\i Database_Documentation/DDL_Complete_Schema.sql

# Run DML script (sample data)
\i Database_Documentation/DML_Sample_Data.sql
```

### View Database with Prisma Studio

```bash
cd Server
npm run db:studio
```

This will open Prisma Studio at `http://localhost:5555`

## Running the Application

### Development Mode

**Terminal 1 - Backend Server:**

```bash
cd Server
npm run dev
```

Server will start at `http://localhost:5000`

**Terminal 2 - Frontend Application:**

```bash
cd Client
npm run dev
```

Application will start at `http://localhost:3000`

### Production Build

**Backend:**

```bash
cd Server
npm run build
npm start
```

**Frontend:**

```bash
cd Client
npm run build
npm start
```

## API Documentation

The API follows RESTful conventions with the base URL: `http://localhost:5000/api/v1`

### Main API Endpoints

#### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

#### Users

- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile
- `GET /users/:id` - Get user by ID
- `GET /users/:id/posts` - Get user's posts
- `GET /users/:id/followers` - Get user's followers

#### Posts

- `GET /posts` - Get all posts (with filters)
- `POST /posts` - Create new post
- `GET /posts/:id` - Get post by ID
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/vote` - Vote on post

#### Comments

- `GET /posts/:id/comments` - Get post comments
- `POST /posts/:id/comments` - Add comment
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

#### Geofence

- `GET /geofence/zones` - Get all geofence zones
- `POST /geofence/check` - Check if location is in danger zone
- `GET /geofence/user-history` - Get user location history

#### Heatmap

- `GET /heatmap/data` - Get heatmap data points
- `GET /heatmap/district-stats` - Get district statistics

#### Analytics

- `GET /analytics/trending` - Get trending posts
- `GET /analytics/statistics` - Get crime statistics
- `GET /analytics/timeline` - Get time-series data

#### Admin

- `GET /admin/posts` - Get all posts (admin view)
- `PATCH /admin/posts/:id/approve` - Approve post
- `PATCH /admin/posts/:id/reject` - Reject post
- `GET /admin/users` - Get all users
- `PATCH /admin/users/:id/block` - Block user

## Features in Detail

### Location Tracking System

The platform implements a comprehensive location tracking system:

1. **Session Location:** Captures user location during login (GPS or IP-based fallback)
2. **Location History:** Records all location check-ins with timestamps
3. **Geofence Monitoring:** Continuously checks if users enter danger zones
4. **Safety Alerts:** Sends push notifications when entering high-crime areas

For detailed implementation, see [LOCATION_TRACKING_GUIDE.md](LOCATION_TRACKING_GUIDE.md)

### AI-Powered Image Analysis

Crime report images are automatically analyzed using Roboflow to:

- Detect potential criminal activities
- Categorize crime types
- Extract relevant metadata
- Enhance report accuracy

### Community Verification System

Reports gain credibility through community voting:

- Users can upvote or downvote reports
- Verification scores are calculated based on community consensus
- High verification scores increase report visibility
- Low scores may trigger admin review

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## Troubleshooting

### Common Issues

**Database Connection Failed:**

- Verify your `DB_URL` is correct
- Ensure your IP is whitelisted in Neon/Supabase
- Check if database is accessible from your network

**Push Notifications Not Working:**

- Verify Firebase configuration
- Check if service worker is properly registered
- Ensure VAPID key is correct

**Maps Not Loading:**

- Verify Mapbox token is valid
- Check if token has required scopes
- Ensure network requests are not blocked

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Habibur Rahman**

- GitHub: [@habib-153](https://github.com/habib-153)

## Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Mapbox for mapping services
- Firebase for push notification infrastructure
- Cloudinary for media management

---

**Note:** This is an educational project built for learning purposes. For production deployment, ensure proper security measures, rate limiting, and monitoring are in place.
