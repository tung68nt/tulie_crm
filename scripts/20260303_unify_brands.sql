-- Migration: Brand & Business Model Integration
-- Purpose: Unify Tulie Agency, Tulie Studio, and Tulie Academy brands

-- 1. Create Brand Enum type if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'brand_type') THEN
        CREATE TYPE brand_type AS ENUM ('agency', 'studio', 'academy');
    END IF;
END $$;

-- 2. Add brand column to core tables
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'agency';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'agency';
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'agency';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'agency';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'agency';
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS brand brand_type DEFAULT 'studio';

-- 3. Update existing records to correct brands based on logic
-- Retail orders from academy should be brand 'academy'
UPDATE public.retail_orders SET brand = 'academy' WHERE source_system = 'academy';

-- 4. Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_deals_brand ON public.deals(brand);
CREATE INDEX IF NOT EXISTS idx_contracts_brand ON public.contracts(brand);
CREATE INDEX IF NOT EXISTS idx_retail_orders_brand ON public.retail_orders(brand);
CREATE INDEX IF NOT EXISTS idx_invoices_brand ON public.invoices(brand);
