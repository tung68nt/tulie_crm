-- Backfill SKU for existing products that don't have one
-- Format: first 3 chars of category (uppercase) + sequential number
UPDATE products 
SET sku = 'STU-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE (sku IS NULL OR sku = '')
AND category = 'Studio';

UPDATE products 
SET sku = 'PRD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE (sku IS NULL OR sku = '')
AND (category IS NULL OR category != 'Studio');
