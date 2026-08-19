-- Add a separate mobile image for homepage hero slides

ALTER TABLE homepage_hero_slides
ADD COLUMN mobile_image_url TEXT;