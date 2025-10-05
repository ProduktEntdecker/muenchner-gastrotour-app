-- Add case-insensitive email uniqueness constraint
-- Migration: 005_email_uniqueness.sql
--
-- Ensures emails are unique regardless of case to prevent duplicate accounts

-- Create a unique index on lower-cased email for case-insensitive uniqueness
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_lower
ON public.profiles(LOWER(email));

-- Add comment for documentation
COMMENT ON INDEX public.idx_profiles_email_lower IS 'Ensures case-insensitive email uniqueness to prevent duplicate accounts with different casing';

-- Note: The existing UNIQUE constraint on email column can be kept for additional safety,
-- but this new index will prevent issues like "User@example.com" and "user@example.com"
-- being treated as different emails