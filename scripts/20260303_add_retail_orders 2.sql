-- Migration: Add Retail Orders and Telegram Settings
-- Purpose: Support B2C Studio Workflow and Notifications

-- 1. Create Retail Orders Table (B2C)
CREATE TABLE IF NOT EXISTS public.retail_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Format: DH_YY_MMDD_STT_VALUE
    stt INTEGER, -- Sequence in day or total
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending', -- pending, partial, paid
    order_status TEXT DEFAULT 'pending', -- pending, shooting, editing, completed, cancelled
    resource_link TEXT, -- Link for final high-res photos
    demo_link TEXT, -- Link for previews/watermarked
    needs_vat BOOLEAN DEFAULT false,
    vat_info JSONB DEFAULT '{}'::jsonb, -- Tax code, address, etc.
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create System Settings for Telegram (if not exists)
-- This table already exists from setup.sql, but we ensure keys exist
INSERT INTO public.system_settings (key, value)
VALUES 
('telegram_config', '{"bot_token": "", "chat_id": "", "is_enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.retail_orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can manage all retail orders" ON public.retail_orders;
CREATE POLICY "Users can manage all retail orders" ON public.retail_orders FOR ALL USING (auth.role() = 'authenticated');

-- 5. Add trigger for updated_at
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_retail_orders_updated_at') THEN
            CREATE TRIGGER update_retail_orders_updated_at BEFORE UPDATE ON public.retail_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;
