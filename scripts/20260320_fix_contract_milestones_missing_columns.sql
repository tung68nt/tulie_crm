-- Fix: contract_milestones table is missing 'updated_at' column
-- The trigger 'update_milestones_updated_at' tries to set this column,
-- but it was not created properly. This causes:
--   ERROR: record "new" has no field "updated_at" (42703)
-- which crashes the contract save functionality.

ALTER TABLE public.contract_milestones 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Also ensure other potentially missing columns exist
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS percentage NUMERIC;
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'payment';
ALTER TABLE public.contract_milestones ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
