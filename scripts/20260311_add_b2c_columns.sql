-- Add missing columns to retail_orders for B2C flow
ALTER TABLE IF EXISTS public.retail_orders 
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS resource_link text,
ADD COLUMN IF NOT EXISTS demo_link text;
