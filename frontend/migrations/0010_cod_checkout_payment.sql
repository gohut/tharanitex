-- Temporary checkout payment selection. UPI/Card remain unavailable in the UI,
-- while COD orders persist their chosen method alongside the existing status fields.
ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'COD';
