-- Fix RLS + Create missing tables
-- Run this in Supabase SQL Editor

-- 1. Create project_tasks table if not exists
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_milestone_id ON project_tasks(milestone_id);

-- 2. Enable RLS on project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view project_tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Authenticated users can manage project_tasks" ON public.project_tasks;

CREATE POLICY "Authenticated users can view project_tasks" ON public.project_tasks 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage project_tasks" ON public.project_tasks 
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 3. Fix system_settings RLS
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
