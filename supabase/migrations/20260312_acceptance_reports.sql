-- Migration: Create acceptance_reports table
-- Required for: Nghiệm thu (acceptance reports) in project management

CREATE TABLE IF NOT EXISTS acceptance_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    report_number TEXT NOT NULL,
    report_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT DEFAULT '',
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    signed_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS idx_acceptance_reports_project_id ON acceptance_reports(project_id);

-- Enable RLS
ALTER TABLE acceptance_reports ENABLE ROW LEVEL SECURITY;

-- RLS policy: allow all for authenticated users
CREATE POLICY "Authenticated users can manage acceptance_reports"
    ON acceptance_reports
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
