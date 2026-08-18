-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles table
CREATE TABLE user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feature', 'success', 'community', 'inspirational')),
  author TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('educational', 'school_updates', 'blog')),
  author TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('interviews', 'students', 'teachers', 'principals')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table
-- `featured` and `is_partner` are intentionally independent: a school can be
-- featured on the homepage/highlights without being a formal partner
-- organization, and a partner doesn't have to be featured. Contact/programs
-- fields only make sense for actual partners, but the column stays optional
-- either way since featured-only schools may not have that info.
CREATE TABLE partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  students TEXT,
  programs TEXT[],
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  is_partner BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[],
  color TEXT,
  icon TEXT,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer opportunities table
CREATE TABLE volunteer_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time_commitment TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer applications table
CREATE TABLE volunteer_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  opportunity_id UUID REFERENCES volunteer_opportunities(id),
  availability TEXT,
  skills TEXT,
  motivation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(10, 2),
  raised_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform settings table
CREATE TABLE platform_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact settings table
CREATE TABLE contact_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_published ON stories(published);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(published);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_partners_featured ON partners(featured);
CREATE INDEX idx_partners_is_partner ON partners(is_partner);
CREATE INDEX idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Row Level Security policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read published stories" ON stories FOR SELECT USING (published = true);
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (published = true);
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public can read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public can read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Public can read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public can read volunteer opportunities" ON volunteer_opportunities FOR SELECT USING (true);
CREATE POLICY "Public can read active campaigns" ON campaigns FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read platform settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Public can read contact settings" ON contact_settings FOR SELECT USING (true);

-- Admin policies (to be implemented with authentication)
CREATE POLICY "Admins can manage all content" ON stories FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage gallery" ON gallery FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage partners" ON partners FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage programs" ON programs FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage volunteer opportunities" ON volunteer_opportunities FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage volunteer applications" ON volunteer_applications FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage campaigns" ON campaigns FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage contact settings" ON contact_settings FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));

-- Public can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);

-- Insert default platform settings
INSERT INTO platform_settings (key, value) VALUES 
('statistics', '{"students_featured": "100+", "schools_partnered": "10+", "events_covered": "20+", "counties_reached": "15"}'),
('program_impacts', '{"media_clubs": "3+", "students_trained": "20+", "workshops_conducted": "4+", "mentors_engaged": "10+"}'),
('volunteer_stats', '{"active_volunteers": "20+", "hours_contributed": "2500+", "schools_supported": "10+", "students_impacted": "600+"}'),
('donate_stats', '{"students_impacted": "600+", "schools_reached": "30+", "stories_documented": "50+", "counties_covered": "15"}');

-- Insert default contact settings
INSERT INTO contact_settings (phone, whatsapp, email, address, facebook_url, instagram_url, youtube_url, tiktok_url) VALUES
('+231 770 755 152', '+231 880 986 088', 'deskdiary401@gmail.com', 'Behind Moses Blah Compound, Soul Clinic Community, Paynesville City-Liberia', 
'https://web.facebook.com/deskdiaryded401', 'https://www.instagram.com/deskdiaryded401/', 'https://www.youtube.com/@deskdiaryded401', 'https://www.tiktok.com/@deskdiaryded401/');

-- Insert default programs
INSERT INTO programs (title, description, features, color, icon, stats) VALUES
('Media Clubs', 'Establishing media clubs in schools across Liberia to train students in journalism, photography, videography, and digital storytelling.', 
ARRAY['Hands-on media training', 'School-based clubs', 'Student-led projects', 'Professional mentorship'], 
'from-primary to-blue-600', 'Users', '{"students": "50+", "clubs": "3+"}'),
('Leadership Training', 'Comprehensive leadership development programs designed to empower students with the skills and confidence to become effective leaders.', 
ARRAY['Leadership workshops', 'Public speaking training', 'Team building exercises', 'Mentorship programs'], 
'from-gold to-orange-500', 'Award', '{"trained": "20+", "sessions": "10+"}'),
('Workshops', 'Interactive workshops covering various topics including journalism, media literacy, content creation, and digital skills.', 
ARRAY['Journalism basics', 'Media literacy', 'Content creation', 'Digital skills training'], 
'from-green-500 to-emerald-600', 'Wrench', '{"workshops": "4+", "participants": "100+"}'),
('Community Engagement', 'Programs that connect students with their communities through service projects, storytelling initiatives, and collaborative events.', 
ARRAY['Community service projects', 'Storytelling initiatives', 'Collaborative events', 'Local partnerships'], 
'from-purple-500 to-indigo-600', 'Heart', '{"projects": "15+", "impact": "500+"}'),
('Mentorship', 'Connecting students with experienced professionals and mentors who provide guidance, support, and career development advice.', 
ARRAY['Professional mentors', 'Career guidance', 'Skill development', 'Networking opportunities'], 
'from-pink-500 to-rose-600', 'GraduationCap', '{"mentors": "10+", "mentees": "50+"}'),
('Volunteer Programs', 'Opportunities for individuals to contribute their time and skills to support Desk Diary''s mission and programs.', 
ARRAY['Volunteer training', 'Flexible opportunities', 'Skill-based volunteering', 'Community impact'], 
'from-teal-500 to-cyan-600', 'HandHeart', '{"volunteers": "20+", "hours": "2500+"}');

