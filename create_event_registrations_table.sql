-- Create event_registrations table for storing event registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID,
  event_title TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  school TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow admins to read all registrations
CREATE POLICY "Admins can view all event registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to insert registrations (for manual additions if needed)
CREATE POLICY "Admins can insert event registrations"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to update registrations
CREATE POLICY "Admins can update event registrations"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

-- Allow admins to delete registrations
CREATE POLICY "Admins can delete event registrations"
  ON public.event_registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'superadmin')
    )
  );

-- Allow public (unauthenticated) users to insert registrations
CREATE POLICY "Public can create event registrations"
  ON public.event_registrations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public to view their own registrations (optional, for now just allow insert)
CREATE POLICY "Public can view their own event registrations"
  ON public.event_registrations FOR SELECT
  TO anon
  USING (false); -- Public cannot view registrations for privacy

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_registrations_created_at ON public.event_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
