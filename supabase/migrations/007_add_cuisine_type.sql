-- Add cuisine_type field to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS cuisine_type TEXT;

-- Add check constraint for common cuisine types (optional, can be relaxed)
ALTER TABLE public.events
ADD CONSTRAINT cuisine_type_values CHECK (
  cuisine_type IS NULL OR
  cuisine_type IN (
    'Bavarian',
    'German',
    'Italian',
    'Asian',
    'French',
    'Mediterranean',
    'International',
    'Fusion',
    'Other'
  )
);

-- Add index for better filtering performance
CREATE INDEX IF NOT EXISTS idx_events_cuisine_type ON public.events(cuisine_type);
