-- Migration: Create retail_order_items table
-- This table stores individual items/products for each retail order

CREATE TABLE IF NOT EXISTS retail_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES retail_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by order
CREATE INDEX IF NOT EXISTS idx_retail_order_items_order_id ON retail_order_items(order_id);

-- Disable RLS (consistent with other tables in this project)
ALTER TABLE retail_order_items DISABLE ROW LEVEL SECURITY;
