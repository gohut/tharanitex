-- Clean up any existing duplicate cart items keeping the highest ID row
DELETE FROM cart_items 
WHERE rowid NOT IN (
    SELECT MAX(rowid) 
    FROM cart_items 
    GROUP BY user_id, product_id
);

-- Clean up any existing duplicate wishlist items keeping the highest ID row
DELETE FROM wishlist_items 
WHERE rowid NOT IN (
    SELECT MAX(rowid) 
    FROM wishlist_items 
    GROUP BY user_id, product_id
);

-- Unique index to prevent duplicate cart items for the same user and product
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id);

-- Unique index to prevent duplicate wishlist items for the same user and product
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_items_user_product ON wishlist_items(user_id, product_id);
