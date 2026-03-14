-- Add delivery_type column to retail_orders
-- 'digital' = file mềm (no shipping), 'physical' = có ship ảnh in
ALTER TABLE retail_orders
ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'digital'
CHECK (delivery_type IN ('digital', 'physical'));

-- Update existing orders with 'shooting' status to 'editing'
UPDATE retail_orders SET order_status = 'editing' WHERE order_status = 'shooting';
