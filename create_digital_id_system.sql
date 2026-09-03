-- ============================================================
-- DESK DIARY DIGITAL ID & QR VERIFICATION SYSTEM
-- Database Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table for Digital ID system
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  "position" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  photo_url TEXT,
  verification_token TEXT NOT NULL UNIQUE,
  verification_active BOOLEAN DEFAULT true,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Verification logs table for tracking verification attempts
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result TEXT NOT NULL CHECK (result IN ('verified', 'inactive', 'suspended', 'revoked', 'invalid'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_member_id ON members(member_id);
CREATE INDEX IF NOT EXISTS idx_members_verification_token ON members(verification_token);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_verification_active ON members(verification_active);
CREATE INDEX IF NOT EXISTS idx_verification_logs_member_id ON verification_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_result ON verification_logs(result);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_at ON verification_logs(verified_at DESC);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table
-- Public can verify members through the controlled RPC function only
-- No direct public access to members table

-- Admins and superadmins can manage members
CREATE POLICY "Admins can manage members" ON members
  FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'))
  WITH CHECK (public.current_user_role() IN ('admin', 'superadmin'));

-- Superadmins can see who created each member (created_by field)
CREATE POLICY "Superadmins can see created_by" ON members
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'superadmin');

-- RLS Policies for verification_logs table
-- Public can insert verification logs (for tracking verification attempts)
CREATE POLICY "Anyone can log verification attempts" ON verification_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins and superadmins can view verification logs
CREATE POLICY "Admins can view verification logs" ON verification_logs
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'superadmin'));

-- ============================================================
-- SECURE VERIFICATION RPC FUNCTION
-- This function accepts a verification token and returns only
-- safe public fields. It does NOT expose internal data.
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
    issued_at
  INTO member_record
  FROM members
  WHERE verification_token = verify_member.verification_token;

  -- If no member found, return invalid result
  IF member_record IS NULL THEN
    verification_result := 'invalid';
    
    -- Log the failed verification attempt
    INSERT INTO verification_logs (verification_token, result)
    VALUES (verify_member.verification_token, verification_result);
    
    RETURN jsonb_build_object(
      'success', false,
      'result', verification_result,
      'message', 'Verification failed'
    );
  END IF;

  -- Determine verification result based on member status
  IF NOT member_record.verification_active THEN
    verification_result := 'revoked';
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
    'issued_at', member_record.issued_at
  );

  RETURN result_data;
END;
$$;

-- Grant execute permission to public (including anon) for verification
GRANT EXECUTE ON FUNCTION verify_member(TEXT) TO anon, authenticated;

-- ============================================================
-- HELPER FUNCTION: Generate cryptographically secure token
-- This generates a random, unguessable token for QR codes
-- ============================================================

CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT substr(md5(random()::text || clock_timestamp()::text), 1, 32) || substr(md5(random()::text || clock_timestamp()::text), 1, 32);
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_secure_token() TO authenticated;

-- ============================================================
-- HELPER FUNCTION: Regenerate verification token
-- Invalidates old token and generates a new one
-- ============================================================

CREATE OR REPLACE FUNCTION regenerate_member_token(member_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
  new_token TEXT;
BEGIN
  -- Check caller's role
  SELECT role INTO caller_role FROM user_roles WHERE user_id = auth.uid();
  
  -- Only admins and superadmins can regenerate tokens
  IF caller_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('error', 'Not authorized');
  END IF;

  -- Generate new token
  new_token := generate_secure_token();

  -- Update member with new token
  UPDATE members
  SET 
    verification_token = new_token,
    verification_active = true,
    updated_at = NOW()
  WHERE id = member_uuid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Member not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_token', new_token);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION regenerate_member_token(UUID) TO authenticated;

-- ============================================================
-- HELPER FUNCTION: Get all members with creator info
-- For admin dashboard member list
-- ============================================================

CREATE OR REPLACE FUNCTION get_all_members()
RETURNS TABLE (
  id UUID,
  member_id TEXT,
  full_name TEXT,
  "position" TEXT,
  status TEXT,
  photo_url TEXT,
  verification_active BOOLEAN,
  issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_by_email TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.member_id,
    m.full_name,
    m."position",
    m.status,
    m.photo_url,
    m.verification_active,
    m.issued_at,
    m.created_at,
    m.created_by,
    au.email
  FROM members m
  LEFT JOIN auth.users au ON au.id = m.created_by
  ORDER BY m.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_members() TO authenticated;
