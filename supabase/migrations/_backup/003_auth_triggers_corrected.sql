-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    -- Set admin flag based on secure admin check
    -- This should be set manually after user creation, not automatically
    false
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get available seats for an event
CREATE OR REPLACE FUNCTION public.get_available_seats(event_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max_seats INTEGER;
  v_host_counts BOOLEAN;
  v_confirmed_bookings INTEGER;
  v_host_booking INTEGER := 0;
BEGIN
  -- Get event details
  SELECT e.max_seats, e.host_counts_as_seat
  INTO v_max_seats, v_host_counts
  FROM public.events e
  WHERE e.id = event_id_param;

  -- If event not found, return 0
  IF v_max_seats IS NULL THEN
    RETURN 0;
  END IF;

  -- Count confirmed bookings
  SELECT COUNT(*)
  INTO v_confirmed_bookings
  FROM public.bookings b
  WHERE b.event_id = event_id_param AND b.status = 'confirmed';

  -- Check if host has a booking
  IF v_host_counts THEN
    -- Host counts as a seat, so just return available seats
    RETURN GREATEST(0, v_max_seats - v_confirmed_bookings);
  ELSE
    -- Host doesn't count as a seat
    SELECT COUNT(*)
    INTO v_host_booking
    FROM public.bookings b
    JOIN public.events e ON e.id = b.event_id
    WHERE b.event_id = event_id_param
      AND b.user_id = e.host_id
      AND b.status = 'confirmed';

    -- Subtract confirmed bookings but add back host booking if exists
    RETURN GREATEST(0, v_max_seats - (v_confirmed_bookings - v_host_booking));
  END IF;
END;
$$;

-- Function to promote from waitlist when someone cancels
CREATE OR REPLACE FUNCTION public.promote_from_waitlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_next_waitlist RECORD;
  v_available_seats INTEGER;
BEGIN
  -- Handle UPDATE (cancel) or DELETE of a confirmed booking
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    -- Continue processing for cancellation
    NULL;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    -- Continue processing for deletion
    NULL;
  ELSE
    -- No action needed for other cases
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get available seats
  v_available_seats := public.get_available_seats(OLD.event_id);

  -- If seats available, promote next person from waitlist
  IF v_available_seats > 0 THEN
    -- Find next person in waitlist with row lock to prevent race conditions
    SELECT * INTO v_next_waitlist
    FROM public.bookings
    WHERE event_id = OLD.event_id
      AND status = 'waitlist'
    ORDER BY position ASC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- Promote if someone found
    IF v_next_waitlist.id IS NOT NULL THEN
      UPDATE public.bookings
      SET status = 'confirmed',
          position = NULL,
          updated_at = NOW()
      WHERE id = v_next_waitlist.id;

      -- TODO: Trigger notification to promoted user
      -- This would be handled by a separate function or external service
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for waitlist promotion
DROP TRIGGER IF EXISTS promote_waitlist_on_cancel ON public.bookings;
CREATE TRIGGER promote_waitlist_on_cancel
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status = 'confirmed' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION public.promote_from_waitlist();

DROP TRIGGER IF EXISTS promote_waitlist_on_delete ON public.bookings;
CREATE TRIGGER promote_waitlist_on_delete
  AFTER DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_from_waitlist();

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$;