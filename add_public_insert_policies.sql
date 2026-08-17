-- Contact messages - anyone can submit
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
CREATE POLICY "Anyone can submit contact messages" ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Volunteer applications - anyone can submit
DROP POLICY IF EXISTS "Anyone can submit volunteer applications" ON volunteer_applications;
CREATE POLICY "Anyone can submit volunteer applications" ON volunteer_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Partnership inquiries - anyone can submit
DROP POLICY IF EXISTS "Anyone can submit partnership inquiries" ON partnership_inquiries;
CREATE POLICY "Anyone can submit partnership inquiries" ON partnership_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- School submissions - anyone can submit
DROP POLICY IF EXISTS "Anyone can submit school submissions" ON school_submissions;
CREATE POLICY "Anyone can submit school submissions" ON school_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure newsletter subscription policy exists
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add public SELECT policies for sponsors and supporters
DROP POLICY IF EXISTS "Public can read sponsors" ON sponsors;
CREATE POLICY "Public can read sponsors" ON sponsors
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read supporters" ON supporters;
CREATE POLICY "Public can read supporters" ON supporters
  FOR SELECT
  TO anon, authenticated
  USING (true);
