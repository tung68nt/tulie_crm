-- Fix project_tasks RLS and add missing policies
-- Run this in Supabase SQL Editor

-- Enable RLS on project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Authenticated users can manage project_tasks" ON public.project_tasks;

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can view project_tasks" ON public.project_tasks 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage project_tasks" ON public.project_tasks 
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Also fix system_settings if not already done
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.system_settings;

CREATE POLICY "Anyone can view settings" ON public.system_settings 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage settings" ON public.system_settings 
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
