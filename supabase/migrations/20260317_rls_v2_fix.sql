-- ============================================
-- Tulie CRM — RLS v2.1 (FIX: wrong role names)
-- Migration: 20260317_rls_v2_fix.sql
--
-- PROBLEM: v2 policies checked for roles 'admin','leader','staff'
-- but actual DB has 14 roles: ceo, creative_director, account_manager, etc.
-- Result: all queries returned 0 rows.
--
-- FIX: Simplify RLS to:
-- 1. Block anon key abuse (main security threat)
-- 2. Allow ALL authenticated users (app-level RBAC handles fine-grained access)
-- 3. Keep specific anon policies for public endpoints (leads, products)
--
-- ROLLBACK: Run 20260313_disable_rls.sql
-- ============================================

-- ============================================
-- STEP 0: Drop ALL existing policies (clean slate)
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
    RAISE NOTICE 'Dropped all existing RLS policies on public schema';
END $$;

-- ============================================
-- CORE BUSINESS TABLES
-- All authenticated users get full access.
-- App-level RBAC (permissions.ts) handles fine-grained access.
-- ============================================

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_customers_all" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_deals_all" ON deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quotations
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_quotations_all" ON quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_contracts_all" ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_projects_all" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_invoices_all" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Retail Orders
ALTER TABLE retail_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_retail_orders_all" ON retail_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_users_all" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ============================================
-- TABLES WITH ANON ACCESS NEEDED
-- ============================================

-- Leads: anon can INSERT (landing page form)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_leads_all" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_leads_insert" ON leads FOR INSERT TO anon WITH CHECK (true);

-- Products: anon can read (public portal/catalog)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "auth_products_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
        CREATE POLICY "anon_products_read" ON products FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- Product Categories: anon can read (public portal)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories' AND table_schema = 'public') THEN
        ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "auth_product_categories_all" ON product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
        CREATE POLICY "anon_product_categories_read" ON product_categories FOR SELECT TO anon USING (true);
    END IF;
END $$;


-- ============================================
-- SYSTEM & SUPPORTING TABLES
-- All authenticated users get full access.
-- ============================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'system_settings',
        'activity_log',
        'document_templates',
        'notifications',
        'payment_transactions',
        'quotation_items',
        'contract_items',
        'contract_milestones',
        'work_items',
        'acceptance_reports',
        'workspace_tasks',
        'tickets',
        'ticket_messages',
        'retail_order_items',
        'project_tasks',
        'invoice_items',
        'invoice_payments',
        'vendors',
        'expenses',
        'expense_categories',
        'customer_contacts',
        'customer_notes',
        'task_comments',
        'revenue_targets',
        'teams',
        'document_bundles',
        'generated_documents'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('CREATE POLICY "auth_%s_all" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
        END IF;
    END LOOP;
END $$;


-- ============================================
-- VERIFICATION
-- Run these queries to verify:
--
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
--
-- ROLLBACK: Run supabase/migrations/20260313_disable_rls.sql
-- ============================================
