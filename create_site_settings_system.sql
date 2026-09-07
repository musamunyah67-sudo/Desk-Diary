-- ============================================================
-- DESK DIARY SITE SETTINGS SYSTEM
-- Database Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SITE SETTINGS TABLE
-- Stores general website configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'seo', 'contact')),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- ============================================================
-- NAVIGATION ITEMS TABLE
-- Stores configurable navigation links
-- ============================================================

CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_external BOOLEAN DEFAULT false,
  open_in_new_tab BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  section TEXT NOT NULL CHECK (section IN ('primary', 'about')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_navigation_items_section ON navigation_items(section);
CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items(display_order);

-- ============================================================
-- SOCIAL MEDIA SETTINGS TABLE
-- Stores social media links and visibility
-- ============================================================

CREATE TABLE IF NOT EXISTS social_media_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('facebook', 'instagram', 'youtube', 'tiktok', 'linkedin')),
  url TEXT,
  visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- HERO CTA BUTTONS TABLE
-- Stores homepage hero call-to-action buttons
-- ============================================================

CREATE TABLE IF NOT EXISTS hero_ctas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  button_order INTEGER NOT NULL UNIQUE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STORIES TABLE - ADD story_gathered_at
-- ============================================================

ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_gathered_at DATE;

-- ============================================================
-- MEMBERS TABLE - ADD issue_date and expiry_date
-- ============================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage site settings" ON site_settings
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'superadmin')
  WITH CHECK (public.current_user_role() = 'superadmin');

CREATE POLICY "Public can read site settings" ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Navigation Items
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage navigation" ON navigation_items
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'superadmin')
  WITH CHECK (public.current_user_role() = 'superadmin');

CREATE POLICY "Public can read navigation" ON navigation_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Social Media Settings
ALTER TABLE social_media_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage social media" ON social_media_settings
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'superadmin')
  WITH CHECK (public.current_user_role() = 'superadmin');

CREATE POLICY "Public can read social media" ON social_media_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hero CTAs
ALTER TABLE hero_ctas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage hero CTAs" ON hero_ctas
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'superadmin')
  WITH CHECK (public.current_user_role() = 'superadmin');

CREATE POLICY "Public can read hero CTAs" ON hero_ctas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- INSERT DEFAULT DATA
-- ============================================================

-- Default Site Settings
INSERT INTO site_settings (key, value, category, description) VALUES
  ('site_name', '"Desk Diary"'::jsonb, 'general', 'Website name'),
  ('site_tagline', '"Your Desk. Your Story. Your Voice."'::jsonb, 'general', 'Website tagline'),
  ('meta_description', '"Documenting, celebrating, and amplifying the voices, achievements, talents, and educational experiences of students."'::jsonb, 'seo', 'Meta description for SEO')
ON CONFLICT (key) DO NOTHING;

-- Default Navigation Items - Primary
INSERT INTO navigation_items (label, url, is_external, open_in_new_tab, visible, display_order, section) VALUES
  ('Home', '/', false, false, true, 1, 'primary'),
  ('Volunteer', '/volunteer', false, false, true, 2, 'primary'),
  ('Donate', '/donate', false, false, true, 3, 'primary'),
  ('Programs', '/programs', false, false, true, 4, 'primary'),
  ('Contact', '/contact', false, false, true, 5, 'primary')
ON CONFLICT DO NOTHING;

-- Default Navigation Items - About
INSERT INTO navigation_items (label, url, is_external, open_in_new_tab, visible, display_order, section) VALUES
  ('About Us', '/about', false, false, true, 1, 'about'),
  ('Stories', '/stories', false, false, true, 2, 'about'),
  ('News', '/news', false, false, true, 3, 'about'),
  ('Events', '/events', false, false, true, 4, 'about'),
  ('Gallery', '/gallery', false, false, true, 5, 'about'),
  ('Partners', '/partners', false, false, true, 6, 'about')
ON CONFLICT DO NOTHING;

-- Default Social Media Settings
INSERT INTO social_media_settings (platform, url, visible) VALUES
  ('facebook', 'https://web.facebook.com/deskdiaryded401', true),
  ('instagram', 'https://www.instagram.com/deskdiaryded401/', true),
  ('youtube', 'https://www.youtube.com/@deskdiaryded401', true),
  ('tiktok', 'https://www.tiktok.com/@deskdiaryded401/', true),
  ('linkedin', 'https://www.linkedin.com/company/deskdiaryded401/', true)
