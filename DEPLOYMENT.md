# Deployment Guide - Münchner Gastrotour

## Prerequisites
- GitHub account connected to Vercel
- Supabase project created
- Domain name (muenchner-gastrotour.de or similar)
- Resend account for emails

## Step 1: Prepare Supabase Production Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project for production
3. Run the migrations in order:
   ```bash
   # Copy each migration file content to SQL Editor and run
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_auth_functions.sql
   supabase/migrations/003_auth_triggers_corrected.sql
   ```
4. Note down:
   - Project URL
   - Anon Key
   - Service Role Key

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import the GitHub repository: `ProduktEntdecker/muenchner-gastrotour`
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `2-technology/nextjs-app`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   NEXT_PUBLIC_APP_URL=https://muenchner-gastrotour.de
   RESEND_API_KEY=<your-resend-api-key>
   RESEND_FROM_EMAIL=noreply@muenchner-gastrotour.de
   ```

6. Click "Deploy"

### Option B: Via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the nextjs-app directory:
   ```bash
   cd 2-technology/nextjs-app
   vercel --prod
   ```

4. Follow the prompts to link to your Vercel project

## Step 3: Configure Custom Domain

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain: `muenchner-gastrotour.de`
4. Configure DNS at your domain registrar:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21` (Vercel's IP)

## Step 4: Configure Supabase for Production

1. In Supabase Dashboard → Authentication → URL Configuration
2. Update Site URL: `https://muenchner-gastrotour.de`
3. Add to Redirect URLs:
   - `https://muenchner-gastrotour.de/auth/callback`
   - `https://muenchner-gastrotour.de/auth/confirm`

## Step 5: Set Up Email with Resend

1. Verify your domain in Resend dashboard
2. Add DNS records as instructed by Resend
3. Update RESEND_FROM_EMAIL to use your verified domain

## Step 6: Create Test Data

1. Access your deployed app
2. Register as an admin user
3. Use Supabase Dashboard to set `is_admin = true` for your user
4. Create test events through the admin panel (once built)

## Step 7: Testing Checklist

- [ ] Homepage loads correctly
- [ ] User can register
- [ ] User receives confirmation email
- [ ] User can login
- [ ] Events page shows events
- [ ] User can book an event
- [ ] Booking appears in "My Bookings"
- [ ] User can cancel booking
- [ ] Waitlist functionality works
- [ ] Security headers are present (check DevTools)

## Monitoring & Maintenance

### Health Checks
- Vercel Dashboard: Monitor deployments and function logs
- Supabase Dashboard: Monitor database usage and auth logs
- Browser DevTools: Check for console errors

### Database Backup
- Supabase automatically backs up your database daily
- Consider setting up additional backups for critical data

### Updating the Application

1. Make changes in development
2. Push to GitHub
3. Vercel automatically deploys from main/master branch
4. Or manually trigger deployment in Vercel Dashboard

## Troubleshooting

### Common Issues

1. **"Email not confirmed" error**
   - Check Supabase email settings
   - Verify Resend configuration
   - Check spam folder

2. **"CORS error" in browser**
   - Verify NEXT_PUBLIC_APP_URL matches actual domain
   - Check Supabase allowed URLs

3. **"500 Internal Server Error"**
   - Check Vercel function logs
   - Verify all environment variables are set
   - Check Supabase connection

4. **Styles not loading**
   - Clear browser cache
   - Check build output in Vercel

## Security Notes

- Never commit `.env` files to Git
- Rotate API keys regularly
- Monitor Supabase Row Level Security policies
- Keep dependencies updated
- Review Vercel function logs for suspicious activity

## Support

For issues specific to:
- Vercel deployment: [Vercel Support](https://vercel.com/support)
- Supabase: [Supabase Support](https://supabase.com/support)
- Application bugs: Create GitHub issue

## Next Steps for Lead User Testing

1. Deploy to production following steps above
2. Create 2-3 test events with different dates
3. Share URL with 3-5 trusted lead users
4. Ask them to:
   - Register and confirm email
   - Browse events
   - Make a booking
   - Test cancellation
5. Collect feedback via form or email
6. Iterate based on feedback before full launch

---

**Last Updated**: 2025-09-15
**Deployment Status**: Ready for Production