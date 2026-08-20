-- Keep existing COD orders valid while adding fields needed for verified online payments.
ALTER TABLE orders ADD COLUMN razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN paid_at DATETIME;

CREATE UNIQUE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE UNIQUE INDEX idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- A server-side snapshot of a checkout. It prevents browser-controlled totals
-- and lets verification create exactly one application order for a Razorpay order.
CREATE TABLE checkout_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  checkout_type TEXT NOT NULL CHECK (checkout_type IN ('CART', 'BUY_NOW')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'ONLINE')),
  amount_paise INTEGER NOT NULL,
  address_id INTEGER NOT NULL,
  items_json TEXT NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'creating' CHECK (status IN ('creating', 'created', 'verifying', 'completed', 'failed')),
  completed_order_id INTEGER,
  idempotency_key TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(address_id) REFERENCES addresses(id),
  FOREIGN KEY(completed_order_id) REFERENCES orders(id)
);

CREATE INDEX idx_checkout_sessions_razorpay_order ON checkout_sessions(razorpay_order_id);
