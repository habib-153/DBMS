# 🚀 Quick Start: Deploy to Vercel

## One-Command Deployment

```powershell
# From Server directory
./deploy-vercel.ps1
```

This script will:

1. ✅ Check if Vercel CLI is installed
2. 🏗️ Build your TypeScript project
3. 🚀 Deploy to Vercel production

---

## Manual Deployment Steps

### 1. Setup Database (5 minutes)

**Recommended: Neon (Best for Vercel)**

```powershell
# Visit https://neon.tech
# Create account → New Project → Copy connection string
```

Your connection string will look like:

```
postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 2. Install Vercel CLI

```powershell
npm install -g vercel
```

### 3. Deploy

```powershell
# Login to Vercel
vercel login

# Build project
npm run build

# Deploy to production
vercel --prod
```

### 4. Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```env
NODE_ENV=production
DB_URL=postgresql://user:pass@host:5432/dbname
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
# ... (see .env.example for all variables)
```

### 5. Run Database Migrations

```powershell
# Temporarily set production DB URL
$env:DB_URL="your_production_db_url"

# Run migrations
npm run db:push

# Or if using Prisma migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 6. Test Your API

```powershell
# Test root endpoint
curl https://your-project.vercel.app/

# Test API
curl https://your-project.vercel.app/api/v1/posts
```

---

## 🎯 Alternative: Deploy via GitHub

1. Push your code to GitHub
2. Visit https://vercel.com/new
3. Import your repository
4. Set Root Directory to `Server`
5. Add environment variables
6. Deploy!

Every push to `main` will auto-deploy.

---

## 📊 Expected Results

✅ **Build time**: ~1-2 minutes  
✅ **Deployment URL**: `https://your-project.vercel.app`  
✅ **API endpoint**: `https://your-project.vercel.app/api/v1`  
✅ **Auto-deploy**: On every git push to main

---

## ⚠️ Important Notes

### Vercel Serverless Limitations

1. **10-second timeout** on free tier (60s on Pro)
2. **Cold starts** - first request after idle is slower
3. **No persistent connections** - database pool recreated per request

### Optimization Tips

1. **Use Neon's pooling** - Enable "Pooled connection" in dashboard
2. **Add database indexes** - Speed up queries
3. **Monitor logs** - Check Vercel dashboard for errors
4. **Keep warm** - Use a cron job to ping your API every 5 minutes

---

## 🐛 Troubleshooting

### Build Fails

```powershell
# Clear cache and rebuild
rm -r node_modules dist
npm install
npm run build
```

### Database Connection Issues

- Check `DB_URL` is correct in Vercel dashboard
- Ensure SSL is enabled: `?sslmode=require` in connection string
- Verify database allows connections from Vercel IPs (most providers allow all by default)

### Function Timeout

- Optimize slow queries
- Add database indexes
- Consider upgrading to Vercel Pro (60s timeout)

### CORS Errors

Update `src/app.ts`:

```typescript
app.use(
  cors({
    origin: ['https://your-frontend.vercel.app'],
    credentials: true,
  })
);
```

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Detailed deployment steps
- Database setup guides
- Monitoring and debugging
- Alternative deployment platforms
- Security best practices

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **Deployment Guide**: See DEPLOYMENT.md in this directory

---

## ✅ Post-Deployment Checklist

- [ ] API is accessible at your Vercel URL
- [ ] Database connection works
- [ ] All environment variables are set
- [ ] CORS allows your frontend domain
- [ ] Test all main endpoints
- [ ] Update frontend API URL
- [ ] Monitor logs for errors
