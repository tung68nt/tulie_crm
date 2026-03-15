-- Add shipping & tracking columns to retail_orders
-- These columns are referenced in the app but were never added to the DB

ALTER TABLE retail_orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_info JSONB DEFAULT '{}';
