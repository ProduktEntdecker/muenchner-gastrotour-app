-- Performance indexes for common queries
-- Migration: 004_performance_indexes.sql
--
-- IMPORTANT: Uses CREATE INDEX CONCURRENTLY to avoid blocking production tables
-- Note: CONCURRENTLY cannot be used inside a transaction block
-- Run this migration separately if using transaction-based migration tools

-- Index on events.date for upcoming event queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date ON public.events(date);

-- Index on events.status for filtering active events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status ON public.events(status);

-- Composite index for status-based queries with date (optimized order)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status_date ON public.events(status, date);

-- Index on bookings for user queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Index on bookings for event queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);

-- Composite index for user's bookings with status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_status ON public.bookings(user_id, status);

-- Index on profiles for email lookups (already exists as UNIQUE constraint)
-- Just documenting it here for clarity

COMMENT ON INDEX public.idx_events_date IS 'Improves performance for upcoming event queries';
COMMENT ON INDEX public.idx_events_status IS 'Improves filtering by event status';
COMMENT ON INDEX public.idx_events_status_date IS 'Optimizes queries filtering by status first, then date (better cardinality)';
COMMENT ON INDEX public.idx_bookings_user_id IS 'Speeds up user booking lookups';
COMMENT ON INDEX public.idx_bookings_event_id IS 'Speeds up event attendee lookups';
COMMENT ON INDEX public.idx_bookings_user_status IS 'Optimizes user booking queries with status filtering';