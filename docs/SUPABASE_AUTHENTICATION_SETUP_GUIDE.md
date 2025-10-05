# Supabase Authentication Setup Guide - Complete Fix

## 🎯 Purpose
This guide will fix the suspicious email issue and broken confirmation links by setting up custom SMTP with professional German email templates.

## ⚠️ Current Issues
- ❌ Emails from suspicious `*.supabase.co` domain
- ❌ Broken confirmation links (localhost:3000 vs 3001)
- ❌ Generic English email templates
- ❌ Poor user trust

## ✅ After This Guide
- ✅ Professional emails from `noreply@muenchner-gastrotour.de`
- ✅ Working confirmation links on all domains
- ✅ Beautiful German-branded email templates
- ✅ High user trust and successful onboarding

---

## Step 1: Configure Resend Domain (15 minutes)

### 1.1 Add Domain in Resend Dashboard
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `muenchner-gastrotour.de`
4. Click **Add Domain**

### 1.2 Add DNS Records at checkdomain.de
Resend will provide DNS records. Add these to your checkdomain.de DNS settings:

```
Type: CNAME
Name: resend._domainkey
Value: [provided by Resend - starts with resend1]
TTL: 3600
```

### 1.3 Verify Domain
- Wait 5-10 minutes for DNS propagation
- Click **Verify** in Resend dashboard
- Status should show ✅ **Verified**

---

## Step 2: Configure Supabase SMTP (10 minutes)

### 2.1 Access Supabase SMTP Settings
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `muenchner-gastrotour` project
3. Navigate: **Settings** → **Auth** → **SMTP Settings**

### 2.2 Enable Custom SMTP
Configure these settings:

```
Enable custom SMTP: ✅ Enabled

SMTP Settings:
- Host: smtp.resend.com
- Port: 587
- Username: resend
- Password: re_eshqGaZj_HZasa1Ge8HD9ESCGmJRhZgXA (your Resend API key)

Sender Details:
- Sender email: noreply@muenchner-gastrotour.de
- Sender name: Münchner Gastrotour

Admin email: florian@steiner.services (or your admin email)
```

### 2.3 Save Configuration
- Click **Save** to apply SMTP settings
- Test the connection (button should appear after saving)

---

## Step 3: Configure URL Settings (5 minutes)

### 3.1 Set Redirect URLs
In Supabase Dashboard → **Authentication** → **URL Configuration**:

```
Site URL: https://muenchner-gastrotour.de

Additional Redirect URLs (one per line):
http://localhost:3001/auth/confirm
https://muenchner-gastrotour.de/auth/confirm
https://www.muenchner-gastrotour.de/auth/confirm
https://nextjs-app-phi-ivory.vercel.app/auth/confirm
```

### 3.2 Save URL Settings
Click **Save** to apply URL configuration

---

## Step 4: Update Email Templates (15 minutes)

### 4.1 Access Email Templates
1. In Supabase Dashboard: **Authentication** → **Email Templates**
2. You'll see templates for: Confirm signup, Reset password, Magic link

### 4.2 Update "Confirm signup" Template

**Subject:** `Willkommen bei der Münchner Gastrotour - E-Mail bestätigen`

**Body (HTML):** Copy the content from:
`docs/email-templates/supabase-email-confirmation.html`

### 4.3 Update "Reset password" Template

**Subject:** `Neues Passwort für dein Münchner Gastrotour Konto`

**Body (HTML):** Copy the content from:
`docs/email-templates/supabase-password-reset.html`

### 4.4 Save Templates
Click **Save** for each template after updating

---

## Step 5: Update Environment Variables (2 minutes)

Your `.env` file has been updated with:

```bash
# Fixed URL configuration
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3001"

# Existing Supabase config (no changes needed)
NEXT_PUBLIC_SUPABASE_URL="https://ppypwhnxgphraleorioq.supabase.co"
# ... rest of config
```

---

## Step 6: Test the Complete Flow (10 minutes)

### 6.1 Test Registration
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3001/register`
3. Register with a **real email address** you control
4. Check that you receive the confirmation email

### 6.2 Verify Email Content
The email should now:
- ✅ Come from `noreply@muenchner-gastrotour.de` (not Supabase)
- ✅ Have professional German branding
- ✅ Contain a working confirmation link

### 6.3 Test Confirmation
1. Click the confirmation link in the email
2. Should redirect to `/auth/confirm` with success message
3. Should show countdown and redirect to homepage
4. User should be logged in automatically

### 6.4 Test Error Scenarios
- Try clicking the confirmation link twice (should show "already used")
- Wait for link to expire and test expired state

---

## Step 7: Production Deployment (5 minutes)

### 7.1 Update Production Environment
In your Vercel dashboard, update environment variables:

```bash
NEXT_PUBLIC_APP_URL="https://muenchner-gastrotour.de"
NEXTAUTH_URL="https://muenchner-gastrotour.de"
```

### 7.2 Update Production Supabase URLs
In Supabase URL Configuration, ensure production URLs are included:
- `https://muenchner-gastrotour.de/auth/confirm`
- `https://www.muenchner-gastrotour.de/auth/confirm`

---

## 🚀 Expected Results

### Email Appearance
**Before:** 
```
From: auth-noreply@ppypwhnxgphraleorioq.supabase.co
Subject: Confirm Your Signup - Confirm y...
[Generic English template]
```

**After:**
```
From: Münchner Gastrotour <noreply@muenchner-gastrotour.de>
Subject: Willkommen bei der Münchner Gastrotour - E-Mail bestätigen
[Professional German template with branding]
```

### User Experience
1. User receives professional, trustworthy email
2. Clicks confirmation link without suspicion
3. Link works correctly on first try
4. Clear success message with branding
5. Automatic login and redirect

---

## 🔧 Troubleshooting

### Email Not Received
- Check Spam/Junk folder
- Verify Resend domain is verified (green checkmark)
- Check Supabase SMTP test connection

### Confirmation Link Doesn't Work
- Verify all redirect URLs are added to Supabase
- Check browser developer tools for JavaScript errors
- Ensure ports match (3001 not 3000)

### Template Not Applying
- Clear browser cache
- Wait a few minutes for Supabase to update
- Test with incognito/private browsing

### Domain Issues
- Wait up to 24 hours for full DNS propagation
- Use DNS checker tool to verify CNAME record
- Contact checkdomain.de support if DNS issues persist

---

## 📞 Support

If you encounter any issues:
1. Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review [Resend Documentation](https://resend.com/docs)
3. Contact support:
   - Supabase: [Discord](https://discord.supabase.com)
   - Resend: [support@resend.com](mailto:support@resend.com)

---

**Total Setup Time: ~60 minutes**
**Difficulty: Intermediate**
**Impact: High - Solves major user trust and usability issues**