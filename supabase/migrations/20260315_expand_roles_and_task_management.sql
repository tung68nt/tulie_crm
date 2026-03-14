-- ============================================
-- MIGRATION: Expand Roles & Task Management
-- Date: 2026-03-15
-- Description:
--   1. Expand users.role to support 14 marketing agency positions
--   2. Add users.department column
--   3. Create workspace_tasks table (standalone tasks, independent of projects)
--   4. Create task_comments table
--   5. Create revenue_targets table
--   6. Add performance indexes
-- ============================================

-- Step 1: Add department column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS department text;

-- Step 2: Expand role values
-- Current valid values: admin, leader, staff, accountant
-- New values: ceo, creative_director, account_manager, account_executive,
--             project_manager, designer, copywriter, social_media, media_buyer,
--             photographer, video_editor, accountant, hr_admin, intern
-- We keep backward compatibility by allowing old values temporarily
-- The app will handle mapping old→new

-- No ALTER needed for role since it's a text field, not an enum.
-- Migrate existing data:
UPDATE users SET role = 'ceo' WHERE role = 'admin';
UPDATE users SET role = 'project_manager' WHERE role = 'leader';
-- staff and accountant remain valid in the new system

-- Step 3: Create workspace_tasks table
-- Standalone tasks not tied to any project (personal tasks, ad-hoc work)
CREATE TABLE IF NOT EXISTS workspace_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed', 'cancelled')),
    priority text NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    -- Relations
    assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    -- Dates
    due_date timestamptz,
    start_date timestamptz,
    completed_at timestamptz,
    -- Organization
    labels text[] DEFAULT '{}',
    category text, -- 'follow_up', 'internal', 'client_request', 'admin'
    -- Metadata
    brand text DEFAULT 'agency',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Step 4: Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid NOT NULL,
    task_type text NOT NULL DEFAULT 'workspace'
        CHECK (task_type IN ('workspace', 'project')),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    content text NOT NULL,
    attachments text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Step 5: Create revenue_targets table
CREATE TABLE IF NOT EXISTS revenue_targets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    period_type text NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
    period_start date NOT NULL,
    period_end date NOT NULL,
    target_amount bigint NOT NULL DEFAULT 0,
    actual_amount bigint NOT NULL DEFAULT 0,
    brand text DEFAULT 'agency',
    notes text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(period_type, period_start, brand)
);

-- Step 6: Performance indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_assigned_to ON workspace_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_project_id ON workspace_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_created_by ON workspace_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_revenue_targets_period ON revenue_targets(period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 7: Add updated_at trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workspace_tasks_updated_at ON workspace_tasks;
CREATE TRIGGER update_workspace_tasks_updated_at
    BEFORE UPDATE ON workspace_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_task_comments_updated_at ON task_comments;
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_targets_updated_at ON revenue_targets;
CREATE TRIGGER update_revenue_targets_updated_at
    BEFORE UPDATE ON revenue_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Disable RLS for new tables (matching existing pattern)
ALTER TABLE workspace_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_targets DISABLE ROW LEVEL SECURITY;
