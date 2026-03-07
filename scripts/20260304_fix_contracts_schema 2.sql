-- Migration: Fix missing total_amount and standard columns in contracts table
-- Purpose: Ensure conversion from quotation to contract/order works correctly

DO $$
BEGIN
    -- 1. Ensure total_amount exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='total_amount') THEN
        ALTER TABLE public.contracts ADD COLUMN total_amount DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- 2. Ensure title exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='title') THEN
        ALTER TABLE public.contracts ADD COLUMN title TEXT;
    END IF;

    -- 3. Ensure start_date exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='start_date') THEN
        ALTER TABLE public.contracts ADD COLUMN start_date DATE DEFAULT CURRENT_DATE;
    END IF;

    -- 4. Ensure brand exists (for unified brands)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='brand') THEN
        ALTER TABLE public.contracts ADD COLUMN brand TEXT DEFAULT 'agency'; -- agency, studio, academy
    END IF;

    -- 5. Ensure status is robust
    -- (status should already exist from previous steps but ensuring it's text)
    ALTER TABLE public.contracts ALTER COLUMN status SET DEFAULT 'draft';

END $$;
