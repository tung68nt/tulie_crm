-- Migration: Add include_proposal_appendix option to contracts table
-- Allows user to toggle whether a contract generated from a proposal-type quotation
-- includes Phụ lục 02 (Đề xuất giải pháp / Proposal Appendix)

-- Default TRUE to maintain backward compatibility (existing contracts keep their proposal appendix)
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS include_proposal_appendix BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.contracts.include_proposal_appendix 
IS 'Whether to include Phụ lục 02 (Đề xuất giải pháp) when generating contract documents from a proposal-type quotation';
