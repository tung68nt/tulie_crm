-- Add missing columns to retail_orders for B2C flow & Studio order redesign
-- Run this against Supabase SQL Editor

-- Essential columns for the updated order form
ALTER TABLE IF EXISTS public.retail_orders 
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS resource_link text,
ADD COLUMN IF NOT EXISTS demo_link text,
ADD COLUMN IF NOT EXISTS order_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS brand text DEFAULT 'studio',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_vat boolean DEFAULT false;

-- Ensure stt column starts from 810 for legacy continuity
-- If stt column doesn't exist yet
ALTER TABLE IF EXISTS public.retail_orders
ADD COLUMN IF NOT EXISTS stt integer;

-- If no rows exist, insert a phantom to set next sequence
-- (only run if you need to bootstrap the sequence)
-- INSERT INTO retail_orders (stt, customer_name, total_amount, order_number) 
-- VALUES (809, 'SYSTEM_SEED', 0, 'DH_SEED') ON CONFLICT DO NOTHING;
