-- frontend/migrations/0025_product_variant_images.sql

CREATE TABLE IF NOT EXISTS product_variant_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variant_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_variant_images_variant
ON product_variant_images(variant_id);

-- Safely populate initial variant images from existing product_variants.image_url data
INSERT INTO product_variant_images (variant_id, image_url, sort_order, is_primary)
SELECT id, image_url, 0, 1
FROM product_variants
WHERE image_url IS NOT NULL AND TRIM(image_url) != '';
