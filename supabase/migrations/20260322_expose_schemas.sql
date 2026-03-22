-- ============================================
-- FIX: Expose workforce & workspace schemas to PostgREST API
-- 
-- Problem: Supabase PostgREST only serves 'public' schema by default.
-- Solution: Add schemas to 'pgrst.db_schemas' + ensure proper GRANTs.
--
-- AFTER running this SQL, you MUST also go to:
-- Supabase Dashboard → Settings → API → Schema Settings
-- → Add 'workforce' and 'workspace' to Exposed Schemas
-- 
-- OR run this SQL command to update PostgREST config directly:
-- ============================================

-- Notify PostgREST to expose these schemas
-- This updates the PostgREST config in-database
ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, workforce, workspace';

-- Reload PostgREST config
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';

-- Ensure all roles can access the schemas
GRANT USAGE ON SCHEMA workforce TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA workspace TO anon, authenticated, service_role;

-- Grant SELECT/INSERT/UPDATE/DELETE on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA workforce TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workspace TO anon, authenticated, service_role;

-- Grant on sequences (for auto-generated IDs)
GRANT ALL ON ALL SEQUENCES IN SCHEMA workforce TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA workspace TO anon, authenticated, service_role;

-- Ensure future tables also get proper grants
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
