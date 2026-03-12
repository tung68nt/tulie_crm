-- ============================================
-- MIGRATION: Add metadata column to project_work_items
-- Date: 2026-03-12
-- Description: Adds JSONB metadata column to support 
--              multi-quotation linking and extensible data
-- ============================================

ALTER TABLE project_work_items 
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN project_work_items.metadata IS 'Extensible metadata: quotation_ids array for multi-quotation support, etc.';
