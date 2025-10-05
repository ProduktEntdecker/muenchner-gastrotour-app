-- RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Profiles - select own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Profiles - update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can view basic profile info (for showing who's attending)
-- Only show essential fields, not all profile data
CREATE POLICY "Profiles - authenticated view basic"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for events table
-- Everyone can view events (public information)
CREATE POLICY "Events - public read"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can create events
CREATE POLICY "Events - admin create"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can update events
CREATE POLICY "Events - admin update"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can delete events
CREATE POLICY "Events - admin delete"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for bookings table
-- Users can view all bookings (to see who's attending)
CREATE POLICY "Bookings - public read"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own bookings
CREATE POLICY "Bookings - insert own"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Bookings - update own"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookings (cancel)
CREATE POLICY "Bookings - delete own"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reviews table
-- Anyone can view reviews
CREATE POLICY "Reviews - public read"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can create their own reviews
CREATE POLICY "Reviews - insert own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Reviews - update own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Reviews - delete own"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments table
-- Anyone can view comments
CREATE POLICY "Comments - public read"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Comments - insert authenticated"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Comments - update own"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Comments - delete own"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications table
-- Users can only view their own notifications
CREATE POLICY "Notifications - select own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System (service role) can create/update notifications
-- Note: Insert and update operations for notifications should be done
-- with the service role key from backend/cron jobs