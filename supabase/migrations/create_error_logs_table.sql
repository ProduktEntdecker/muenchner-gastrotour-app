-- Simple error logging table (replaces expensive Sentry)
-- FREE error tracking forever using your existing Supabase database

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  level TEXT NOT NULL DEFAULT 'error', -- error, warn, info
  message TEXT NOT NULL,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES profiles(id),
  user_email TEXT,
  component TEXT, -- which part of app threw the error
  additional_data JSONB, -- any extra context
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- Indexes for performance (much simpler than enterprise monitoring)
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved_at);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage error logs
CREATE POLICY "Admins can manage error logs" ON error_logs
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Helpful views for admin dashboard
CREATE OR REPLACE VIEW recent_errors AS
SELECT 
  id,
  created_at,
  level,
  message,
  component,
  user_email,
  url,
  resolved_at IS NOT NULL as is_resolved
FROM error_logs 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW error_summary AS
SELECT 
  DATE(created_at) as error_date,
  level,
  component,
  COUNT(*) as error_count,
  COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_count
FROM error_logs 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), level, component
ORDER BY error_date DESC, error_count DESC;

-- Comment with usage instructions
COMMENT ON TABLE error_logs IS 'Simple error logging system. Use SimpleErrorTracker.logError() to log errors. Query with SQL for analysis. Much cheaper than Sentry for hobby projects!';

-- Simple Error Logging Table
-- Free alternative to Sentry for hobby projects
-- Run this in your Supabase SQL editor

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  level VARCHAR(10) CHECK (level IN ('error', 'warning', 'info')) DEFAULT 'error',
  context JSONB,
  user_email VARCHAR(255),
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_level ON error_logs(level);
CREATE INDEX idx_error_logs_user_email ON error_logs(user_email) WHERE user_email IS NOT NULL;

-- Enable Row Level Security (but allow inserts from anon users)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert errors (for client-side error logging)
CREATE POLICY "Anyone can insert error logs" ON error_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can read error logs
CREATE POLICY "Authenticated users can read error logs" ON error_logs
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Only authenticated users can delete old logs
CREATE POLICY "Authenticated users can delete old error logs" ON error_logs
  FOR DELETE TO authenticated
  USING (created_at < CURRENT_TIMESTAMP - INTERVAL '30 days');

-- Create a view for error statistics
CREATE OR REPLACE VIEW error_stats AS
SELECT
  DATE(created_at) as date,
  level,
  COUNT(*) as count
FROM error_logs
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY DATE(created_at), level
ORDER BY date DESC, level;

-- Create a function to clean old logs (run weekly via cron)
CREATE OR REPLACE FUNCTION clean_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a simple admin view for recent errors
CREATE OR REPLACE VIEW recent_errors AS
SELECT
  id,
  message,
  level,
  context,
  user_email,
  url,
  created_at
FROM error_logs
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 100;

-- Grant permissions for the views
GRANT SELECT ON error_stats TO authenticated;
GRANT SELECT ON recent_errors TO authenticated;