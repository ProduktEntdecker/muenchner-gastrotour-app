# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Münchner Gastrotour is a dining meetup platform for a 60-person Munich group, replacing WhatsApp coordination. This is a **hobby-scale project** with zero-cost infrastructure focus.

**Key Characteristics:**
- Budget: €0/month target (uses free tiers only)
- Scale: 60 users
- Philosophy: Simplicity over enterprise patterns
- Production repository (code only) - Documentation in separate repo

## Repository Structure

This is the **production code repository**. Project documentation and planning live in a separate repository.

**Production Repo** (this repo):
- `app/` - Next.js App Router pages and API routes
- `lib/` - Shared utilities and Supabase clients
- `components/` - React components
- `tests/` - E2E tests (Playwright)

**Documentation Repo** (separate):
- Location: `~/Documents/GitHub/muenchner-gastrotour`
- Contains: Business requirements, planning, session handovers
- **IMPORTANT**: Read handover documents from there for session context

## Session Handover Documents

**Before starting work, read the latest handover:**

```bash
# Latest handover location
~/Documents/GitHub/muenchner-gastrotour/4-project-management/handovers/SESSION-*-HANDOVER.md

# Current focus
~/Documents/GitHub/muenchner-gastrotour/ONE-THING.md
```

**At end of session, update handover in documentation repo:**

```bash
cd ~/Documents/GitHub/muenchner-gastrotour
# Create/update handover file
# Update ONE-THING.md
git add . && git commit && git push
```

## Common Commands

### Development
```bash
npm run dev              # Start dev server with Turbopack (port 3001)
npm run build           # Production build
npm run start           # Run production server
npm run lint            # Run ESLint
```

### Testing
```bash
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run tests with UI
npm run test:e2e:debug  # Debug mode for tests
npm run test:e2e:report # Show test report
```

### Deployment
```bash
git add .
git commit -m "feat: description"
git push                # Auto-deploys to Vercel
```

## Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Node.js 20.x
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Styling**: Tailwind CSS
- **Testing**: Playwright for E2E
- **Deployment**: Vercel

### Key Directory Structure

```
app/                    # Next.js App Router pages
├── api/               # API routes
│   ├── auth/          # Authentication endpoints
│   ├── bookings/      # Booking management
│   ├── events/        # Event CRUD
│   └── health/        # Health check endpoint
├── admin/             # Admin panel pages
├── auth/              # Auth flow pages
├── bookings/          # User booking pages
├── events/            # Event listing/details
└── login/             # Login page
lib/                   # Shared utilities
├── supabase/          # Supabase client configs
│   ├── client.ts      # Browser client
│   ├── server.ts      # Server-side client (async)
│   └── middleware.ts  # Middleware client
├── auth.ts            # Auth utilities
├── email.ts           # Email sending (Resend)
├── validation.ts      # Input validation
├── rate-limiter.ts    # Rate limiting
└── error-tracking.ts  # Error logging to Supabase
components/            # React components
tests/e2e/             # E2E test suites
```

## Critical Implementation Details

### Supabase Client Usage

**IMPORTANT**: The server-side Supabase client is async in Next.js 15:

```typescript
// CORRECT - Server components/API routes
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()  // Note: await required
  const { data } = await supabase.from('events').select()
  return Response.json(data)
}

// CORRECT - Client components
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()  // No await
const { data } = await supabase.from('events').select()
```

### Authentication Flow

- Middleware (`middleware.ts`) checks auth state for protected routes
- Protected paths: `/bookings`, `/admin`
- Auth handled via Supabase cookies
- Rate limiting applied to auth endpoints
- Session refresh happens in middleware

### Error Tracking

**No Sentry** - Using custom Supabase-based error tracking:

```typescript
import { logError } from '@/lib/error-tracking'

try {
  // operation
} catch (error) {
  await logError(error, { context: 'operation-name' })
}
```

Errors are stored in `error_logs` table with RLS policies.

### Environment Variables

Required variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email (Resend)
RESEND_API_KEY=
FROM_EMAIL=
ADMIN_EMAIL=

# App Config
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

**IMPORTANT**: Environment variables configured in Vercel dashboard, not in code.

### Database Schema

Key tables in Supabase:
- `profiles` - User profiles (extends auth.users)
- `events` - Dining events
- `bookings` - User bookings (with waitlist support)
- `reviews` - Post-event reviews
- `error_logs` - Application errors

