-- ================================================================
-- B2B Sales Lifecycle Migration
-- Run this in Supabase SQL Editor
-- ================================================================

-- ============================================
-- Phase 2: Contract status expansion
-- ============================================

-- Add signed_date to contracts (if not exists)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_date TIMESTAMPTZ;

-- ============================================
-- Phase 3: Invoice → tracking-only
-- ============================================

-- Add project_id to invoices (link invoice to project for ROI)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);

-- Add paid_amount to invoices (if not exists)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Add pdf_url and lookup_info to invoices (if not exists)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS lookup_info TEXT;

-- ============================================
-- Phase 6: Helpdesk — support_tickets
-- ============================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    assigned_to UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT NOT NULL DEFAULT 'support' CHECK (category IN ('bug', 'feature', 'support', 'warranty', 'other')),
    created_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Phase 6: Helpdesk — ticket_messages
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL DEFAULT 'staff' CHECK (sender_type IN ('staff', 'customer')),
    sender_name TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON support_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Support tickets: authenticated users can do everything
CREATE POLICY "Authenticated users can view tickets"
    ON support_tickets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tickets"
    ON support_tickets FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets"
    ON support_tickets FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tickets"
    ON support_tickets FOR DELETE TO authenticated USING (true);

-- Ticket messages: authenticated users can do everything
CREATE POLICY "Authenticated users can view messages"
    ON ticket_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create messages"
    ON ticket_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update messages"
    ON ticket_messages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete messages"
    ON ticket_messages FOR DELETE TO authenticated USING (true);

-- ============================================
-- Updated_at trigger for support_tickets
-- ============================================

CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_support_ticket_updated_at ON support_tickets;
CREATE TRIGGER trigger_update_support_ticket_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_updated_at();
