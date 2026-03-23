-- ============================================
-- MIGRATION: Create workspace schema
-- Date: 2026-03-22
-- Description: Tạo schema workspace cho Tulie Workspace (Flowguard)
--   nâng cấp module workspace đơn giản hiện tại trong CRM.
--   Bảng mới có FK liên kết sang public.projects, public.users (CRM).
--   KHÔNG ảnh hưởng bảng workspace_tasks / project_tasks hiện tại.
-- ============================================

-- 1. Create schema
CREATE SCHEMA IF NOT EXISTS workspace;

GRANT USAGE ON SCHEMA workspace TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workspace TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workspace
  GRANT ALL ON SEQUENCES TO service_role;

-- ============================================
-- workspace.projects (linked to CRM projects)
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 🔗 Link to CRM project (auto-created when CRM project is created)
  crm_project_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
  owner_id UUID,
  task_count INTEGER DEFAULT 0,
  done_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_projects_crm ON workspace.projects(crm_project_id);
CREATE INDEX IF NOT EXISTS idx_ws_projects_status ON workspace.projects(status);

-- ============================================
-- workspace.cycles (Sprint management — NEW feature)
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  goals JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_cycles_status ON workspace.cycles(status);
CREATE INDEX IF NOT EXISTS idx_ws_cycles_dates ON workspace.cycles(start_date, end_date);

-- ============================================
-- workspace.tags
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- ============================================
-- workspace.tasks (Upgraded version of CRM workspace_tasks)
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 🔗 Links to CRM (optional — tasks can exist independently)
  crm_project_id UUID,
  crm_work_item_id UUID,
  crm_customer_name TEXT,
  crm_order_code TEXT,

  -- Task core
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog'
    CHECK (status IN ('backlog', 'ready', 'doing', 'in_review', 'done', 'quarantine', 'cancelled')),
  priority TEXT DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Flowguard features
  eisenhower_quadrant TEXT CHECK (eisenhower_quadrant IN ('Q1', 'Q2', 'Q3', 'Q4')),
  estimated_effort_hours NUMERIC(5,1),
  actual_effort_hours NUMERIC(5,1),

  -- Assignment
  assigned_to UUID,
  created_by UUID,

  -- Dates
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Relations
  project_id UUID REFERENCES workspace.projects(id) ON DELETE SET NULL,
  cycle_id UUID REFERENCES workspace.cycles(id) ON DELETE SET NULL,

  -- Organization
  sort_order INTEGER DEFAULT 0,
  category TEXT,  -- 'follow_up', 'internal', 'client_request', 'admin'

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_tasks_status ON workspace.tasks(status);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_assigned ON workspace.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_due ON workspace.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_project ON workspace.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_cycle ON workspace.tasks(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_crm_project ON workspace.tasks(crm_project_id);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_eisenhower ON workspace.tasks(eisenhower_quadrant);
CREATE INDEX IF NOT EXISTS idx_ws_tasks_priority ON workspace.tasks(priority);

-- ============================================
-- workspace.task_tags (many-to-many)
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.task_tags (
  task_id UUID NOT NULL REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES workspace.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ============================================
-- workspace.task_comments
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_comments_task ON workspace.task_comments(task_id);

-- ============================================
-- workspace.templates (Task templates — NEW feature)
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  -- Template tasks as JSONB array
  tasks JSONB DEFAULT '[]',
  -- Metadata
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- workspace.notifications
-- ============================================

CREATE TABLE IF NOT EXISTS workspace.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  related_task_id UUID REFERENCES workspace.tasks(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_notifications_user ON workspace.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ws_notifications_unread ON workspace.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- Triggers
-- ============================================

-- Auto-update project task counts
CREATE OR REPLACE FUNCTION workspace.update_project_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old project counts
  IF TG_OP = 'UPDATE' AND OLD.project_id IS NOT NULL THEN
    UPDATE workspace.projects SET
      task_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = OLD.project_id),
      done_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = OLD.project_id AND status = 'done')
    WHERE id = OLD.project_id;
  END IF;

  -- Update new project counts
  IF NEW.project_id IS NOT NULL THEN
    UPDATE workspace.projects SET
      task_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = NEW.project_id),
      done_count = (SELECT COUNT(*) FROM workspace.tasks WHERE project_id = NEW.project_id AND status = 'done')
    WHERE id = NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_task_project_count ON workspace.tasks;
