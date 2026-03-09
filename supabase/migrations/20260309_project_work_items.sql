-- ============================================
-- MIGRATION: Project Work Items & Todo Lists
-- Date: 2026-03-09
-- Description: Adds work_items table to group project deliverables,
--              each with its own quotation, contract, todo list, delivery links,
--              and acceptance status.
-- ============================================

-- 1. Create project_work_items table
CREATE TABLE IF NOT EXISTS project_work_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'accepted', 'rejected')),
    
    -- Link to quotation & contract (optional, a work item may not have one yet)
    quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    
    -- Delivery links as JSONB array: [{ label: "Demo 1", url: "https://...", date: "2026-03-01" }, ...]
    delivery_links JSONB DEFAULT '[]'::jsonb,
    
    -- Required documents/procedures as JSONB array: [{ title: "Hợp đồng", status: "pending"|"signed", date: null }, ...]
    required_documents JSONB DEFAULT '[]'::jsonb,
    
    -- Acceptance
    accepted_at TIMESTAMPTZ,
    accepted_by TEXT, -- customer name who accepted
    rejection_reason TEXT,
    
    -- Ordering & metadata
    sort_order INTEGER DEFAULT 0,
    total_amount NUMERIC(15,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add work_item_id to project_tasks so tasks can be grouped by work item
ALTER TABLE project_tasks
    ADD COLUMN IF NOT EXISTS work_item_id UUID REFERENCES project_work_items(id) ON DELETE SET NULL;

-- 3. Add description column to projects if not exists (for project description on portal)
-- (projects.description already exists based on type definition, but let's be safe)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT DEFAULT '';
    END IF;
END $$;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_items_project ON project_work_items(project_id);
CREATE INDEX IF NOT EXISTS idx_work_items_quotation ON project_work_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_work_items_contract ON project_work_items(contract_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_work_item ON project_tasks(work_item_id);

-- 5. RLS policies (following existing pattern)
ALTER TABLE project_work_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (matches existing RLS pattern in your app)
CREATE POLICY "Authenticated users can manage work items"
    ON project_work_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon read for portal access
CREATE POLICY "Anon can read work items"
    ON project_work_items
    FOR SELECT
    TO anon
    USING (true);

-- 6. Updated_at trigger
CREATE OR REPLACE FUNCTION update_work_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_work_items_updated_at
    BEFORE UPDATE ON project_work_items
    FOR EACH ROW
    EXECUTE FUNCTION update_work_items_updated_at();
