-- Secure admin setup migration
-- This file contains functions to securely manage admin privileges

-- Function to safely set admin privileges (can only be called by service role)
CREATE OR REPLACE FUNCTION public.set_admin_privileges(user_email TEXT, is_admin_flag BOOLEAN DEFAULT true)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_current_role TEXT;
BEGIN
  -- Check if the caller has service role privileges
  SELECT current_setting('role', true) INTO v_current_role;

  -- Only service role can execute this function
  IF v_current_role != 'service_role' THEN
    RAISE EXCEPTION 'Insufficient privileges to set admin status';
  END IF;

  -- Find user by email
  SELECT p.id INTO v_user_id
  FROM public.profiles p
  WHERE LOWER(p.email) = LOWER(user_email);

  -- If user not found, return false
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update admin status
  UPDATE public.profiles
  SET is_admin = is_admin_flag,
      updated_at = NOW()
  WHERE id = v_user_id;

  -- Log the admin change (you might want to create an audit table)
  INSERT INTO public.admin_log (user_id, action, performed_at)
  VALUES (v_user_id,
          CASE WHEN is_admin_flag THEN 'GRANT_ADMIN' ELSE 'REVOKE_ADMIN' END,
          NOW());

  RETURN true;
END;
$$;

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('GRANT_ADMIN', 'REVOKE_ADMIN')),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  performed_by TEXT DEFAULT current_setting('role', true)
);

-- Enable RLS on admin log
ALTER TABLE public.admin_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin log
CREATE POLICY "Admin log - service role only"
  ON public.admin_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to safely check admin status (public but secure)
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_admin BOOLEAN := false;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM public.profiles
  WHERE id = user_id_param;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Create index for admin log performance
CREATE INDEX IF NOT EXISTS idx_admin_log_user_id ON public.admin_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_performed_at ON public.admin_log(performed_at);

-- Add a comment with instructions
COMMENT ON FUNCTION public.set_admin_privileges IS 'Use this function to safely set admin privileges. Example: SELECT public.set_admin_privileges(''admin@example.com'', true);';