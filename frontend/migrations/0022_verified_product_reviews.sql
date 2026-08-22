    -- Verified product review support.
-- A review must reference the delivered order used
-- to verify the purchase.

ALTER TABLE reviews ADD COLUMN order_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_reviews_order_id
ON reviews(order_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_product
ON reviews(user_id, product_id);