ON CONFLICT (platform) DO NOTHING;

-- Default Hero CTAs
INSERT INTO hero_ctas (button_order, label, url, visible) VALUES
  (1, 'Explore Stories', '/stories', true),
  (2, 'Get Involved', '/volunteer', true),
  (3, 'Submit Your Story', '/contact', true)
ON CONFLICT (button_order) DO NOTHING;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get all site settings as a single object
CREATE OR REPLACE FUNCTION get_site_settings()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_object_agg(key, value)
  FROM site_settings;
$$;

GRANT EXECUTE ON FUNCTION get_site_settings() TO anon, authenticated;

-- Function to get navigation items by section
CREATE OR REPLACE FUNCTION get_navigation_items(section_param TEXT)
RETURNS TABLE (
  id UUID,
  label TEXT,
  url TEXT,
  is_external BOOLEAN,
  open_in_new_tab BOOLEAN,
  visible BOOLEAN,
  display_order INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, label, url, is_external, open_in_new_tab, visible, display_order
  FROM navigation_items
  WHERE section = section_param
  ORDER BY display_order;
$$;

GRANT EXECUTE ON FUNCTION get_navigation_items(TEXT) TO anon, authenticated;

-- Function to get social media settings
CREATE OR REPLACE FUNCTION get_social_media_settings()
RETURNS TABLE (
  platform TEXT,
  url TEXT,
  visible BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT platform, url, visible
  FROM social_media_settings
  ORDER BY platform;
$$;

GRANT EXECUTE ON FUNCTION get_social_media_settings() TO anon, authenticated;

-- Function to get hero CTAs
CREATE OR REPLACE FUNCTION get_hero_ctas()
RETURNS TABLE (
  button_order INTEGER,
  label TEXT,
  url TEXT,
  visible BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT button_order, label, url, visible
  FROM hero_ctas
  ORDER BY button_order;
$$;

GRANT EXECUTE ON FUNCTION get_hero_ctas() TO anon, authenticated;

-- ============================================================
-- DATA MIGRATION FOR EXISTING STORIES
-- Copy created_at to story_gathered_at for existing records
-- ============================================================

UPDATE stories
SET story_gathered_at = created_at::date
WHERE story_gathered_at IS NULL;

-- ============================================================
-- UPDATE verify_member FUNCTION TO CHECK EXPIRY DATE
-- ============================================================

CREATE OR REPLACE FUNCTION verify_member(verification_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  result_data JSONB;
  verification_result TEXT;
BEGIN
  -- Find member by verification token
  SELECT
    id,
    member_id,
    full_name,
    "position",
    status,
    photo_url,
    verification_active,
    issued_at,
    issue_date,
    expiry_date
  INTO member_record
  FROM members
  WHERE verification_token = verify_member.verification_token;

  -- If no member found, return invalid result
  IF member_record IS NULL THEN
    verification_result := 'invalid';
    
    INSERT INTO verification_logs (verification_token, result)
    VALUES (verify_member.verification_token, verification_result);
    
    RETURN jsonb_build_object(
      'success', false,
      'result', verification_result,
      'message', 'Verification failed'
    );
  END IF;

  -- Determine verification result with precedence
  -- 1. Check if verification is active
  IF NOT member_record.verification_active THEN
    verification_result := 'revoked';
  -- 2. Check if expired
  ELSIF member_record.expiry_date IS NOT NULL AND member_record.expiry_date < CURRENT_DATE THEN
    verification_result := 'expired';
  -- 3. Check member status
  ELSIF member_record.status = 'active' THEN
    verification_result := 'verified';
  ELSIF member_record.status = 'inactive' THEN
    verification_result := 'inactive';
  ELSIF member_record.status = 'suspended' THEN
    verification_result := 'suspended';
  ELSE
    verification_result := 'invalid';
  END IF;

  -- Log the verification attempt
  INSERT INTO verification_logs (member_id, verification_token, result)
  VALUES (member_record.id, verify_member.verification_token, verification_result);

  -- Return safe public data only
  result_data := jsonb_build_object(
    'success', true,
    'result', verification_result,
    'member_id', member_record.member_id,
    'full_name', member_record.full_name,
    'position', member_record."position",
    'status', member_record.status,
    'photo_url', member_record.photo_url,
    'issued_at', member_record.issued_at,
    'issue_date', member_record.issue_date,
    'expiry_date', member_record.expiry_date
  );

  RETURN result_data;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_member(TEXT) TO anon, authenticated;
