/**
 * Script to create the contract_documents table via Supabase admin client
 * Run once: npx tsx scripts/create-contract-documents-table.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('Creating contract_documents table...')

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
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

CREATE INDEX IF NOT EXISTS idx_contract_documents_contract_id ON contract_documents(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_milestone_id ON contract_documents(milestone_id);

ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contract_documents' AND policyname = 'Allow all for authenticated users'
    ) THEN
        CREATE POLICY "Allow all for authenticated users" ON contract_documents
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
        `
    })

    if (error) {
        // exec_sql RPC might not exist — fall back to raw query via REST
        console.log('RPC not available, trying direct table creation...')
        
        // Try to just insert a test row to check if table exists
        const { error: checkErr } = await supabase
            .from('contract_documents')
            .select('id')
            .limit(1)
        
        if (checkErr?.code === '42P01') {
            console.error('Table does not exist. Please run the migration SQL in Supabase dashboard:')
            console.log('File: supabase/migrations/20260320_contract_documents.sql')
            process.exit(1)
        } else {
            console.log('✅ Table contract_documents already exists!')
        }
    } else {
        console.log('✅ Table created successfully!')
    }
}

main().catch(console.error)
