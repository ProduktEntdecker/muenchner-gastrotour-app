# 🚀 Deploy to Production - Quick & Simple

## Why Vercel?
- **Free** for your scale (100 users)
- **Automatic** deploys from GitHub
- **Zero config** for Next.js
- **Built-in SSL** certificates
- **Global CDN** included

## Step 1: Prepare for Production (2 minutes)

### Update environment variables for production:

```bash
# Create .env.production.local
cat > .env.production.local << 'EOF'
# Database (use Vercel Postgres or Supabase for production)
DATABASE_URL="your-production-database-url"

# Authentication
JWT_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="https://muenchner-gastrotour.de"

# Email (keep using Resend)
RESEND_API_KEY="your-actual-resend-key"
EMAIL_FROM="Münchner Gastrotour <info@muenchner-gastrotour.de>"

# Admin
ADMIN_EMAIL="your-email@domain.com"
EOF
```

## Step 2: Deploy with Vercel CLI (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (answer the prompts)
vercel

# Questions you'll be asked:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? muenchner-gastrotour
# - Directory? ./
# - Override settings? No
```

## Step 3: Configure Custom Domains (3 minutes)

### In Vercel Dashboard:
1. Go to your project → Settings → Domains
2. Add your domains:
   - `muenchner-gastrotour.de`
   - `www.muenchner-gastrotour.de`
   - `muenchner-gastrotour.com`
   - `www.muenchner-gastrotour.com`

### Update your DNS:

**For .de domain (primary):**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

**For .com domain (redirect to .de):**
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

## Step 4: Set Environment Variables in Vercel

```bash
# Option 1: Via CLI
vercel env add JWT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
vercel env add ADMIN_EMAIL production

# Option 2: Via Dashboard
# Go to Project → Settings → Environment Variables
# Add each variable for "Production" environment
```

## Step 5: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Your site will be live at:
# https://muenchner-gastrotour.de
```

## Alternative: GitHub Auto-Deploy (Even Simpler!)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Click "Deploy"
6. Add custom domains in dashboard

**That's it! Every push to `main` will auto-deploy!**

## Production Database Options

### Option A: Vercel Postgres (Recommended)
```bash
# In Vercel dashboard → Storage → Create Database
# Choose Postgres
# It will auto-set DATABASE_URL
```

### Option B: Supabase (Free tier)
```bash
# Use existing Supabase setup
# Just update DATABASE_URL in Vercel env vars
```

### Option C: SQLite with Vercel (Simple but limited)
```bash
# Works but data resets on each deploy
# Only for testing!
```

## Quick Deployment Script

```bash
# Save this as deploy.sh
#!/bin/bash

echo "🚀 Deploying to production..."

# Build locally first to catch errors
npm run build || exit 1

# Deploy to Vercel
vercel --prod

echo "✅ Deployed! Check https://muenchner-gastrotour.de"
```

## Monitoring Your Live Site

### Simple Health Check
```bash
# Add to crontab for monitoring
*/5 * * * * curl -f https://muenchner-gastrotour.de/api/health || echo "Site down!" | mail -s "Alert" admin@domain.com
```

### Free Monitoring Services
- **UptimeRobot**: 5-minute checks, free
- **Cronitor**: 1-minute checks, free tier
- **Better Uptime**: Status page included

## Costs for Your Scale

**Monthly costs:**
- Vercel: **€0** (free tier covers you)
- Domain: **€1-2** (already owned)
- Database: **€0** (Vercel Postgres free tier)
- Email: **€0** (Resend free tier: 100/day)
- **Total: €0-2/month**

## SSL Certificates

**Automatic!** Vercel handles everything:
- Auto-provisioned from Let's Encrypt
- Auto-renewed
- Works with custom domains
- Zero configuration

## Performance at Your Scale

**What Vercel gives you for free:**
- 100 GB bandwidth (you'll use <1 GB)
- Unlimited requests (you'll have <1000/month)
- 10 second timeout (plenty for 100 users)
- Global CDN (overkill but nice!)

## Troubleshooting

**Domain not working?**
- Wait 5-10 minutes for DNS propagation
- Check: `dig muenchner-gastrotour.de`

**Build failing?**
```bash
# Test locally first
npm run build
npm start
```

**Environment variables not working?**
- Check Vercel dashboard → Settings → Environment Variables
- Redeploy after adding: `vercel --prod`

## Done! 🎉

Your site is now live at:
- https://muenchner-gastrotour.de
- https://www.muenchner-gastrotour.de

**Total deployment time: ~10 minutes**