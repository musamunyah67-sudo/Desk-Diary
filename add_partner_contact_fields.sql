ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN public.partners.contact_email IS 'Contact email for the partner school';
COMMENT ON COLUMN public.partners.phone IS 'Phone number for the partner school';
