-- Fix RLS for product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.product_categories;
CREATE POLICY "Anyone can view categories" ON public.product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;
CREATE POLICY "Admins can manage categories" ON public.product_categories 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add default appearance settings if not exists
INSERT INTO public.system_settings (key, value)
VALUES ('appearance_config', '{"darkMode": false, "sidebarCollapsed": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
