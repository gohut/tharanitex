-- Migration number: 0004
ALTER TABLE products ADD COLUMN is_new_arrival INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN is_best_seller INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival, is_active);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller, is_active);
