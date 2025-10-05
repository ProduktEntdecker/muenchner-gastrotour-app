-- Add case-insensitive email uniqueness constraint
-- Migration: 006_email_uniqueness_constraint.sql
--
-- This ensures email uniqueness is enforced at the database level
-- regardless of case, preventing duplicate accounts with different casing

-- First, check if there are any existing duplicate emails (case-insensitive)
-- This query will help identify any issues before applying the constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT lower(email), COUNT(*)
    FROM public.profiles
    WHERE email IS NOT NULL
    GROUP BY lower(email)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate emails found (case-insensitive). Please resolve before applying this migration.';
  END IF;
END $$;

-- Create a unique index on lower(email) to enforce case-insensitive uniqueness
-- This prevents emails like 'User@example.com' and 'user@example.com' from coexisting
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_ci
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL;

-- Add a comment explaining the purpose of this index
COMMENT ON INDEX public.idx_profiles_email_ci IS 'Enforces case-insensitive email uniqueness at the database level';

-- Note: If you prefer using CITEXT type instead, you would need to:
-- 1. Enable the citext extension: CREATE EXTENSION IF NOT EXISTS citext;
-- 2. Alter the column type: ALTER TABLE profiles ALTER COLUMN email TYPE citext;
-- 3. Add unique constraint: ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
-- However, the functional index approach above is simpler and doesn't require extension installation.