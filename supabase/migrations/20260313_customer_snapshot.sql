-- Add customer_snapshot JSON column to contracts table
-- This stores a frozen copy of customer info at the time the contract was created
-- Prevents data loss when customer updates their info later via portal

ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS customer_snapshot jsonb;

-- Backfill existing contracts with current customer data
UPDATE contracts c
SET customer_snapshot = jsonb_build_object(
  'company_name', cust.company_name,
  'tax_code', cust.tax_code,
  'email', cust.email,
  'phone', cust.phone,
  'address', cust.address,
  'invoice_address', cust.invoice_address,
  'representative', cust.representative,
  'position', cust.position
)
FROM customers cust
WHERE c.customer_id = cust.id
AND c.customer_snapshot IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN contracts.customer_snapshot IS 'Frozen customer info at contract creation time. Used for document generation to prevent data drift.';
