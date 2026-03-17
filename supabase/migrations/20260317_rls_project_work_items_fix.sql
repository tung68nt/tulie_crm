-- ============================================
-- FIX: RLS policy for project_work_items
-- 
-- PROBLEM: RLS v2 migration listed 'work_items' but actual table is 'project_work_items'
-- Result: authenticated users cannot read/write project_work_items → "Chưa có hạng mục nào"
-- ============================================

-- Enable RLS and add policy for authenticated users
ALTER TABLE project_work_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_project_work_items_all" ON project_work_items 
    FOR ALL TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Also fix: drop the wrong 'work_items' policy if it exists (no-op if table doesn't exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'work_items' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "auth_work_items_all" ON work_items;
    END IF;
END $$;
