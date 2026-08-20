-- Ensure all cancellation, refund, and tracking columns exist on the orders table
-- Adding cancelled_by which was missing from dynamic runtime patches

ALTER TABLE orders ADD COLUMN cancelled_by TEXT;

-- Backup index definitions
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_by ON orders(cancelled_by);
