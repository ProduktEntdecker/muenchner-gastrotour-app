# Vercel Environment Variables Setup

## Required Environment Variables

Copy these to your Vercel project settings:

```bash
# Database
DATABASE_URL="file:./gastro.db"

# Authentication
JWT_SECRET="[GENERATE_NEW_SECRET_FOR_PRODUCTION]"
NEXTAUTH_URL="https://münchner-gastrotour.com"

# Email (Resend)
RESEND_API_KEY="re_eshqGaZj_HZasa1Ge8HD9ESCGmJRhZgXA"
EMAIL_FROM="Münchner Gastrotour <onboarding@resend.dev>"

# Admin
ADMIN_EMAIL="florian@example.com"

# Supabase (Optional - not currently used)
NEXT_PUBLIC_SUPABASE_URL="https://ppypwhnxgphraleorioq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXB3aG54Z3BocmFsZW9yaW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzcyNjQsImV4cCI6MjA3MzQ1MzI2NH0.5T4OAeH7hkYJcwrbm89IA4Wjl-KXzqeJ9wP7yc0rUCc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweXB3aG54Z3BocmFsZW9yaW9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg3NzI2NCwiZXhwIjoyMDczNDUzMjY0fQ.VRZbjC9UJxVS6yNwMk13Bj9avvq1spHtZ92Czdgh3wQ"
```

## Setup Instructions

1. Go to your Vercel dashboard
2. Select the "muenchner-gastrotour" project
3. Navigate to Settings → Environment Variables
4. Add each variable above
5. **IMPORTANT**: Generate a new JWT_SECRET for production:
   ```bash
   openssl rand -base64 32
   ```
6. Update NEXTAUTH_URL to match your actual domain
7. Update ADMIN_EMAIL to your actual email

## Note on Middleware

The middleware has been simplified to remove Supabase dependencies for now.
Once environment variables are properly set in Vercel, you can restore the full middleware by:
1. Renaming `middleware-with-supabase.ts` back to `middleware.ts`
2. Ensuring all Supabase environment variables are set in Vercel