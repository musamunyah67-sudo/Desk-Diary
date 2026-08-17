-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.current_user_role CASCADE;
DROP FUNCTION IF EXISTS public.list_admin_users CASCADE;
DROP FUNCTION IF EXISTS public.assign_role_by_email CASCADE;
DROP FUNCTION IF EXISTS public.revoke_role_by_email CASCADE;

-- Create RPC functions with SECURITY DEFINER and proper search_path
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    u.id,
    u.email,
    ur.role,
    ur.created_at
  FROM auth.users u
  JOIN user_roles ur ON u.id = ur.user_id
  WHERE ur.role IN ('admin', 'superadmin')
  ORDER BY ur.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.assign_role_by_email(target_email TEXT, new_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  caller_role TEXT;
BEGIN
  -- Get caller's role
  SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();
  
  -- Only admins/superadmins can assign roles
  IF caller_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;
  
  -- Only superadmin can assign superadmin role
  IF new_role = 'superadmin' AND caller_role != 'superadmin' THEN
    RETURN jsonb_build_object('error', 'Only superadmin can assign superadmin role');
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  -- Assign role
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = new_role;
  
  RETURN jsonb_build_object('success', true, 'user_id', target_user_id, 'role', new_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_role_by_email(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  caller_role TEXT;
BEGIN
  -- Get caller's role
  SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();
  
  -- Only admins/superadmins can revoke roles
  IF caller_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;
  
  -- Don't allow revoking your own role
  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'Cannot revoke your own role');
  END IF;
  
  -- Revoke role (set to 'user')
  UPDATE user_roles SET role = 'user' WHERE user_id = target_user_id;
  
  RETURN jsonb_build_object('success', true, 'user_id', target_user_id);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_role_by_email(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_role_by_email(TEXT) TO authenticated;

-- Fix RLS policies for platform_settings and contact_settings
DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can manage contact settings" ON contact_settings;
CREATE POLICY "Admins can manage contact settings" ON contact_settings
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Ensure public can read platform and contact settings
DROP POLICY IF EXISTS "Public can read platform settings" ON platform_settings;
CREATE POLICY "Public can read platform settings" ON platform_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can read contact settings" ON contact_settings;
CREATE POLICY "Public can read contact settings" ON contact_settings
  FOR SELECT
  USING (true);

-- Ensure user_roles table has proper RLS
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Fix RLS policies for all content tables
-- Stories
DROP POLICY IF EXISTS "Admins can manage all content" ON stories;
CREATE POLICY "Admins can manage all content" ON stories
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- News
DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Events
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Gallery
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery;
CREATE POLICY "Admins can manage gallery" ON gallery
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Partners
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners" ON partners
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Programs
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Admins can manage programs" ON programs
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Volunteer Opportunities
DROP POLICY IF EXISTS "Admins can manage volunteer opportunities" ON volunteer_opportunities;
CREATE POLICY "Admins can manage volunteer opportunities" ON volunteer_opportunities
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Volunteer Resources
DROP POLICY IF EXISTS "Admins can manage volunteer resources" ON volunteer_resources;
CREATE POLICY "Admins can manage volunteer resources" ON volunteer_resources
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Campaigns
DROP POLICY IF EXISTS "Admins can manage campaigns" ON campaigns;
CREATE POLICY "Admins can manage campaigns" ON campaigns
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Testimonials
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Donation Methods
DROP POLICY IF EXISTS "Admins can manage donation methods" ON donation_methods;
CREATE POLICY "Admins can manage donation methods" ON donation_methods
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Sponsors
DROP POLICY IF EXISTS "Admins can manage sponsors" ON sponsors;
CREATE POLICY "Admins can manage sponsors" ON sponsors
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Supporters
DROP POLICY IF EXISTS "Admins can manage supporters" ON supporters;
CREATE POLICY "Admins can manage supporters" ON supporters
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Fix RLS policies for submission tables (inbox)
-- Contact Messages
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;
CREATE POLICY "Admins can manage contact messages" ON contact_messages
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Volunteer Applications
DROP POLICY IF EXISTS "Admins can manage volunteer applications" ON volunteer_applications;
CREATE POLICY "Admins can manage volunteer applications" ON volunteer_applications
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Partnership Inquiries
DROP POLICY IF EXISTS "Admins can manage partnership inquiries" ON partnership_inquiries;
CREATE POLICY "Admins can manage partnership inquiries" ON partnership_inquiries
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- School Submissions
DROP POLICY IF EXISTS "Admins can manage school submissions" ON school_submissions;
CREATE POLICY "Admins can manage school submissions" ON school_submissions
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));
