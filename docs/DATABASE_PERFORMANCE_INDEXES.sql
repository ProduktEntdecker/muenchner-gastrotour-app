-- Database Performance Indexes
-- Run these in your Supabase SQL Editor for production optimization
-- These indexes prevent slow queries as your data grows

-- ========================================
-- CRITICAL INDEXES FOR PERFORMANCE
-- ========================================

-- 1. Events table indexes (most important for your app)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date 
ON events(event_date) 
WHERE event_date >= CURRENT_DATE;
-- Speeds up "upcoming events" queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_date 
ON events(status, event_date) 
WHERE status = 'published' AND event_date >= CURRENT_DATE;
-- Optimizes main events listing page

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_restaurant 
ON events(restaurant_name);
-- Fast restaurant-based filtering

-- 2. Bookings table indexes (revenue-critical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_event_id 
ON bookings(event_id);
-- Fast lookup of bookings per event

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_email 
ON bookings(email);
-- User booking history queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status 
ON bookings(status);
-- Filter confirmed/pending bookings

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at DESC);
-- Recent bookings admin view

-- 3. Profiles table indexes (authentication)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email 
ON profiles(email);
-- Fast user lookups (if not already unique)

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at 
ON profiles(created_at DESC);
-- User registration analytics

-- 4. Comments/Reviews indexes (if you have these tables)
-- Adjust table names based on your schema
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_event_id
ON comments(event_id)
WHERE event_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_restaurant
ON reviews(restaurant_name)
WHERE restaurant_name IS NOT NULL;

-- ========================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ========================================

-- Events with availability (booking count vs max_seats)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_availability 
ON events(event_date, max_seats) 
WHERE status = 'published' AND event_date >= CURRENT_DATE;

-- User booking history with status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_bookings 
ON bookings(email, status, created_at DESC);

-- Admin dashboard: recent events by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_events 
ON events(status, created_at DESC, event_date);

-- ========================================
-- PERFORMANCE ANALYSIS QUERIES
-- ========================================

-- Use these to monitor your database performance:

-- 1. Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- 2. Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100  -- queries taking more than 100ms
ORDER BY mean_time DESC
LIMIT 10;

-- 3. Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- MAINTENANCE COMMANDS
-- ========================================

-- Run these periodically for optimal performance:

-- Update table statistics (run weekly)
ANALYZE events;
ANALYZE bookings;
ANALYZE profiles;

-- Reindex tables (run monthly if heavily updated)
-- REINDEX TABLE events;
-- REINDEX TABLE bookings;

-- ========================================
-- PERFORMANCE MONITORING SETUP
-- ========================================

-- Enable query performance tracking (if not already enabled)
-- This requires superuser privileges - ask Supabase support to enable
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ========================================
-- NOTES FOR PRODUCTION
-- ========================================

/*
IMPORTANT PERFORMANCE TIPS:

1. **Always use CONCURRENTLY** when creating indexes on production
   - Prevents table locking during index creation
   - Takes longer but doesn't block your app

2. **Monitor index effectiveness**
   - Unused indexes waste space and slow writes
   - Use the performance analysis queries above

3. **Composite index order matters**
   - Most selective column first
   - Query pattern determines optimal order

4. **Partial indexes save space**
   - Only index rows you actually query
   - E.g., only future events, only published content

5. **Regular maintenance prevents performance degradation**
   - ANALYZE updates statistics for query planner
   - VACUUM reclaims space from deleted rows

DEPLOYMENT STRATEGY:
1. Create indexes during low-traffic periods
2. Monitor query performance before/after
3. Remove unused indexes that don't improve performance
4. Set up alerts for slow queries (>500ms)
*/