-- ============================================================
-- ADDITIONAL TABLES (added to complete admin-manageable content
-- requirements: testimonials, volunteer resources, donation
-- methods, sponsors/supporters, contact & partnership inquiries,
-- role management RPC)
-- ============================================================

-- Testimonials ("What People Say")
CREATE TABLE testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  quote TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer resources (handbook, training materials, etc.)
CREATE TABLE volunteer_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  link_label TEXT DEFAULT 'View Resource',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donation methods (Donate page)
CREATE TABLE donation_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'CreditCard',
  details TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors & Supporters (Partnerships page)
CREATE TABLE sponsors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supporters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  count TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact form submissions
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnership inquiries
CREATE TABLE partnership_inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_person TEXT,
  job_title TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  partnership_type TEXT,
  website TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- School partnership submissions (Partners > School Submission tab)
CREATE TABLE school_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  contact_email TEXT,
  phone TEXT,
  student_count TEXT,
  programs_of_interest TEXT[],
  additional_info TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_testimonials_published ON testimonials(published);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_partnership_inquiries_status ON partnership_inquiries(status);
CREATE INDEX idx_school_submissions_status ON school_submissions(status);

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for display content
CREATE POLICY "Public can read published testimonials" ON testimonials FOR SELECT USING (published = true);
CREATE POLICY "Public can read volunteer resources" ON volunteer_resources FOR SELECT USING (true);
CREATE POLICY "Public can read donation methods" ON donation_methods FOR SELECT USING (true);
CREATE POLICY "Public can read sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Public can read supporters" ON supporters FOR SELECT USING (true);

-- Public can submit (insert only) forms
CREATE POLICY "Anyone can submit a contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a partnership inquiry" ON partnership_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a school submission" ON school_submissions FOR INSERT WITH CHECK (true);

-- Admin manage policies
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage volunteer resources" ON volunteer_resources FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage donation methods" ON donation_methods FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage sponsors" ON sponsors FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage supporters" ON supporters FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage partnership inquiries" ON partnership_inquiries FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can manage school submissions" ON school_submissions FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));

-- Superadmins can view/manage all user roles; admins can view them too.
CREATE POLICY "Admins can view user roles" ON user_roles FOR SELECT USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'superadmin')));
CREATE POLICY "Superadmins can manage user roles" ON user_roles FOR ALL USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'superadmin'));

-- ------------------------------------------------------------
-- Role management RPC functions (safe to call with the anon/
-- authenticated client — they run as the DB owner via
-- SECURITY DEFINER but internally re-check the caller's own
-- role, so a non-admin can never use them to promote themself).
-- ------------------------------------------------------------

