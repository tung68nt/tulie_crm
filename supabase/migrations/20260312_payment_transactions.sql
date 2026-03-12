-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- Lưu mọi giao dịch từ SePay webhook & sync
-- Dùng chung cho cả Tulie Studio & Tulie Lab
-- ============================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,                                      -- ID giao dịch từ SePay
  gateway TEXT,                                             -- Brand name ngân hàng (Vietinbank, MB...)
  transaction_date TIMESTAMPTZ DEFAULT NOW(),               -- Thời gian giao dịch phía ngân hàng
  account_number TEXT,                                      -- Số tài khoản ngân hàng
  sub_account TEXT,                                         -- Tài khoản phụ (VA / định danh)
  code TEXT,                                                -- Mã đơn hàng match được (DH_25_...)
  content TEXT,                                             -- Nội dung chuyển khoản
  transfer_type TEXT DEFAULT 'in' CHECK (transfer_type IN ('in', 'out')),
  amount_in NUMERIC DEFAULT 0,                              -- Số tiền vào
  amount_out NUMERIC DEFAULT 0,                             -- Số tiền ra
  accumulated NUMERIC,                                      -- Số dư lũy kế
  reference_code TEXT,                                      -- Mã tham chiếu SMS
  description TEXT,                                         -- Toàn bộ nội dung SMS
  source_system TEXT DEFAULT 'unknown' CHECK (source_system IN ('studio', 'lab', 'unknown')),
  matched_order_id UUID REFERENCES retail_orders(id) ON DELETE SET NULL,
  matched_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_pt_code ON payment_transactions(code);
CREATE INDEX IF NOT EXISTS idx_pt_transaction_date ON payment_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pt_matched_order ON payment_transactions(matched_order_id) WHERE matched_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pt_matched_invoice ON payment_transactions(matched_invoice_id) WHERE matched_invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pt_source_system ON payment_transactions(source_system);
CREATE INDEX IF NOT EXISTS idx_pt_transfer_type ON payment_transactions(transfer_type);

COMMENT ON TABLE payment_transactions IS 'Giao dịch ngân hàng từ SePay webhook & sync API. Dùng chung cho Tulie Studio & Tulie Lab.';
COMMENT ON COLUMN payment_transactions.source_system IS 'Xác định hệ thống: studio (TLS prefix) hoặc lab (TLL prefix) trong nội dung CK';
COMMENT ON COLUMN payment_transactions.code IS 'Mã đơn hàng được extract từ nội dung CK, ví dụ DH_25_0312_812_179';
