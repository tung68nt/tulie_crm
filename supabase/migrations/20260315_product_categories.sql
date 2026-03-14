-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Allow all for authenticated" ON product_categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed some default categories
INSERT INTO product_categories (name) VALUES 
  ('Studio'),
  ('Marketing'),
  ('Design')
ON CONFLICT (name) DO NOTHING;
