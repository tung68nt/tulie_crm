-- consolidated migration for full system update 2026-03-08
-- ensures retail_orders and retail_order_items have all necessary columns

-- 1. Ensure retail_orders table
CREATE TABLE IF NOT EXISTS public.retail_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    stt INTEGER DEFAULT 0,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    source_system TEXT DEFAULT 'studio',
    external_id TEXT,
    brand TEXT DEFAULT 'studio',
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount NUMERIC DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    resource_link TEXT,
    demo_link TEXT,
    delivery_date TEXT,
    public_token TEXT DEFAULT gen_random_uuid()::text,
    needs_vat BOOLEAN DEFAULT FALSE,
    vat_info JSONB,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing table
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS resource_link TEXT;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS demo_link TEXT;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS delivery_date TEXT;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS public_token TEXT DEFAULT gen_random_uuid()::text;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS needs_vat BOOLEAN DEFAULT FALSE;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'studio';
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT CURRENT_DATE;

-- 2. Ensure retail_order_items table
CREATE TABLE IF NOT EXISTS public.retail_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.retail_orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    total_price NUMERIC DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure products table has cost_price
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_retail_orders_updated_at ON public.retail_orders;
CREATE TRIGGER tr_retail_orders_updated_at
BEFORE UPDATE ON public.retail_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
