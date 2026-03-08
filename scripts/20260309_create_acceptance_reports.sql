-- Create acceptance_reports table for Agency B2B module
CREATE TABLE IF NOT EXISTS public.acceptance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    report_number TEXT NOT NULL UNIQUE,
    report_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.acceptance_reports ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (team members)
CREATE POLICY "Enable all for authenticated users" ON public.acceptance_reports
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy for public access (customer portal) - Read Only
CREATE POLICY "Enable read for public by token via project" ON public.acceptance_reports
    FOR SELECT
    TO public
    USING (
        project_id IN (
            SELECT project_id FROM public.quotations WHERE public_token IS NOT NULL
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_acceptance_reports_updated_at ON public.acceptance_reports;
CREATE TRIGGER set_acceptance_reports_updated_at
    BEFORE UPDATE ON public.acceptance_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
