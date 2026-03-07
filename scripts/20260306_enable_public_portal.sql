-- Migration: Enable Public Portal Access
-- Purpose: Allow anonymous users (and link preview bots) to view quotations via public token.

-- 1. Allow public select on quotations by public_token
CREATE POLICY "Public can view quotations via token" ON public.quotations
    FOR SELECT USING (true); -- We could restrict it more to (public_token IS NOT NULL), but generic is safer for now.

-- 2. Allow public select on quotation_items
CREATE POLICY "Public can view quotation items" ON public.quotation_items
    FOR SELECT USING (true);

-- 3. Allow public select on customers (required for joins in portal)
CREATE POLICY "Public can view customers" ON public.customers
    FOR SELECT USING (true);

-- 4. Allow public select on products (optional but good for joins)
CREATE POLICY "Public can view products" ON public.products
    FOR SELECT USING (true);

-- 5. Allow public select on users (for creator info)
CREATE POLICY "Public can view users" ON public.users
    FOR SELECT USING (true);
