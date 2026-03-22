-- ============================================
-- MIGRATION: Create workforce schema
-- Date: 2026-03-22
-- Description: Tạo schema workforce trong cùng Supabase project CRM
--   để Tulie Workforce (AI Agents, n8n, FB Ads) dùng chung database.
--   KHÔNG ảnh hưởng bất kỳ bảng nào trong schema public (CRM).
-- ============================================

-- 1. Create schema
CREATE SCHEMA IF NOT EXISTS workforce;

-- Grant access to Supabase roles
GRANT USAGE ON SCHEMA workforce TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA workforce TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA workforce
  GRANT ALL ON SEQUENCES TO service_role;

-- Enable extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ENUMs (prefixed to avoid conflicts with public schema)
-- ============================================

DO $$ BEGIN
  CREATE TYPE workforce.agent_role AS ENUM (
    'developer', 'marketing', 'admin', 'sales', 'support', 'analyst', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.agent_status AS ENUM ('active', 'inactive', 'training');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.thread_source AS ENUM ('web', 'telegram');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.thread_status AS ENUM ('active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.document_type AS ENUM ('pdf', 'docx', 'txt', 'markdown', 'url');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.document_status AS ENUM ('processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.memory_type AS ENUM ('fact', 'preference', 'sop', 'reflection');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.org_role AS ENUM ('owner', 'manager', 'specialist', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE workforce.approval_status AS ENUM ('pending_review', 'approved', 'rejected', 'changes_requested');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- workforce.organizations
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- workforce.profiles (linked to auth.users AND public.users)
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 🔗 Link to CRM user (same person, different context)
  crm_user_id UUID,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  telegram_user_id BIGINT UNIQUE,
  telegram_username TEXT,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- workforce.organization_members
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES workforce.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  role workforce.org_role NOT NULL DEFAULT 'specialist',
  invited_by UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wf_org_members_org ON workforce.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_wf_org_members_user ON workforce.organization_members(user_id);

-- ============================================
-- workforce.agents
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role workforce.agent_role NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  tools JSONB DEFAULT '[]',
  knowledge_base_ids UUID[] DEFAULT '{}',
  status workforce.agent_status DEFAULT 'active',
  total_tasks INTEGER DEFAULT 0,
  successful_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_agents_user ON workforce.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_agents_org ON workforce.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_wf_agents_status ON workforce.agents(status);

-- ============================================
-- workforce.threads
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  title TEXT,
  source workforce.thread_source NOT NULL,
  status workforce.thread_status DEFAULT 'active',
  telegram_chat_id BIGINT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_threads_user ON workforce.threads(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_threads_agent ON workforce.threads(agent_id);

-- ============================================
-- workforce.messages
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES workforce.threads(id) ON DELETE CASCADE,
  role workforce.message_role NOT NULL,
  content TEXT NOT NULL,
  reasoning TEXT,
  tool_calls JSONB,
  telegram_message_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_messages_thread ON workforce.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_wf_messages_created ON workforce.messages(created_at DESC);

-- ============================================
-- workforce.tasks
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  thread_id UUID REFERENCES workforce.threads(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority workforce.task_priority DEFAULT 'medium',
  status workforce.task_status DEFAULT 'pending',
  -- Approval workflow
  approver_id UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  approval_status workforce.approval_status,
  feedback_note TEXT,
  created_by UUID REFERENCES workforce.profiles(id) ON DELETE SET NULL,
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_tasks_user ON workforce.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_agent ON workforce.tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_status ON workforce.tasks(status);
CREATE INDEX IF NOT EXISTS idx_wf_tasks_org ON workforce.tasks(organization_id);

-- ============================================
-- workforce.documents (Knowledge Base)
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type workforce.document_type NOT NULL,
  file_url TEXT,
  original_filename TEXT,
  file_size INTEGER,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  status workforce.document_status DEFAULT 'processing',
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_documents_user ON workforce.documents(user_id);

-- ============================================
-- workforce.document_embeddings (Vector search)
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES workforce.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_embeddings_doc ON workforce.document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_wf_embeddings_user ON workforce.document_embeddings(user_id);

-- ============================================
-- workforce.memories (Long-term memory engine)
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES workforce.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES workforce.agents(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE SET NULL,
  type workforce.memory_type NOT NULL DEFAULT 'fact',
  content TEXT NOT NULL,
  embedding vector(1536),
  importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('public', 'private')),
  metadata JSONB DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('task', 'manual', 'document', 'reflection')),
  source_ref TEXT,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wf_memories_user ON workforce.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_memories_agent ON workforce.memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_wf_memories_type ON workforce.memories(type);
CREATE INDEX IF NOT EXISTS idx_wf_memories_importance ON workforce.memories(importance DESC);

-- ============================================
-- workforce.agent_alerts (Cross-module alerts)
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.agent_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FB Ads Management Tables
-- ============================================

CREATE TABLE IF NOT EXISTS workforce.fb_ad_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES workforce.organizations(id) ON DELETE CASCADE,
  fb_account_id TEXT NOT NULL UNIQUE,
  fb_account_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  daily_budget_limit NUMERIC(15,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workforce.fb_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_account_id UUID REFERENCES workforce.fb_ad_accounts(id) ON DELETE CASCADE,
  fb_campaign_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  objective TEXT,
  status TEXT DEFAULT 'ACTIVE',
  daily_budget NUMERIC(15,2),
  lifetime_budget NUMERIC(15,2),
  -- Metrics
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0,
  cpm NUMERIC(15,2) DEFAULT 0,
  -- Thresholds
  cpr_threshold NUMERIC(15,2),
  cpr_alert_sent BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wf_fb_campaigns_account ON workforce.fb_campaigns(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_wf_fb_campaigns_status ON workforce.fb_campaigns(status);

CREATE TABLE IF NOT EXISTS workforce.fb_adsets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id) ON DELETE CASCADE,
  fb_adset_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT,
  daily_budget NUMERIC(15,2),
  targeting JSONB,
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workforce.fb_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adset_id UUID REFERENCES workforce.fb_adsets(id) ON DELETE CASCADE,
  fb_ad_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT,
  creative_type TEXT,
  creative_url TEXT,
  creative_text TEXT,
  spend NUMERIC(15,2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  cpr NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workforce.fb_agent_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES workforce.agents(id),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id),
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  status TEXT DEFAULT 'executed' CHECK (status IN ('proposed', 'executed', 'rejected', 'failed')),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workforce.fb_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES workforce.fb_campaigns(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Functions
-- ============================================

-- Thread stats auto-update
CREATE OR REPLACE FUNCTION workforce.update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workforce.threads
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wf_update_thread_stats ON workforce.messages;
CREATE TRIGGER trigger_wf_update_thread_stats
  AFTER INSERT ON workforce.messages
  FOR EACH ROW
  EXECUTE FUNCTION workforce.update_thread_stats();

-- Auto-set org_id on task creation
CREATE OR REPLACE FUNCTION workforce.set_task_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT p.organization_id INTO NEW.organization_id
    FROM workforce.profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wf_set_task_org ON workforce.tasks;
CREATE TRIGGER trigger_wf_set_task_org
  BEFORE INSERT ON workforce.tasks
  FOR EACH ROW
  EXECUTE FUNCTION workforce.set_task_org_id();

-- Vector similarity search for documents
CREATE OR REPLACE FUNCTION workforce.search_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    (1 - (de.embedding <=> query_embedding))::FLOAT AS similarity
  FROM workforce.document_embeddings de
  WHERE
    (filter_user_id IS NULL OR de.user_id = filter_user_id)
    AND (1 - (de.embedding <=> query_embedding)) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Memory similarity search
CREATE OR REPLACE FUNCTION workforce.match_memories(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.65,
  match_count INT DEFAULT 10,
  filter_user_id UUID DEFAULT NULL,
  filter_agent_id UUID DEFAULT NULL,
  filter_org_id UUID DEFAULT NULL,
  filter_types workforce.memory_type[] DEFAULT NULL,
  filter_access_level TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  agent_id UUID,
  type workforce.memory_type,
  content TEXT,
  importance FLOAT,
  access_level TEXT,
  source TEXT,
  source_ref TEXT,
  similarity FLOAT,
  weighted_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.agent_id,
    m.type,
    m.content,
    m.importance,
    m.access_level,
    m.source,
    m.source_ref,
    (1 - (m.embedding <=> query_embedding))::FLOAT AS similarity,
    (
      (1 - (m.embedding <=> query_embedding)) *
      m.importance *
      CASE WHEN m.type = 'preference' THEN 1.5 ELSE 1.0 END
    )::FLOAT AS weighted_score
  FROM workforce.memories m
  WHERE
    m.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR m.user_id = filter_user_id)
    AND (filter_agent_id IS NULL OR m.agent_id = filter_agent_id)
    AND (filter_org_id IS NULL OR m.organization_id = filter_org_id)
    AND (filter_types IS NULL OR m.type = ANY(filter_types))
    AND (filter_access_level IS NULL OR m.access_level = filter_access_level)
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY weighted_score DESC
  LIMIT match_count;
END;
$$;

-- Touch memory helper
CREATE OR REPLACE FUNCTION workforce.touch_memory(memory_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE workforce.memories
  SET
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE id = memory_id;
END;
$$;

-- Helper: get user org role
CREATE OR REPLACE FUNCTION workforce.get_user_org_role(p_user_id UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  role workforce.org_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    om.role
  FROM workforce.organization_members om
  JOIN workforce.organizations o ON o.id = om.organization_id
  WHERE om.user_id = p_user_id
  LIMIT 1;
END;
$$;

-- Helper: check admin
CREATE OR REPLACE FUNCTION workforce.is_org_admin(p_user_id UUID, p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM workforce.organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_org_id
      AND role IN ('owner', 'manager')
  );
$$;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE workforce.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.fb_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workforce.agent_alerts ENABLE ROW LEVEL SECURITY;

-- Service role bypass all (for n8n, AI agents via service_role key)
-- Authenticated users: scoped by user/org

CREATE POLICY "wf_profiles_own" ON workforce.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "wf_agents_view" ON workforce.agents
  FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
  );
CREATE POLICY "wf_agents_create" ON workforce.agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wf_agents_update" ON workforce.agents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wf_agents_delete" ON workforce.agents
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "wf_tasks_view" ON workforce.tasks
  FOR SELECT USING (
    user_id = auth.uid() OR approver_id = auth.uid()
    OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
  );
CREATE POLICY "wf_tasks_create" ON workforce.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wf_tasks_update" ON workforce.tasks
  FOR UPDATE USING (
    user_id = auth.uid() OR approver_id = auth.uid()
    OR (organization_id IS NOT NULL AND workforce.is_org_admin(auth.uid(), organization_id))
  );

CREATE POLICY "wf_threads_own" ON workforce.threads
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "wf_messages_own" ON workforce.messages
  FOR ALL USING (
    thread_id IN (SELECT id FROM workforce.threads WHERE user_id = auth.uid())
  );

CREATE POLICY "wf_documents_own" ON workforce.documents
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "wf_embeddings_own" ON workforce.document_embeddings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "wf_memories_view" ON workforce.memories
  FOR SELECT USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND (
      workforce.is_org_admin(auth.uid(), organization_id) OR access_level = 'public'
    ))
  );
CREATE POLICY "wf_memories_create" ON workforce.memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wf_memories_delete" ON workforce.memories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "wf_orgs_view" ON workforce.organizations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM workforce.organization_members WHERE organization_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "wf_org_members_view" ON workforce.organization_members
  FOR SELECT USING (
    organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
  );
CREATE POLICY "wf_org_members_manage" ON workforce.organization_members
  FOR ALL USING (workforce.is_org_admin(auth.uid(), organization_id));

-- FB tables: accessible to org members
CREATE POLICY "wf_fb_accounts_org" ON workforce.fb_ad_accounts
  FOR ALL USING (
    organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
  );

CREATE POLICY "wf_fb_campaigns_org" ON workforce.fb_campaigns
  FOR ALL USING (
    ad_account_id IN (
      SELECT id FROM workforce.fb_ad_accounts
      WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
    )
  );

CREATE POLICY "wf_fb_adsets_org" ON workforce.fb_adsets
  FOR ALL USING (
    campaign_id IN (SELECT id FROM workforce.fb_campaigns WHERE ad_account_id IN (
      SELECT id FROM workforce.fb_ad_accounts
      WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
    ))
  );

CREATE POLICY "wf_fb_ads_org" ON workforce.fb_ads
  FOR ALL USING (
    adset_id IN (SELECT id FROM workforce.fb_adsets WHERE campaign_id IN (
      SELECT id FROM workforce.fb_campaigns WHERE ad_account_id IN (
        SELECT id FROM workforce.fb_ad_accounts
        WHERE organization_id IN (SELECT om.organization_id FROM workforce.organization_members om WHERE om.user_id = auth.uid())
      )
    ))
  );

CREATE POLICY "wf_fb_actions_view" ON workforce.fb_agent_actions
  FOR SELECT USING (true);

CREATE POLICY "wf_fb_alerts_view" ON workforce.fb_alerts
  FOR SELECT USING (true);

CREATE POLICY "wf_agent_alerts_view" ON workforce.agent_alerts
  FOR SELECT USING (true);

-- ============================================
-- DONE. Schema workforce created successfully.
-- CRM public schema is UNTOUCHED.
-- ============================================
