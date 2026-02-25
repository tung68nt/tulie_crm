-- Migration: Update Quotations and Quotation Items Schema
-- Purpose: Add missing columns and security policies required for quote creation and draft saving.

-- 1. Update quotations table
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS terms TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_no TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_branch TEXT,
ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Update quotation_items table
ALTER TABLE public.quotation_items
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS vat_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 3. Add RLS Policies for quotations
-- Enable RLS if not already (it should be from setup.sql)
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all quotes (or change to created_by = auth.uid() for stricter privacy)
CREATE POLICY "Users can view all quotations" ON public.quotations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create quotes
CREATE POLICY "Users can create quotations" ON public.quotations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own quotes (or all quotes if admin-like)
CREATE POLICY "Users can update quotations" ON public.quotations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete quotes
CREATE POLICY "Users can delete quotations" ON public.quotations
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Add RLS Policies for quotation_items
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all quotation items" ON public.quotation_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert quotation items" ON public.quotation_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update quotation items" ON public.quotation_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete quotation items" ON public.quotation_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON public.quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
