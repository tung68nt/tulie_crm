-- Migration: Add missing columns to contracts table to fix conversion error
-- Description: Add total_amount and brand columns if they don't exist

DO $$ 
BEGIN 
    -- 1. Add total_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='total_amount') THEN
        ALTER TABLE public.contracts ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- 2. Add brand
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='brand') THEN
        ALTER TABLE public.contracts ADD COLUMN brand TEXT;
    END IF;
END $$;