CREATE TRIGGER trigger_ws_task_project_count
  AFTER INSERT OR UPDATE OF status, project_id ON workspace.tasks
  FOR EACH ROW
  EXECUTE FUNCTION workspace.update_project_counts();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION workspace.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ws_tasks_updated ON workspace.tasks;
CREATE TRIGGER trigger_ws_tasks_updated
  BEFORE UPDATE ON workspace.tasks
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ws_projects_updated ON workspace.projects;
CREATE TRIGGER trigger_ws_projects_updated
  BEFORE UPDATE ON workspace.projects
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

DROP TRIGGER IF EXISTS trigger_ws_cycles_updated ON workspace.cycles;
CREATE TRIGGER trigger_ws_cycles_updated
  BEFORE UPDATE ON workspace.cycles
  FOR EACH ROW EXECUTE FUNCTION workspace.set_updated_at();

-- ============================================
-- Cross-module trigger: CRM project → Workspace project
-- When a new project is created in CRM, auto-create a matching workspace project
-- ============================================

CREATE OR REPLACE FUNCTION workspace.auto_create_from_crm_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace.projects (crm_project_id, name, description)
  VALUES (NEW.id, NEW.title, COALESCE(NEW.description, ''))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOTE: This trigger references public.projects (CRM table)
-- Only create if the CRM projects table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    DROP TRIGGER IF EXISTS trigger_crm_project_to_workspace ON public.projects;
    CREATE TRIGGER trigger_crm_project_to_workspace
      AFTER INSERT ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION workspace.auto_create_from_crm_project();
  END IF;
END $$;

-- ============================================
-- RLS Policies (permissive for internal use)
-- ============================================

ALTER TABLE workspace.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace.notifications ENABLE ROW LEVEL SECURITY;

-- Internal app: authenticated users have full access (matches CRM pattern)
DROP POLICY IF EXISTS "ws_projects_auth" ON workspace.projects;
CREATE POLICY "ws_projects_auth" ON workspace.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_cycles_auth" ON workspace.cycles;
CREATE POLICY "ws_cycles_auth" ON workspace.cycles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_tags_auth" ON workspace.tags;
CREATE POLICY "ws_tags_auth" ON workspace.tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_tasks_auth" ON workspace.tasks;
CREATE POLICY "ws_tasks_auth" ON workspace.tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_task_tags_auth" ON workspace.task_tags;
CREATE POLICY "ws_task_tags_auth" ON workspace.task_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_comments_auth" ON workspace.task_comments;
CREATE POLICY "ws_comments_auth" ON workspace.task_comments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_templates_auth" ON workspace.templates;
CREATE POLICY "ws_templates_auth" ON workspace.templates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ws_notifications_auth" ON workspace.notifications;
CREATE POLICY "ws_notifications_auth" ON workspace.notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Seed default tags
-- ============================================

INSERT INTO workspace.tags (name, color) VALUES
  ('bug', '#EF4444'),
  ('feature', '#3B82F6'),
  ('improvement', '#8B5CF6'),
  ('urgent', '#F97316'),
  ('design', '#EC4899'),
  ('content', '#14B8A6'),
  ('development', '#6366F1'),
  ('meeting', '#F59E0B'),
  ('review', '#10B981')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- DONE. Schema workspace created successfully.
-- CRM workspace_tasks and project_tasks are UNTOUCHED.
-- Cross-module trigger: CRM project → workspace.projects auto-sync.
-- ============================================
