-- Add image_url column to events table for restaurant photos
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN events.image_url IS 'URL to restaurant/venue image (external URL or Supabase Storage)';
