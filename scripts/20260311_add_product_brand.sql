-- Add brand column to products table
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS brand text DEFAULT 'agency';

-- Update existing products based on category keywords if possible
UPDATE public.products 
SET brand = 'studio' 
WHERE category ILIKE '%studio%' OR category ILIKE '%chụp%';

UPDATE public.products 
SET brand = 'academy' 
WHERE category ILIKE '%khóa học%' OR category ILIKE '%academy%';