All tables use Row Level Security (RLS) policies.

## Development Philosophy

### Simplicity First
- No Prisma ORM - direct Supabase SDK usage
- No external monitoring (Sentry removed) - use Supabase error_logs
- No complex state management - React hooks sufficient
- No GraphQL - REST API is adequate

### Zero-Cost Priority
- Vercel free tier for hosting
- Supabase free tier (500MB database, 50K auth users)
- Resend free tier (100 emails/day)
- No paid services unless absolutely necessary

### Hobby-Scale Patterns
- Manual deployments acceptable
- Simple rate limiting (in-memory)
- No Redis/caching layer
- Direct Supabase queries (no ORM)

## Deployment

### Production URL
- **Live**: https://muenchner-gastrotour-app.vercel.app
- **Vercel Project**: muenchner-gastrotour-app

### Deployment Process
1. Push to `main` branch
2. Vercel auto-builds and deploys (~40 seconds)
3. Verify at production URL

### Health Check
```bash
curl https://muenchner-gastrotour-app.vercel.app/api/health | jq
```

## Testing Strategy

E2E tests run on port 3001 (not 3000) to avoid conflicts:

```typescript
// playwright.config.ts
baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'
```

Tests cover 5 critical user journeys:
1. Authentication flow
2. Event viewing
3. Booking creation
4. Booking cancellation
5. Waitlist management

## Current Development Focus

**See ~/Documents/GitHub/muenchner-gastrotour/ONE-THING.md for the immediate priority**

**Current Session**: Session 3
**Primary Objective**: Display events on `/events` page (TDD approach)

**Session 3 Tasks**:
1. Update `/events` page to fetch from API
2. Display event cards with details
3. Show seats available
4. Add loading/error states
5. Verify in production

## Development Workflow

### TDD Cycle (Required)
1. Write test FIRST (E2E or API test)
2. Run test → should FAIL
3. Implement minimal code to pass
4. Run test → should PASS
5. Refactor if needed
6. Commit with conventional commit message
7. Push to deploy

### Commit Standards
- Use conventional commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`
- One feature per commit
- Run build before committing: `npm run build`
- Keep commits small and focused

## Session End Checklist

**Before ending session:**

1. **Code changes** (in this repo):
   ```bash
   git add .
   git commit -m "feat: description"
   git push  # Auto-deploys
   ```

2. **Update documentation** (in docs repo):
   ```bash
   cd ~/Documents/GitHub/muenchner-gastrotour

   # Create/update session handover
   vim 4-project-management/handovers/SESSION-XX-HANDOVER.md

   # Update ONE-THING.md
   vim ONE-THING.md

   git add .
   git commit -m "docs: Session XX handover"
   git push
   ```

3. **Verify deployment**:
   ```bash
   curl https://muenchner-gastrotour-app.vercel.app/api/health | jq
   ```

## Resources

### URLs
- **Production**: https://muenchner-gastrotour-app.vercel.app
- **GitHub**: https://github.com/ProduktEntdecker/muenchner-gastrotour-app
- **Docs Repo**: ~/Documents/GitHub/muenchner-gastrotour
- **Supabase**: https://ppypwhnxgphraleorioq.supabase.co

### Key Documentation Files
**In docs repo** (`~/Documents/GitHub/muenchner-gastrotour`):
- `ONE-THING.md` - Current focus and session plan
- `CLAUDE.md` - Full project context
- `4-project-management/handovers/SESSION-*-HANDOVER.md` - Session summaries

**In this repo**:
- `README.md` - Quick start guide (if exists)
- `.env.example` - Required environment variables
- `docs/` - Technical documentation (if exists)

## Quick Start for New Session

```bash
# 1. Read context from docs repo
cat ~/Documents/GitHub/muenchner-gastrotour/ONE-THING.md
cat ~/Documents/GitHub/muenchner-gastrotour/4-project-management/handovers/SESSION-*-HANDOVER.md | tail -n 100

# 2. Pull latest code
cd ~/Documents/GitHub/muenchner-gastrotour-app
git pull origin main
npm install

# 3. Start dev server
npm run dev

# 4. Run tests to see current state
npm run test:e2e

# 5. Start working on current focus (see ONE-THING.md)
```

## Contact & Support

- Domain: muenchner-gastrotour.de
- Email: info@muenchner-gastrotour.de
- Project Type: Private hobby project
