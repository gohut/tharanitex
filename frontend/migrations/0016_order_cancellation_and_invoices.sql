-- Backward-compatible order lifecycle additions.  No existing data is removed.
ALTER TABLE orders ADD COLUMN cancellation_status TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN cancellation_requested_at DATETIME;
ALTER TABLE orders ADD COLUMN cancellation_decided_at DATETIME;
ALTER TABLE orders ADD COLUMN cancelled_at DATETIME;
ALTER TABLE orders ADD COLUMN cancelled_by TEXT;
ALTER TABLE orders ADD COLUMN delivered_at DATETIME;
ALTER TABLE orders ADD COLUMN invoice_number TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_cancellation_status ON orders(cancellation_status);
