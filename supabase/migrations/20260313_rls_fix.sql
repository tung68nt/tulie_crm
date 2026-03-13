-- ============================================
-- Fix RLS migration — drop failed policies and re-create
-- Run this AFTER the initial migration partially failed
-- ============================================

-- Drop the problematic policies if they were created before failure
DROP POLICY IF EXISTS "staff_invoices_read_own" ON invoices;
DROP POLICY IF EXISTS "staff_leads_own" ON leads;
-- activity_log (not activity_logs) — drop old wrong-name policy if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "authenticated_activity_logs_all" ON activity_log;
        DROP POLICY IF EXISTS "authenticated_activity_log_all" ON activity_log;
    END IF;
END $$;

-- ============================================
-- Fix 1: INVOICES — staff policy (no created_by column)
-- Staff can see invoices for their contracts or their customers
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'staff_invoices_read_own' AND tablename = 'invoices'
    ) THEN
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
    END IF;
END $$;

-- ============================================
-- Fix 2: ACTIVITY_LOG table name (was activity_logs, should be activity_log)
-- ============================================
DO $$
BEGIN
    -- Only enable RLS and create policy if table exists and policy doesn't exist yet
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log' AND table_schema = 'public') THEN
        ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_activity_log_all' AND tablename = 'activity_log'
        ) THEN
            CREATE POLICY "authenticated_activity_log_all" ON activity_log
                FOR ALL TO authenticated USING (true);
        END IF;
    END IF;
END $$;

-- ============================================
-- Fix 3: Enable remaining tables that might have been skipped
-- ============================================

-- Retail orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_retail_orders_all' AND tablename = 'retail_orders') THEN
        ALTER TABLE retail_orders ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "authenticated_retail_orders_all" ON retail_orders
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_users_all' AND tablename = 'users') THEN
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
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_users_read' AND tablename = 'users') THEN
        CREATE POLICY "authenticated_users_read" ON users
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Leads
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_leader_leads_all' AND tablename = 'leads') THEN
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
    END IF;
    
    -- Staff/Accountant: read-only access to all leads (no ownership column)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_leads_read' AND tablename = 'leads') THEN
        CREATE POLICY "staff_leads_read" ON leads
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM users
                    WHERE users.id = auth.uid()
                    AND users.role IN ('staff', 'accountant')
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_leads_insert' AND tablename = 'leads') THEN
        CREATE POLICY "anon_leads_insert" ON leads
            FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

-- Products
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_products_all' AND tablename = 'products') THEN
            CREATE POLICY "authenticated_products_all" ON products
                FOR ALL TO authenticated USING (true);
        END IF;
    END IF;
END $$;

-- Document templates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_templates' AND table_schema = 'public') THEN
        ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_templates_all' AND tablename = 'document_templates') THEN
            CREATE POLICY "authenticated_templates_all" ON document_templates
                FOR ALL TO authenticated USING (true);
        END IF;
    END IF;
END $$;

-- System settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public') THEN
        ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_settings_read' AND tablename = 'system_settings') THEN
            CREATE POLICY "authenticated_settings_read" ON system_settings
                FOR SELECT TO authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_settings_write' AND tablename = 'system_settings') THEN
            CREATE POLICY "admin_settings_write" ON system_settings
                FOR ALL TO authenticated
                USING (
                    EXISTS (
                        SELECT 1 FROM users
                        WHERE users.id = auth.uid()
                        AND users.role = 'admin'
                    )
                );
        END IF;
    END IF;
END $$;

-- Notifications
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'own_notifications' AND tablename = 'notifications') THEN
            CREATE POLICY "own_notifications" ON notifications
                FOR ALL TO authenticated
                USING (user_id = auth.uid());
        END IF;
    END IF;
END $$;
