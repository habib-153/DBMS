# Backend Deployment Guide - Vercel + PostgreSQL

## 📋 Prerequisites

1. A Vercel account (https://vercel.com)
2. A PostgreSQL database (see options below)
3. Git repository for your project

---

## 🗄️ Step 1: Set Up PostgreSQL Database

Choose one of these providers:

### Option A: Neon (Recommended for Vercel)

**Why?** Serverless, auto-scaling, generous free tier, instant cold starts

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy your connection string:
   ```
   postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
4. Enable "Pooled connection" in Neon dashboard for better performance

### Option B: Supabase

**Why?** Full-featured (includes auth, storage), good free tier

1. Go to https://supabase.com and create project
2. Go to Settings → Database
3. Copy "Connection string" (URI format)
4. Use the "Connection pooling" string for production

### Option C: Vercel Postgres

**Why?** Native integration with Vercel

1. In your Vercel project dashboard
2. Go to Storage → Create Database → Postgres
3. Connection string will be auto-added to your environment variables

### Option D: Railway

**Why?** Simple setup, good free tier

1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Copy the connection string from the "Connect" tab

---

## 🚀 Step 2: Deploy to Vercel

### A. Via Vercel Dashboard (Easiest)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to Vercel Dashboard**

   - Visit https://vercel.com/new
   - Import your repository
   - Select the `Server` folder as the root directory

3. **Configure Build Settings**

   - Framework Preset: `Other`
   - Root Directory: `Server` (or leave blank if deploying just the server)
   - Build Command: `npm run build` or `pnpm build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `pnpm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add all from `.env`:

   ```env
   NODE_ENV=production
   PORT=5000
   DB_URL=postgresql://user:pass@host:5432/dbname
   BCRYPT_SALT_ROUNDS=12
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_ACCESS_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_REFRESH_EXPIRES_IN=1y
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure_password
   ADMIN_PROFILE_PHOTO=https://example.com/photo.jpg
   ADMIN_MOBILE_NUMBER=+1234567890
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SENDER_EMAIL=your@email.com
   SENDER_APP_PASS=your_app_password
   CLIENT_URL=https://your-frontend.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your API will be live at `https://your-project.vercel.app`

### B. Via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to Server directory
cd c:\Projects\Hobby\DBMS\Server

# Login to Vercel
vercel login

# Deploy (first time - will ask configuration questions)
vercel

# For production deployment
vercel --prod
```

---

## 🔧 Step 3: Post-Deployment Setup

### Run Database Migrations

Since Vercel is serverless, you should run migrations locally or via a CI/CD pipeline:

**Option 1: Local Migration (Recommended)**

```powershell
# Set production DB_URL in your local .env temporarily
DB_URL=your_production_db_url

# Run migrations
npm run db:migrate

# Or push schema
npm run db:push

# Seed database (if needed)
npm run db:seed
```

**Option 2: Vercel CLI**

```powershell
# Set env var and run command on Vercel
vercel env add DB_URL production
vercel exec -- npm run db:migrate
```

### Update CORS Settings

Update `src/app.ts` to allow your frontend domain:

```typescript
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
    credentials: true,
  })
);
```

---

## 🧪 Step 4: Test Your Deployment

```powershell
# Test root endpoint
curl https://your-project.vercel.app/

# Test API endpoint
curl https://your-project.vercel.app/api/v1/posts
```

---

## 📊 Monitoring & Debugging

### View Logs

1. Go to Vercel Dashboard → Your Project
2. Click on a deployment → "Logs" tab
3. See real-time function invocations and errors

### Common Issues & Solutions

**1. Database Connection Timeout**

- **Cause**: Database is too slow or connection pool exhausted
- **Solution**: Use connection pooling (Neon, Supabase offer this)

**2. Function Timeout (10s limit on free tier)**

- **Cause**: Query takes too long
- **Solution**:
  - Optimize queries
  - Add database indexes
  - Upgrade to Vercel Pro (60s timeout)

**3. Cold Starts**

- **Cause**: Function hasn't been invoked recently
- **Solution**:
  - Use Neon (fastest cold starts)
  - Keep functions warm with cron jobs
  - Upgrade to Vercel Pro for better performance

**4. Environment Variables Not Loading**

- **Cause**: Variables not set or typo in names
- **Solution**: Double-check in Vercel Dashboard → Settings → Environment Variables

---

## 🔄 Step 5: Set Up Continuous Deployment

Every push to your main branch will auto-deploy:

1. Connect GitHub repo to Vercel (already done if deployed via dashboard)
2. Every commit to `main` → production deployment
3. Every commit to other branches → preview deployment

---

## 💰 Cost Considerations

### Vercel Free Tier Limits

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ 10-second function timeout
- ⚠️ No custom domains (use vercel.app subdomain)

### Database Free Tier Limits

- **Neon**: 3 projects, 0.5GB storage, compute shared
- **Supabase**: 500MB database, 1GB file storage
- **Vercel Postgres**: 256MB storage, 60 hours compute
- **Railway**: $5 free credit/month

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Use strong JWT secrets** (generate with `openssl rand -base64 32`)
3. **Enable SSL** for database connections (already configured)
4. **Set secure CORS origins** (update in `app.ts`)
5. **Rotate secrets regularly** in Vercel dashboard

---

## 🎯 Alternative Deployment Options

If Vercel doesn't fit your needs:

### 1. Railway (Recommended Alternative)

- Native PostgreSQL support
- No timeout limits
- Always-on containers
- Deploy: https://railway.app

### 2. Render

- Free tier with background workers
- Native PostgreSQL
- Deploy: https://render.com

### 3. Fly.io

- Run Docker containers
- PostgreSQL included
- Global edge deployment
- Deploy: https://fly.io

### 4. DigitalOcean App Platform

- Traditional VPS-like experience
- Managed PostgreSQL
- Deploy: https://www.digitalocean.com/products/app-platform

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Express to Vercel](https://vercel.com/guides/using-express-with-vercel)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created and accessible
- [ ] All environment variables added to Vercel
- [ ] Database schema migrated/pushed
- [ ] CORS origins updated for production frontend
- [ ] Test all API endpoints
- [ ] Monitor logs for errors
- [ ] Set up domain (optional, requires Vercel Pro)
- [ ] Configure frontend to use production API URL

---

Need help? Check:

- Vercel Discord: https://vercel.com/discord
- Neon Discord: https://discord.gg/neon
- Supabase Discord: https://discord.supabase.com
