-- Add representative_title column to customers table
-- Stores honorific prefix: Ông, Bà, etc.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS representative_title TEXT;
