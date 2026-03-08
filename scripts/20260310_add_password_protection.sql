-- Add password protection to Projects and Contracts
-- Quotations already has password_hash

ALTER TABLE projects ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing password management for quotations to be consistent if needed
-- (Assuming password_hash already exists in quotations)

-- Comment: This migration enables granular password protection for projects and contracts
-- allowing users to lock specific documents or entire portals.
