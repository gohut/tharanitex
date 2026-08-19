-- frontend/migrations/0014_product_variants.sql

CREATE TABLE product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE INDEX idx_product_variants_product
ON product_variants(product_id);

ALTER TABLE cart_items
ADD COLUMN variant_id INTEGER;

CREATE INDEX idx_cart_items_variant
ON cart_items(variant_id);

ALTER TABLE order_items
ADD COLUMN variant_id INTEGER;

CREATE INDEX idx_order_items_variant
ON order_items(variant_id);