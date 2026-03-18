-- Add signed_date to contracts (may already exist)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_date DATE;

-- Add abbreviation to customers for document number generation
ALTER TABLE customers ADD COLUMN IF NOT EXISTS abbreviation TEXT;
