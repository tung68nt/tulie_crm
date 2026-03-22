-- Migration: Remove overly permissive RLS policies for portal
-- Date: 2026-03-21
-- Context: Portal server actions now use admin client (service role key),
--          so "Public can view" RLS policies are no longer needed.
--          These policies were a security risk as they allowed anyone with
--          the Supabase anon key to query ENTIRE tables directly.

-- ============================================
-- REMOVE DANGEROUS PUBLIC POLICIES
-- ============================================

-- 1. Quotations — was allowing anyone to SELECT all quotations
DROP POLICY IF EXISTS "Public can view quotations via token" ON public.quotations;

-- 2. Quotation Items — was allowing anyone to SELECT all items
DROP POLICY IF EXISTS "Public can view quotation items" ON public.quotation_items;

-- 3. Customers — was exposing ALL customer data (email, phone, tax code, address)
DROP POLICY IF EXISTS "Public can view customers" ON public.customers;

-- 4. Products — was exposing all product/pricing data
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- 5. Users — was exposing all internal user data
DROP POLICY IF EXISTS "Public can view users" ON public.users;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this migration:
-- 1. Portal should still work (uses admin client server-side)
-- 2. Dashboard should still work (uses authenticated session)
-- 3. Direct Supabase REST API calls with anon key should NO LONGER
--    return data from these tables (unless user is authenticated)
--
-- To verify, run:
--   curl 'https://YOUR_PROJECT.supabase.co/rest/v1/customers?select=*' \
--     -H "apikey: YOUR_ANON_KEY" \
--     -H "Authorization: Bearer YOUR_ANON_KEY"
--   → Should return [] or 403 (not all customers!)
