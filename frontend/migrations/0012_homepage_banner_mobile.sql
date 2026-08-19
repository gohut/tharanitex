-- Migration number: 0012
-- Add a separate mobile image for homepage promo banners

ALTER TABLE homepage_banners
ADD COLUMN mobile_image_url TEXT;