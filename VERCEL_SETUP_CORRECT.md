# Vercel Deployment Setup - CORRECT VERSION

## Why Supabase?
Your app is already using Supabase for authentication. All auth routes (login, register, logout) use the Supabase SDK. The SQLite configuration was a mistake.

## Required Environment Variables for Vercel

### 1. Get your Supabase Database Password
1. Go to https://supabase.com/dashboard/project/ppypwhnxgphraleorioq/settings/database
2. Find your database password (or reset it if needed)
3. Use it in the DATABASE_URL below

### 2. Add these to Vercel Dashboard (Settings → Environment Variables):

```bash
# Supabase Configuration (ALL REQUIRED)
NEXT_PUBLIC_SUPABASE_URL="https://ppypwhnxgphraleorioq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXB3aG54Z3BocmFsZW9yaW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzcyNjQsImV4cCI6MjA3MzQ1MzI2NH0.5T4OAeH7hkYJcwrbm89IA4Wjl-KXzqeJ9wP7yc0rUCc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXB3aG54Z3BocmFsZW9yaW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg3NzI2NCwiZXhwIjoyMDczNDUzMjY0fQ.VRZbjC9UJxVS6yNwMk13Bj9avvq1spHtZ92Czdgh3wQ"

# Database URL for Prisma (REPLACE YOUR_DB_PASSWORD)
DATABASE_URL="postgresql://postgres.ppypwhnxgphraleorioq:YOUR_DB_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Application Settings
NEXTAUTH_URL="https://münchner-gastrotour.com"
JWT_SECRET="[GENERATE WITH: openssl rand -base64 32]"

# Email (Resend)
RESEND_API_KEY="re_eshqGaZj_HZasa1Ge8HD9ESCGmJRhZgXA"
EMAIL_FROM="Münchner Gastrotour <onboarding@resend.dev>"

# Admin
ADMIN_EMAIL="florian@example.com"
```

### 3. Update Prisma Schema for PostgreSQL

The Prisma schema needs to be updated from SQLite to PostgreSQL. This is already done in the latest commit.

### 4. Configure Custom Domains
1. Go to Settings → Domains in Vercel
2. Add `münchner-gastrotour.com`
3. Add `münchner-gastrotour.de`
4. Update your DNS records as instructed by Vercel

## What We're Using:

- **Database**: Supabase PostgreSQL (NOT SQLite)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Email**: Resend

## Why This Setup:
1. Your auth routes already use Supabase SDK
2. You already created Supabase tables (migrations 001-005)
3. Supabase free tier is perfect for 100 users
4. Includes automatic backups and security