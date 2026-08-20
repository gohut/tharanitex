-- Migration number: 0013
-- Add CMS-controlled row count for product showcase sections

ALTER TABLE homepage_sections
ADD COLUMN row_count INTEGER NOT NULL DEFAULT 1;