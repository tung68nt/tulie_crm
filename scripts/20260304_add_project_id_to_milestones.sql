-- Add project_id to contract_milestones to support project-level work/payment tracking
ALTER TABLE contract_milestones ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Optional: If a milestone belongs to a contract, and that contract belongs to a project,
-- we can auto-fill project_id for existing milestones.
UPDATE contract_milestones cm
SET project_id = c.project_id
FROM contracts c
WHERE cm.contract_id = c.id AND cm.project_id IS NULL AND c.project_id IS NOT NULL;
