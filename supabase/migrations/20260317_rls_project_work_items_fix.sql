-- ============================================
-- FIX: RLS policies for missing tables
-- 
-- PROBLEMS found in RLS v2 audit:
-- 1. 'project_work_items' — listed as 'work_items' (wrong table name)
-- 2. 'contacts' — used in contact-service.ts but not in migration
-- 3. 'support_tickets' — code uses this but migration listed 'tickets'
-- ============================================

-- 1. project_work_items (was incorrectly listed as 'work_items')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_work_items' AND table_schema = 'public') THEN
        ALTER TABLE project_work_items ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "auth_project_work_items_all" ON project_work_items;
        CREATE POLICY "auth_project_work_items_all" ON project_work_items
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
        RAISE NOTICE 'Fixed: project_work_items';
    END IF;
END $$;

-- 2. contacts (missing entirely from v2 migration)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "auth_contacts_all" ON contacts;
        CREATE POLICY "auth_contacts_all" ON contacts
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
        RAISE NOTICE 'Fixed: contacts';
    END IF;
END $$;

-- 3. support_tickets (code uses 'support_tickets', migration had 'tickets')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets' AND table_schema = 'public') THEN
        ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "auth_support_tickets_all" ON support_tickets;
        CREATE POLICY "auth_support_tickets_all" ON support_tickets
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
        RAISE NOTICE 'Fixed: support_tickets';
    END IF;
END $$;
