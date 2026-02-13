# Warden - Crime Reporting & Community Safety Platform

Full-stack platform for collaborative crime reporting with community verification, geofence-based safety warnings, and real-time analytics.

**Live:** [https://warden-dbms.vercel.app](https://warden-dbms.vercel.app)

## Team - Team Monsur Mithai

- **MD Mahidul Islam Mahi** (Team Leader) - [GitHub](https://github.com/Mitahi-1810) | [LinkedIn](https://www.linkedin.com/in/md-mahidul-islam-mahi-192759227)
- **Habibur Rahman** (Full-Stack Development) - [GitHub](https://github.com/habib-153) | [LinkedIn](https://www.linkedin.com/in/habiburrahman153/) | [Portfolio](https://habiburrahman-web.vercel.app/)
- **Faiyaz Rahman** (Research & Development) - [GitHub](https://github.com/faiyaaaz) | [LinkedIn](https://www.linkedin.com/in/faiyaz-rahman-699189210)
- **Redoan Arefin Siam** (UI/UX Design) - [GitHub](https://github.com/SIAM-SHELBY) | [LinkedIn](https://www.linkedin.com/in/siam-arefin-324b2027a)

## Key Features

- **Crime Reporting** - Multimedia reports with AI-powered image analysis (Roboflow)
- **Community Verification** - Democratic voting system for report validation
- **Location Safety** - Real-time tracking, geofence zones, and danger zone alerts
- **Crime Heatmaps** - Visual representation of crime density with Mapbox integration
- **Analytics** - Trending reports, statistics, district-wise analysis, and time-series data
- **Authentication** - OTP-based secure login with JWT tokens
- **Admin Dashboard** - Content moderation, user management, and system analytics
- **Notifications** - Real-time push notifications via Firebase Cloud Messaging

## Technology Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, HeroUI, TanStack Query, React Hook Form, Zod, Mapbox GL, Recharts, Framer Motion

**Backend:** Node.js, Express.js, TypeScript, PostgreSQL (Neon), Prisma ORM, JWT Auth, Cloudinary, Nodemailer, Firebase Admin SDK, Roboflow AI

**Deployment:** Vercel (Frontend & Backend), Neon (Database)

## Quick Start

### Prerequisites

- Node.js v18+, PostgreSQL v14+ (or Neon/Supabase), Git
- API Keys: Neon/Supabase, Cloudinary, Firebase, Mapbox

### Installation

```bash
git clone https://github.com/habib-153/DBMS.git
cd DBMS

# Install dependencies
cd Client && npm install
cd ../Server && npm install
```

### Configuration

Create `.env` in `Server/`:

```env
NODE_ENV=development
PORT=5000
DB_URL=your_postgresql_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SENDER_EMAIL=your_email@gmail.com
SENDER_APP_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
ROBOFLOW_API_KEY=your_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

Create `.env.local` in `Client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### Database Setup

```bash
cd Server
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # (Optional) Seed data
```

### Run Application

```bash
# Terminal 1 - Backend
cd Server && npm run dev  # http://localhost:5000

# Terminal 2 - Frontend
cd Client && npm run dev  # http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Troubleshooting

**Database Connection Failed:** Verify `DB_URL`, check IP whitelist in Neon/Supabase

**Push Notifications Not Working:** Verify Firebase config, check service worker registration, ensure correct VAPID key

**Maps Not Loading:** Verify Mapbox token validity and required scopes

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Next.js, Prisma, Mapbox, Firebase, Cloudinary

---

_Educational project. Ensure proper security measures for production deployment._
