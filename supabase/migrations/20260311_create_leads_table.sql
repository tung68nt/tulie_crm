-- Create leads table for landing page consultation form submissions
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    business_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source TEXT DEFAULT 'landing_page',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the public landing page form)
CREATE POLICY "Allow anonymous insert" ON leads
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access" ON leads
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Index for listing
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
