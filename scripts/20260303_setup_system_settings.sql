-- Setup System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view settings" ON public.system_settings;
CREATE POLICY "Anyone can view settings" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;
CREATE POLICY "Admins can update settings" ON public.system_settings FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can insert settings" ON public.system_settings;
CREATE POLICY "Admins can insert settings" ON public.system_settings FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
