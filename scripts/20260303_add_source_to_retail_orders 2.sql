-- Add source_type to retail_orders if not exists (to distinguish Studio from Academy)
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS source_system TEXT DEFAULT 'studio';
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE public.retail_orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_retail_orders_external_id ON public.retail_orders (external_id);
CREATE INDEX IF NOT EXISTS idx_retail_orders_order_number ON public.retail_orders (order_number);
