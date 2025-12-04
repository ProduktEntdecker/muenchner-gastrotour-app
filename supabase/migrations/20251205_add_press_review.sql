-- Add press_review column to events table for restaurant press reviews/quotes
ALTER TABLE events ADD COLUMN IF NOT EXISTS press_review TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS press_source TEXT;

-- Add comments for documentation
COMMENT ON COLUMN events.press_review IS 'Quote or review excerpt from press/media about the restaurant';
COMMENT ON COLUMN events.press_source IS 'Source of the press review (e.g. "Süddeutsche Zeitung", "München.de")';