-- Look up a user's id by email (from auth.users) and list all admins/superadmins with email
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE (user_id UUID, email TEXT, role TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT ur.user_id, au.email::TEXT, ur.role, ur.created_at
    FROM user_roles ur
    JOIN auth.users au ON au.id = ur.user_id
    ORDER BY ur.created_at DESC;
END;
$$;

-- Assign (or update) a role for a user by email. Only admins/superadmins may call.
-- Only a superadmin may grant the 'superadmin' role.
CREATE OR REPLACE FUNCTION assign_role_by_email(target_email TEXT, new_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_role TEXT;
  target_user_id UUID;
BEGIN
  SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();

  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF new_role = 'superadmin' AND caller_role <> 'superadmin' THEN
    RAISE EXCEPTION 'Only a superadmin can grant the superadmin role';
  END IF;

  IF new_role NOT IN ('user', 'admin', 'superadmin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found with that email. They must sign up first.';
  END IF;

  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

  RETURN 'ok';
END;
$$;

-- Revoke a role (resets to 'user'). Only superadmins may revoke admin/superadmin roles.
CREATE OR REPLACE FUNCTION revoke_role_by_email(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  caller_role TEXT;
  target_user_id UUID;
BEGIN
  SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('admin', 'superadmin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found with that email.';
  END IF;

  UPDATE user_roles SET role = 'user', updated_at = NOW() WHERE user_id = target_user_id;
  RETURN 'ok';
END;
$$;

-- Add a unique constraint so the ON CONFLICT above works
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- ------------------------------------------------------------
-- Seed content specifically named in the requirements
-- (Admins can edit/delete all of this from the dashboard)
-- ------------------------------------------------------------

INSERT INTO partners (name, location, students, programs, image_url, featured) VALUES
('Fassah Alies School of Excellence (FASOE)', 'Liberia', NULL, ARRAY['Media Club'], NULL, true),
('AkeliaLena Resource Center (ARC)', 'Liberia', NULL, ARRAY['Media Club'], '/images/arc.jpg', true),
('ECO Technical Institute of Professional Studies', 'Liberia', NULL, ARRAY['Media Club'], '/images/eco.jpg', true);

INSERT INTO donation_methods (title, description, icon, display_order) VALUES
('Credit/Debit Card', 'Secure online payment using Visa, MasterCard, or other major cards', 'CreditCard', 1),
('Mobile Money', 'Donate via Lonestar Cell MTN, Orange, or other mobile money services', 'Smartphone', 2),
('Bank Transfer', 'Direct bank transfer to our official account', 'Building2', 3);

INSERT INTO testimonials (name, role, quote, published) VALUES
('Student Voice', 'High School Student', 'Desk Diary gave me a platform to share my story and inspire others. It''s amazing to see my journey recognized.', true);

INSERT INTO platform_settings (key, value) VALUES
('partnership_stats', '{"corporate_partners": "20+", "school_partners": "50+", "counties_reached": "15", "invested_in_education": "$50K+"}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- COMPLETE FIX: table permissions + RLS recursion + role restore
-- Safe to run any number of times. Does not delete any data.
-- ============================================================

-- 1. RESTORE TABLE-LEVEL PERMISSIONS
--    Resetting the public schema (DROP SCHEMA ... CASCADE) strips
--    the default grants Supabase normally sets up for the anon /
--    authenticated roles. Without these, EVERY query fails with
--    'permission denied for table X', regardless of RLS policies.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. RLS RECURSION FIX (re-applied in case it was lost)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view user roles" ON user_roles;
CREATE POLICY "Admins can view user roles" ON user_roles FOR SELECT USING (public.current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Superadmins can manage user roles" ON user_roles;
CREATE POLICY "Superadmins can manage user roles" ON user_roles FOR ALL USING (public.current_user_role() = 'superadmin');

DROP POLICY IF EXISTS "Admins can manage all content" ON stories;
CREATE POLICY "Admins can manage all content" ON stories FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery;
CREATE POLICY "Admins can manage gallery" ON gallery FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners" ON partners FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Admins can manage programs" ON programs FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage volunteer opportunities" ON volunteer_opportunities;
CREATE POLICY "Admins can manage volunteer opportunities" ON volunteer_opportunities FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage volunteer applications" ON volunteer_applications;
CREATE POLICY "Admins can manage volunteer applications" ON volunteer_applications FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
CREATE POLICY "Admins can manage campaigns" ON campaigns FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
CREATE POLICY "Admins can manage platform settings" ON platform_settings FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage contact settings" ON contact_settings;
CREATE POLICY "Admins can manage contact settings" ON contact_settings FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage volunteer resources" ON volunteer_resources;
CREATE POLICY "Admins can manage volunteer resources" ON volunteer_resources FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage donation methods" ON donation_methods;
CREATE POLICY "Admins can manage donation methods" ON donation_methods FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage sponsors" ON sponsors;
CREATE POLICY "Admins can manage sponsors" ON sponsors FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage supporters" ON supporters;
CREATE POLICY "Admins can manage supporters" ON supporters FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
CREATE POLICY "Admins can manage contact messages" ON contact_messages FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage partnership inquiries" ON partnership_inquiries;
CREATE POLICY "Admins can manage partnership inquiries" ON partnership_inquiries FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));
DROP POLICY IF EXISTS "Admins can manage school submissions" ON school_submissions;
CREATE POLICY "Admins can manage school submissions" ON school_submissions FOR ALL USING (public.current_user_role() IN ('admin', 'superadmin'));

-- 3. Also pin the search_path on the role-management RPC functions
--    used by the Admins & Roles tab (Supabase's security advisor
--    flags these otherwise).
ALTER FUNCTION public.list_admin_users() SET search_path = public;
ALTER FUNCTION public.assign_role_by_email(text, text) SET search_path = public;
ALTER FUNCTION public.revoke_role_by_email(text) SET search_path = public;
