ALTER TABLE contract_documents ADD COLUMN IF NOT EXISTS is_visible_on_portal BOOLEAN DEFAULT true;
