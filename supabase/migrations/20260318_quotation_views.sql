-- ============================================================
-- Quotation View Tracking
-- Track who viewed quotations, duration, scroll depth, etc.
-- ============================================================

-- 1. Create quotation_views table
CREATE TABLE IF NOT EXISTS quotation_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT DEFAULT 'desktop',
    country TEXT,
    duration_seconds INTEGER DEFAULT 0,
    max_scroll_percent INTEGER DEFAULT 0,
    interactions JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast quotation lookups
CREATE INDEX IF NOT EXISTS idx_quotation_views_quotation_id ON quotation_views(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_views_started_at ON quotation_views(started_at);

-- 3. Enable RLS — only service_role (admin) can access
ALTER TABLE quotation_views ENABLE ROW LEVEL SECURITY;

-- 4. Grant access ONLY to service_role (admin)
GRANT ALL ON quotation_views TO service_role;
-- No grants to authenticated or anon — admin only

-- ============================================================
-- Portal View Tracking (separate from quotation views)
-- Portal has more content (contracts, invoices, tasks etc.)
-- ============================================================

-- 5. Create portal_views table
CREATE TABLE IF NOT EXISTS portal_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    portal_token TEXT NOT NULL,
    session_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT DEFAULT 'desktop',
    country TEXT,
    duration_seconds INTEGER DEFAULT 0,
    max_scroll_percent INTEGER DEFAULT 0,
    pages_viewed JSONB DEFAULT '[]'::jsonb,
    interactions JSONB DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_portal_views_project_id ON portal_views(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_views_customer_id ON portal_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_portal_views_portal_token ON portal_views(portal_token);
CREATE INDEX IF NOT EXISTS idx_portal_views_started_at ON portal_views(started_at);

-- 7. RLS — admin only
ALTER TABLE portal_views ENABLE ROW LEVEL SECURITY;
GRANT ALL ON portal_views TO service_role;
