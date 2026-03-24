-- Quotation Versioning: auto-snapshot before each update for restore capability
CREATE TABLE IF NOT EXISTS quotation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL,
  change_summary text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qv_quotation ON quotation_versions(quotation_id);
CREATE INDEX IF NOT EXISTS idx_qv_created ON quotation_versions(created_at DESC);

-- Add version_number column to quotations table for tracking current version
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;
