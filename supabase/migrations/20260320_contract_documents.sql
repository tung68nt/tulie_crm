-- Contract Documents: auto-generated documents for each contract
-- Each contract type has a different bundle of documents
CREATE TABLE IF NOT EXISTS contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('contract', 'order', 'payment_request', 'delivery_minutes')),
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE CASCADE,
    doc_number TEXT,
    content TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by contract
CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON contract_documents(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_milestone_id ON contract_documents(milestone_id);

-- RLS: disable for now (internal table, accessed via admin client)
ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON contract_documents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
