-- Create quotation type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quotation_type_enum') THEN
        CREATE TYPE quotation_type_enum AS ENUM ('standard', 'proposal');
    END IF;
END$$;

-- Add new columns to quotations table
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS type quotation_type_enum DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS proposal_content JSONB;

-- Comment on columns
COMMENT ON COLUMN public.quotations.type IS 'Type of quotation: standard (itemized) or proposal (rich text document)';
COMMENT ON COLUMN public.quotations.proposal_content IS 'JSON content containing blocks for proposal-type quotations (scope, timeline, team, etc)';
