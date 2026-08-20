-- Migration 0013: Add refund tracking columns to orders table
ALTER TABLE orders ADD COLUMN refund_status TEXT NOT NULL DEFAULT 'NOT_REQUESTED';
ALTER TABLE orders ADD COLUMN refund_id TEXT;
ALTER TABLE orders ADD COLUMN refund_amount REAL;
ALTER TABLE orders ADD COLUMN refund_requested_at TEXT;
ALTER TABLE orders ADD COLUMN refund_completed_at TEXT;
ALTER TABLE orders ADD COLUMN refund_failure_reason TEXT;
