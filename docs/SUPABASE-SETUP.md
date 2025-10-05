# Supabase Setup Guide

## Overview
This guide explains how to set up Supabase for the Münchner Gastrotour application.

## Prerequisites
- Supabase account (free tier available at https://supabase.com)
- Node.js 18+ installed
- Git repository cloned locally

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: `muenchner-gastrotour`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Frankfurt (eu-central-1) for German users
   - **Pricing Plan**: Free tier is sufficient for 60 users

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: Your Supabase URL
   - **Anon/Public Key**: Your public anonymous key
   - **Service Role Key**: Your service role key (keep this secret!)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Update admin email
ADMIN_EMAIL="your-email@example.com"
```

## Step 4: Run Database Migrations

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_auth_triggers.sql`

4. Click "Run" for each script

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - **Enable Email Confirmations**: Toggle based on preference
   - **Secure Email Change**: Enable
   - **Secure Password Recovery**: Enable

### Optional: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link

Example German template for signup confirmation:
```html
<h2>Willkommen bei Münchner Gastrotour!</h2>
<p>Bitte bestätige deine E-Mail-Adresse durch Klick auf den folgenden Link:</p>
<p><a href="{{ .ConfirmationURL }}">E-Mail-Adresse bestätigen</a></p>
```

## Step 6: Set Up First Admin User

1. Register through the app at `/register`
2. Use the email you set in `ADMIN_EMAIL`
3. In Supabase dashboard, go to **Table Editor** → **profiles**
4. Find your user and set `is_admin` to `true`

## Step 7: Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Test authentication flow:
   - Register a new account at http://localhost:3001/register
   - Check email for confirmation (if enabled)
   - Login at http://localhost:3001/login
   - Verify session at http://localhost:3001/api/auth/session

## Step 8: Production Deployment

### For Vercel Deployment:

1. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add all variables from `.env`

2. Important production settings:
   - Set `NODE_ENV=production`
   - Ensure `NEXTAUTH_URL` matches your production domain

### Security Checklist:

- [ ] Never commit `.env` file to git
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- [ ] Enable RLS (Row Level Security) on all tables
- [ ] Use environment variables for all sensitive data
- [ ] Enable 2FA on your Supabase account

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Double-check your environment variables
   - Ensure no extra spaces in keys

2. **"User not found after registration"**
   - Check if email confirmation is required
   - Verify the auth trigger is created

3. **"Cannot read properties of null"**
   - Ensure database migrations ran successfully
   - Check RLS policies are in place

4. **"CORS errors"**
   - Add your domain to Supabase allowed URLs
   - Check Authentication → URL Configuration

## Database Schema

### Core Tables:
- `profiles` - User profiles (extends auth.users)
- `events` - Dining events
- `bookings` - Event reservations
- `reviews` - Restaurant reviews
- `comments` - Event discussions
- `notifications` - Email notifications

### Key Features:
- Automatic profile creation on signup
- Row Level Security for data protection
- Seat availability calculation
- Waitlist management

## Monitoring

1. Check Supabase dashboard for:
   - **Database** → Monitor query performance
   - **Authentication** → User signups and logins
   - **Logs** → Error tracking

2. Set up alerts for:
   - Database size (free tier: 500MB)
   - API requests (free tier: unlimited)
   - Monthly active users

## Next Steps

After setup is complete:
1. Create your first event through the admin panel
2. Test the booking system
3. Configure email notifications with Resend
4. Set up regular database backups

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Project issues: GitHub repository

---

**Last Updated**: 2025-09-14
**Version**: 1.0.0