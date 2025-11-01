# Environment Setup Guide

**For Novices: How to Get Your Local Development Working**

---

## 🤔 What's the Problem?

Your local computer has **old passwords** (from October 5) that don't work anymore.
Your production server (Vercel) has the **correct passwords**.
This means:
- ✅ Production website works perfectly
- ❌ Local development is broken
- ❌ E2E tests can't run

---

## 🎯 Choose Your Solution

### ⭐ **Option A: Test Against Production (EASIEST - Recommended)**

**What:** Run tests against your live website instead of localhost
**Pros:**
- No environment setup needed
- No credential management
- Always tests the real thing
- Perfect for small hobby projects

**Cons:**
- Tests run against real data (for 60-person group, this is fine)
- Can't test features before deploying

**How to use:**
```bash
npm run test:e2e:prod
```

**When to use this:**
- You're learning and want simplicity
- Your project has few users (< 100)
- You deploy often and production is stable
- You want to verify production is working

---

### 🔧 **Option B: Fix Local Environment (TRADITIONAL)**

**What:** Update your local `.env.local` file with current passwords
**Pros:**
- Can develop and test offline
- Test features before deploying
- Standard professional workflow

**Cons:**
- Requires credential management
- Need to update when passwords change
- More complex setup

#### Step-by-Step Guide

##### 1️⃣ Get Credentials from Vercel

1. **Open browser → Go to:** https://vercel.com
2. **Log in** (if not already logged in)
3. **Find your project:**
   - Look for: `muenchner-gastrotour-app`
   - Click on it
4. **Go to Settings:**
   - Click "Settings" tab at top
   - Click "Environment Variables" in left sidebar
5. **Copy the values:**
   - Find `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click the three dots (•••) on the right
   - Click "Edit"
   - **Copy the entire value** (long string starting with `eyJ...`)
   - Click "Cancel" (we're just copying, not changing)

##### 2️⃣ Update Your Local File

**Option 2A: Use Text Editor (Easiest)**

Open in your favorite editor:
```bash
open -a TextEdit /Users/floriansteiner/Documents/GitHub/muenchner-gastrotour-app/.env.local
```

Find this line:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (old value)
```

Replace with the value you copied from Vercel:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste value from Vercel>
```

Save and close.

**Option 2B: Use Terminal (For Pros)**

```bash
cd /Users/floriansteiner/Documents/GitHub/muenchner-gastrotour-app
nano .env.local
```

- Use arrow keys to navigate
- Delete old value after the `=`
- Paste new value
- Press `Ctrl + X`, then `Y`, then `Enter`

##### 3️⃣ Verify It Works

```bash
# Start dev server
npm run dev
```

**Open another terminal:**
```bash
# Test health check
curl http://localhost:3001/api/health | jq
```

**Look for:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy (XXXms)"
  }
}
```

If you see `"status": "healthy"` → **Success!** ✅
If you see `"status": "unhealthy"` → Password is still wrong, try again

##### 4️⃣ Run E2E Tests

```bash
npm run test:e2e
```

Tests should now start successfully!

---

### 🧪 **Option C: Hybrid Approach (RECOMMENDED)**

**What:** Use production for most testing, local for active development

**When developing new features:**
1. Update `.env.local` (Option B)
2. Run local dev server: `npm run dev`
3. Manually test at `http://localhost:3001`
4. Push to GitHub → auto-deploys

**When testing:**
1. Use production tests: `npm run test:e2e:prod`
2. No local setup needed

**Best of both worlds!**

---

## 📋 Quick Reference

### Commands

```bash
# Development
npm run dev                  # Start local server (needs .env.local)

# Testing
npm run test:e2e            # Test localhost (needs .env.local)
npm run test:e2e:prod       # Test production (no setup needed) ⭐

# Health Checks
curl http://localhost:3001/api/health | jq          # Local
curl https://muenchner-gastrotour-app.vercel.app/api/health | jq  # Production
```

### Files

```
.env.local                    # Your local passwords (needs update)
.env.local.example           # Template with instructions
playwright.config.ts         # Local E2E test config
playwright.config.prod.ts    # Production E2E test config ⭐
```

---

## 🆘 Troubleshooting

### "npm run dev" fails with "Invalid API key"
→ Your `.env.local` has old credentials
→ Follow **Option B** above

### "npm run test:e2e" times out after 2 minutes
→ Your `.env.local` has old credentials
→ Use **Option A** instead: `npm run test:e2e:prod`

### "I updated .env.local but it still doesn't work"
→ Make sure you saved the file
→ Stop the dev server (`Ctrl + C`) and restart: `npm run dev`
→ Check for typos in the pasted value

### "Can I just delete .env.local and start fresh?"
→ Yes! Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
→ Then fill in values from Vercel (Option B, step 1)

---

## 🎓 Understanding Environment Variables

**What are they?**
- Passwords and API keys your app needs
- Stored in `.env.local` file locally
- Stored in Vercel dashboard for production

**Why do they get out of sync?**
- Passwords get rotated for security
- You update them in Vercel but forget locally
- Different developers have different local copies

**Best practices:**
- ⚠️ Never commit `.env.local` to git (it's in `.gitignore`)
- ⚠️ Never share these values publicly
- ✅ Store them securely (password manager)
- ✅ Update them when Vercel changes

---

## 💡 Recommendation for Your Project

For a **60-person hobby project** like Münchner Gastrotour:

**Use Option A (Test Against Production) because:**
1. ✅ Zero credential management
2. ✅ Always testing real production
3. ✅ Simpler workflow
4. ✅ Small user base = safe to test on prod
5. ✅ You deploy frequently anyway

**Only use Option B (Local Environment) if:**
- You need to develop offline (no internet)
- You want to test database changes before production
- You're learning professional dev workflows

---

## 🚀 Next Steps

1. **Try Option A first** (production testing):
   ```bash
   npm run test:e2e:prod
   ```

2. **If you need local development**, follow Option B

3. **Having trouble?** Check Troubleshooting section above

4. **Still stuck?** The production site works perfectly - you can keep developing and deploying without fixing local environment!

---

*Last updated: 2025-11-01 (Session 6)*
