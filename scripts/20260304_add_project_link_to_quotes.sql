-- Migration: Add Project Grouping to Quotations and Contracts
-- Purpose: Support granular portal grouping by Project/Phase instead of entire Deal

DO $$ 
BEGIN 
    -- 1. Add project_id to Quotations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='project_id') THEN
        ALTER TABLE public.quotations ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    END IF;

    -- 2. Add project_id to Contracts (complementary to the existing link on projects table)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='project_id') THEN
        ALTER TABLE public.contracts ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    END IF;
END $$;
