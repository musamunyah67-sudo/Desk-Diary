-- Update stories table
UPDATE public.stories
SET image_url = 
  CASE 
    WHEN image_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(image_url from 'thumbnail\?id=([^&]+)')
    ELSE image_url
  END
WHERE image_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update news table
UPDATE public.news
SET image_url = 
  CASE 
    WHEN image_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(image_url from 'thumbnail\?id=([^&]+)')
    ELSE image_url
  END
WHERE image_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update events table
UPDATE public.events
SET image_url = 
  CASE 
    WHEN image_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(image_url from 'thumbnail\?id=([^&]+)')
    ELSE image_url
  END
WHERE image_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update gallery table
UPDATE public.gallery
SET media_url = 
  CASE 
    WHEN media_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(media_url from 'thumbnail\?id=([^&]+)')
    ELSE media_url
  END
WHERE media_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update partners table
UPDATE public.partners
SET image_url = 
  CASE 
    WHEN image_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(image_url from 'thumbnail\?id=([^&]+)')
    ELSE image_url
  END
WHERE image_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update sponsors table
UPDATE public.sponsors
SET logo_url = 
  CASE 
    WHEN logo_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(logo_url from 'thumbnail\?id=([^&]+)')
    ELSE logo_url
  END
WHERE logo_url LIKE 'https://drive.google.com/thumbnail?id=%';

-- Update testimonials table if it has image_url
UPDATE public.testimonials
SET image_url = 
  CASE 
    WHEN image_url LIKE 'https://drive.google.com/thumbnail?id=%' THEN
      'https://drive.google.com/uc?export=view&id=' || substring(image_url from 'thumbnail\?id=([^&]+)')
    ELSE image_url
  END
WHERE image_url LIKE 'https://drive.google.com/thumbnail?id=%';
