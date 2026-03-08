-- Fix System Settings RLS - allow all authenticated users to manage settings
-- Run this in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.system_settings;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.system_settings;

-- New policies: allow all authenticated users
CREATE POLICY "Anyone can view settings" ON public.system_settings 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage settings" ON public.system_settings 
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
