-- Migration: Add Deals, Projects, and Contract Milestones Tables
-- Purpose: Support full Marketing Agency Data Flow and enhance Existing Entities

-- 1. Create Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    budget DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'new', -- new, briefing, proposal_sent, closed_won, closed_lost
    priority TEXT DEFAULT 'medium', -- low, medium, high
    assigned_to UUID REFERENCES public.users(id),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enhance Quotations Table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='deal_id') THEN
        ALTER TABLE public.quotations ADD COLUMN deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='title') THEN
        ALTER TABLE public.quotations ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='public_token') THEN
        ALTER TABLE public.quotations ADD COLUMN public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='password_hash') THEN
        ALTER TABLE public.quotations ADD COLUMN password_hash TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='subtotal') THEN
        ALTER TABLE public.quotations ADD COLUMN subtotal DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='vat_percent') THEN
        ALTER TABLE public.quotations ADD COLUMN vat_percent INTEGER DEFAULT 8;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='vat_amount') THEN
        ALTER TABLE public.quotations ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='discount_percent') THEN
        ALTER TABLE public.quotations ADD COLUMN discount_percent INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='discount_amount') THEN
        ALTER TABLE public.quotations ADD COLUMN discount_amount DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='terms') THEN
        ALTER TABLE public.quotations ADD COLUMN terms TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='view_count') THEN
        ALTER TABLE public.quotations ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    -- Bank details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='bank_name') THEN
        ALTER TABLE public.quotations ADD COLUMN bank_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='bank_account_no') THEN
        ALTER TABLE public.quotations ADD COLUMN bank_account_no TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quotations' AND column_name='bank_account_name') THEN
        ALTER TABLE public.quotations ADD COLUMN bank_account_name TEXT;
    END IF;
END $$;

-- 3. Enhance Contracts Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='type') THEN
        ALTER TABLE public.contracts ADD COLUMN type TEXT DEFAULT 'contract'; -- contract, order
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='order_number') THEN
        ALTER TABLE public.contracts ADD COLUMN order_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='deal_id') THEN
        ALTER TABLE public.contracts ADD COLUMN deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contracts' AND column_name='terms') THEN
        ALTER TABLE public.contracts ADD COLUMN terms TEXT;
    END IF;
END $$;

-- 4. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo', -- todo, in_progress, review, completed
    start_date DATE,
    end_date DATE,
    assigned_to UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}'::jsonb, -- Store links/info: source_link, hosting_info, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Contract Milestones Table
CREATE TABLE IF NOT EXISTS public.contract_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    actual_date DATE,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, delayed
    delay_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Acceptance Reports (Biên bản nghiệm thu)
CREATE TABLE IF NOT EXISTS public.acceptance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    report_number TEXT UNIQUE NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE,
    content TEXT,
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_milestones ENABLE ROW LEVEL SECURITY;

-- 8. Add RLS Policies
DROP POLICY IF EXISTS "Users can manage all deals" ON public.deals;
CREATE POLICY "Users can manage all deals" ON public.deals FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage all projects" ON public.projects;
CREATE POLICY "Users can manage all projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage all acceptance reports" ON public.acceptance_reports;
CREATE POLICY "Users can manage all acceptance reports" ON public.acceptance_reports FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage all contract milestones" ON public.contract_milestones;
CREATE POLICY "Users can manage all contract milestones" ON public.contract_milestones FOR ALL USING (auth.role() = 'authenticated');

-- 9. Add trigger for updated_at
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deals_updated_at') THEN
            CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
            CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_milestones_updated_at') THEN
            CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.contract_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;
