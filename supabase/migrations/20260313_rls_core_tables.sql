-- ============================================
-- Tulie CRM — Row Level Security Policies
-- Migration: 20260313_rls_core_tables.sql
-- 
-- Purpose: Enable RLS on core tables and add policies
-- so that authenticated users can only access data they own/are assigned to.
-- Service role (used by webhooks/system) bypasses RLS by default.
--
-- NOTE: These policies work WITH the app-level RBAC (lib/security/permissions.ts).
-- RLS is the database-level safety net. App-level RBAC provides fine-grained control.
-- ============================================

-- ============================================
-- 1. CUSTOMERS
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Admin/Leader: full access
CREATE POLICY "admin_leader_customers_all" ON customers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

-- Staff: only own assigned customers
CREATE POLICY "staff_customers_own" ON customers
    FOR ALL
    TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

-- Accountant: read-only access to all customers
CREATE POLICY "accountant_customers_read" ON customers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );

-- ============================================
-- 2. DEALS
-- ============================================
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_deals_all" ON deals
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_deals_own" ON deals
    FOR ALL
    TO authenticated
    USING (
        (assigned_to = auth.uid() OR created_by = auth.uid())
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_deals_read" ON deals
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );

-- ============================================
-- 3. QUOTATIONS
-- ============================================
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_quotations_all" ON quotations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_quotations_own" ON quotations
    FOR ALL
    TO authenticated
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_quotations_read" ON quotations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );

-- ============================================
-- 4. CONTRACTS
-- ============================================
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_contracts_all" ON contracts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_contracts_own" ON contracts
    FOR ALL
    TO authenticated
    USING (
        created_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_contracts_read" ON contracts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );

-- ============================================
-- 5. PROJECTS
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leader_projects_all" ON projects
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

CREATE POLICY "staff_projects_own" ON projects
    FOR ALL
    TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

CREATE POLICY "accountant_projects_read" ON projects
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'accountant'
        )
    );

-- ============================================
-- 6. INVOICES
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admin/Leader/Accountant: full access
CREATE POLICY "admin_leader_accountant_invoices_all" ON invoices
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader', 'accountant')
        )
    );

-- Staff: read-only invoices linked to their contracts
CREATE POLICY "staff_invoices_read_own" ON invoices
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
        AND (
            -- Staff can view invoices for contracts they created
            EXISTS (
                SELECT 1 FROM contracts
                WHERE contracts.id = invoices.contract_id
                AND contracts.created_by = auth.uid()
            )
            -- Or invoices for their assigned customers
            OR EXISTS (
                SELECT 1 FROM customers
                WHERE customers.id = invoices.customer_id
                AND customers.assigned_to = auth.uid()
            )
        )
    );

-- ============================================
-- 7. RETAIL ORDERS (B2C — all authenticated users can access)
-- ============================================
ALTER TABLE retail_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_retail_orders_all" ON retail_orders
    FOR ALL
    TO authenticated
    USING (true);

-- ============================================
-- 8. USERS table — view-only for non-admin
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "admin_users_all" ON users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Non-admin: read access to basic user info (needed for assignee dropdowns, etc.)
CREATE POLICY "authenticated_users_read" ON users
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 9. LEADS
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Admin/Leader: full access
CREATE POLICY "admin_leader_leads_all" ON leads
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'leader')
        )
    );

-- Staff: own leads only
CREATE POLICY "staff_leads_own" ON leads
    FOR ALL
    TO authenticated
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'staff'
        )
    );

-- Anon: can insert leads (landing page form)
CREATE POLICY "anon_leads_insert" ON leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- ============================================
-- 10. SUPPORTING TABLES (open access to authenticated)
-- These tables don't contain sensitive ownership data
-- ============================================

-- Products: all authenticated can view
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_products_all" ON products
    FOR ALL TO authenticated USING (true);

-- Document templates: all authenticated can view
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_templates_all" ON document_templates
    FOR ALL TO authenticated USING (true);

-- System settings: all authenticated can view, admin can edit (via service_role)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_settings_read" ON system_settings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_settings_write" ON system_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Activity logs: all authenticated can view and insert
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_activity_log_all" ON activity_log
    FOR ALL TO authenticated USING (true);

-- Notifications: users see only their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notifications" ON notifications
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- IMPORTANT NOTES:
-- 
-- 1. service_role key (used in lib/supabase/admin.ts) BYPASSES all RLS
--    This is correct for: webhooks, system operations, background jobs
--
-- 2. These policies use subqueries to check users.role
--    For better performance, consider using a custom claim in JWT:
--    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--    CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
--      SELECT role FROM public.users WHERE id = auth.uid()
--    $$ LANGUAGE SQL SECURITY DEFINER;
--
-- 3. Before running this migration:
--    - Backup the database
--    - Test on staging first
--    - Monitor for any access issues after deployment
-- ============================================
