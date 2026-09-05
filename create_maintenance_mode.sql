-- Singleton settings row (id is always 1)
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO maintenance_settings (id, enabled)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon/logged-out visitors) can read the status —
-- the whole app needs to know whether to show the maintenance page.
DROP POLICY IF EXISTS "Public can read maintenance status" ON maintenance_settings;
CREATE POLICY "Public can read maintenance status" ON maintenance_settings
  FOR SELECT
  USING (true);

-- Defense-in-depth backstop: even a raw PATCH straight to PostgREST
-- (bypassing the app and the RPC below) is rejected unless the
-- request's own verified JWT carries this exact email. This does NOT
-- trust anything the client sends in the request body — auth.jwt()
-- reads the token Supabase already validated for this connection.
DROP POLICY IF EXISTS "Only maintenance owner can modify settings" ON maintenance_settings;
CREATE POLICY "Only maintenance owner can modify settings" ON maintenance_settings
  FOR ALL
  USING (lower(coalesce(auth.jwt() ->> 'email', '')) = 'grfmajor7@gmail.com')
  WITH CHECK (lower(coalesce(auth.jwt() ->> 'email', '')) = 'grfmajor7@gmail.com');

GRANT SELECT ON maintenance_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON maintenance_settings TO authenticated;

-- ------------------------------------------------------------
-- Public read RPC — called on every page load, logged in or not.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_maintenance_status()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'enabled', enabled,
    'message', message,
    'updated_at', updated_at
  )
  FROM maintenance_settings
  WHERE id = 1;
$$;

GRANT EXECUTE ON FUNCTION get_maintenance_status() TO anon, authenticated;

-- ------------------------------------------------------------
-- THE ONLY SUPPORTED WRITE PATH.
-- Re-derives the caller's identity from their own authenticated
-- session (auth.jwt() ->> 'email') and explicitly rejects anyone
-- else — including admins and superadmins — with an authorization
-- error, rather than silently no-op'ing like a plain RLS filter
-- would on a raw REST call.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_maintenance_mode(p_enabled BOOLEAN, p_message TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email TEXT;
BEGIN
  caller_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  IF caller_email = '' OR caller_email <> 'grfmajor7@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: only the maintenance owner may modify this setting'
      USING ERRCODE = '42501';
  END IF;

  UPDATE maintenance_settings
  SET enabled = p_enabled,
      message = COALESCE(p_message, message),
      updated_by = auth.uid(),
      updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object('success', true, 'enabled', p_enabled);
END;
$$;

GRANT EXECUTE ON FUNCTION set_maintenance_mode(BOOLEAN, TEXT) TO authenticated;
