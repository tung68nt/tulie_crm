-- ============================================
-- Tulie CRM — RLS v2 (Idempotent)
-- Migration: 20260317_rls_v2.sql
--
-- PURPOSE: Re-enable RLS after emergency disable.
-- This migration is idempotent — safe to run multiple times.
--
-- STRATEGY:
-- 1. Drop ALL old policies (clean slate)
-- 2. Enable RLS on all tables
-- 3. Create correct policies per table
--
-- ARCHITECTURE:
-- - createClient() → anon key + user cookies → RLS enforced
-- - createAdminClient() → service_role key → bypasses RLS
-- - Webhooks, system operations → use createAdminClient()
-- - App-level RBAC provides fine-grained access control
-- - DB-level RLS is the safety net against anon key abuse
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
    -- Drop all policies on public tables
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
-- 1. CUSTOMERS
-- Admin/Leader: full access
-- Staff: own assigned_to only
-- Accountant: read-only
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_customers_all" ON customers
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_customers_own" ON customers
    FOR ALL TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_customers_read" ON customers
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );


-- ============================================
-- 2. DEALS
-- Admin/Leader: full access
-- Staff: own assigned_to/created_by
-- Accountant: read-only
-- ============================================
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_deals_all" ON deals
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_deals_own" ON deals
    FOR ALL TO authenticated
    USING (
        (assigned_to = auth.uid() OR created_by = auth.uid())
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_deals_read" ON deals
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );


-- ============================================
-- 3. QUOTATIONS
-- Admin/Leader: full access
-- Staff: own created_by
-- Accountant: read-only
-- ============================================
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_quotations_all" ON quotations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_quotations_own" ON quotations
    FOR ALL TO authenticated
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_quotations_read" ON quotations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );


-- ============================================
-- 4. CONTRACTS
-- Admin/Leader: full access
-- Staff: own created_by
-- Accountant: read-only
-- ============================================
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_contracts_all" ON contracts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_contracts_own" ON contracts
    FOR ALL TO authenticated
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_contracts_read" ON contracts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );


-- ============================================
-- 5. PROJECTS
-- Admin/Leader: full access
-- Staff: own assigned_to
-- Accountant: read-only
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_projects_all" ON projects
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_projects_own" ON projects
    FOR ALL TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_projects_read" ON projects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );


-- ============================================
-- 6. INVOICES
-- Admin/Leader/Accountant: full access (accountants manage invoices)
-- Staff: read-only (via contract/customer ownership)
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_accountant_invoices_all" ON invoices
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader', 'accountant')
        )
    );

CREATE POLICY "staff_invoices_read_own" ON invoices
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
        AND (
            EXISTS (
                SELECT 1 FROM contracts
                WHERE contracts.id = invoices.contract_id
                AND contracts.created_by = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM customers
                WHERE customers.id = invoices.customer_id
                AND customers.assigned_to = auth.uid()
            )
        )
    );


-- ============================================
-- 7. RETAIL ORDERS (B2C)
-- All authenticated users can access
-- ============================================
ALTER TABLE retail_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_retail_orders_all" ON retail_orders
    FOR ALL TO authenticated USING (true);


-- ============================================
-- 8. USERS
-- Admin: full access
-- All authenticated: read-only (needed for assignee dropdowns)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_all" ON users
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

CREATE POLICY "authenticated_users_read" ON users
    FOR SELECT TO authenticated USING (true);


-- ============================================
-- 9. LEADS
-- Admin/Leader: full access
-- Staff/Accountant: read-only (leads have no assigned_to)
-- Anon: can INSERT (landing page form — uses createAdminClient, but
--         adding policy as safety net for direct Supabase access)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_leads_all" ON leads
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_accountant_leads_read" ON leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('staff', 'accountant')
        )
    );

-- Anon insert for public landing page form
CREATE POLICY "anon_leads_insert" ON leads
    FOR INSERT TO anon WITH CHECK (true);


