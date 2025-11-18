# 🚀 Beta Launch - Quick Action Plan

## ⚡ 30-Minute Critical Path to Beta Launch

### Step 1: Verify Production Environment (5 min)
```bash
# Check health endpoint
curl https://muenchner-gastrotour-app.vercel.app/api/health | jq

# Should return: {"status": "healthy"}
# If not, check Vercel environment variables
```

**Checklist:**
- [ ] Health endpoint returns "healthy"
- [ ] All env vars set in Vercel dashboard
- [ ] Database connection working

---

### Step 2: Test User Journey (15 min)

**Test Registration:**
1. Go to: https://muenchner-gastrotour-app.vercel.app/register
2. Register with your real email
3. Check email for confirmation link
4. Click link to activate account

**Test Login:**
1. Go to: https://muenchner-gastrotour-app.vercel.app/login
2. Login with your account
3. Verify redirect works

**Test Booking:**
1. Go to: https://muenchner-gastrotour-app.vercel.app/events
2. Book an event (or create one first via API)
3. Check `/bookings` page
4. Verify email confirmation received

---

### Step 3: Create Real Event (5 min)

**Option A: Via API**
```bash
curl -X POST https://muenchner-gastrotour-app.vercel.app/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FAMI Restaurant - Authentische italienische Küche",
    "date": "2025-02-14T20:00:00Z",
    "address": "Georg-Birk-Str. 10, 80797 München",
    "maxSeats": 8,
    "description": "Gemeinsam essen gehen"
  }'
```

**Option B: Via Supabase SQL**
```sql
INSERT INTO events (name, date, address, max_seats, status)
VALUES (
  'FAMI Restaurant',
  '2025-02-14 20:00:00+00',
  'Georg-Birk-Str. 10, 80797 München',
  8,
  'upcoming'
);
```

---

### Step 4: Verify Email (5 min)
- [ ] Registration email received
- [ ] Booking confirmation email received
- [ ] Emails not in spam
- [ ] Check Resend dashboard for delivery status

---

## ✅ If All Steps Pass → READY FOR BETA!

**Next:** Invite 5-10 beta users and monitor for issues.

---

## 🆘 If Something Fails

### Health Check Fails
→ Check Vercel environment variables  
→ Verify Supabase connection

### Registration/Login Fails  
→ Check Supabase Auth settings  
→ Verify email confirmation settings

### Booking Fails
→ Check database permissions  
→ Verify RLS policies

### Emails Not Sending
→ Check Resend API key  
→ Verify FROM_EMAIL domain  
→ Check Resend dashboard

---

## 📋 Full Checklist

See `BETA_LAUNCH_READINESS.md` for complete assessment and detailed tasks.
