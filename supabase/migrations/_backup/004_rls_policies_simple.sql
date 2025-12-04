-- Simple RLS Policies for MVP

-- Profiles: Users can see all profiles and edit their own
CREATE POLICY "Profiles - view all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Profiles - update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Events: Everyone can view, only admins can modify
CREATE POLICY "Events - view all"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Events - admin insert"
  ON public.events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Events - admin update"
  ON public.events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Bookings: View all, users manage their own
CREATE POLICY "Bookings - view all"
  ON public.bookings FOR SELECT
  USING (true);

CREATE POLICY "Bookings - create own"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Bookings - update own"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Bookings - delete own"
  ON public.bookings FOR DELETE
  USING (auth.uid() = user_id);