-- ============================================
-- 10. PRODUCTS
-- All authenticated: full access
-- Anon: read-only (public portal/catalog)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_products_all" ON products
            FOR ALL TO authenticated USING (true);
        CREATE POLICY "anon_products_read" ON products
            FOR SELECT TO anon USING (true);
    END IF;
END $$;


-- ============================================
-- 11. SYSTEM SETTINGS
-- Admin: full access (CRUD)
-- All authenticated: read-only
-- NOTE: Webhook services that read settings use createAdminClient()
--       which bypasses RLS, so this is safe.
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public') THEN
        ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "admin_settings_all" ON system_settings
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE users.id = auth.uid()
                    AND users.role = 'admin'
                )
            );
        CREATE POLICY "authenticated_settings_read" ON system_settings
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;


-- ============================================
-- 12. ACTIVITY LOG
-- All authenticated: full access (read + insert)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log' AND table_schema = 'public') THEN
        ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_activity_log_all" ON activity_log
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;


-- ============================================
-- 13. DOCUMENT TEMPLATES
-- All authenticated: full access
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_templates' AND table_schema = 'public') THEN
        ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_templates_all" ON document_templates
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;


-- ============================================
-- 14. NOTIFICATIONS
-- Users see only their own notifications
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "own_notifications" ON notifications
            FOR ALL TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;


-- ============================================
-- 15. PAYMENT TRANSACTIONS
-- All authenticated: full access
-- NOTE: processWebhookPayment uses createClient() called from
--       webhook context. Webhook service functions should migrate
--       to createAdminClient(). For now, use permissive policy.
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions' AND table_schema = 'public') THEN
        ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_payment_transactions_all" ON payment_transactions
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;


-- ============================================
-- 16. SUPPORTING TABLES (if they exist)
-- ============================================

-- Quotation Items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation_items' AND table_schema = 'public') THEN
        ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_quotation_items_all" ON quotation_items
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Contract Items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contract_items' AND table_schema = 'public') THEN
        ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_contract_items_all" ON contract_items
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Work Items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_items' AND table_schema = 'public') THEN
        ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_work_items_all" ON work_items
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Acceptance Reports
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'acceptance_reports' AND table_schema = 'public') THEN
        ALTER TABLE acceptance_reports ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_acceptance_reports_all" ON acceptance_reports
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Workspace Tasks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspace_tasks' AND table_schema = 'public') THEN
        ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_workspace_tasks_all" ON workspace_tasks
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Tickets
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tickets' AND table_schema = 'public') THEN
        ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_tickets_all" ON tickets
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Ticket Messages
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ticket_messages' AND table_schema = 'public') THEN
        ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_ticket_messages_all" ON ticket_messages
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Retail Order Items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'retail_order_items' AND table_schema = 'public') THEN
        ALTER TABLE retail_order_items ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_retail_order_items_all" ON retail_order_items
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Product Categories
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories' AND table_schema = 'public') THEN
        ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_product_categories_all" ON product_categories
            FOR ALL TO authenticated USING (true);
        CREATE POLICY "anon_product_categories_read" ON product_categories
            FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- Project Tasks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_tasks' AND table_schema = 'public') THEN
        ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_project_tasks_all" ON project_tasks
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;


-- ============================================
-- IMPORTANT NOTES:
-- 
-- 1. service_role key (createAdminClient) BYPASSES all RLS.
--    Used by: webhooks (sepay, academy), public forms (leads),
--    portal service, system operations.
--
-- 2. These policies use subqueries to check users.role.
--    For better performance, consider custom JWT claims in future.
--
-- 3. ROLLBACK: Run supabase/migrations/20260313_disable_rls.sql
--
-- 4. VERIFY after applying:
--    - Login as admin → check all pages load
--    - Test public portal → verify data loads
--    - Test lead form → verify it saves
--    - Test webhook → verify it processes
-- ============================================
