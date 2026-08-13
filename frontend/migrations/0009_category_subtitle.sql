-- Migration number: 0009
-- Add optional subtitle text for homepage category cards.

ALTER TABLE categories ADD COLUMN subtitle TEXT DEFAULT '';

UPDATE categories
SET subtitle = CASE slug
  WHEN 'silk-sarees' THEN 'SILKS'
  WHEN 'cotton-sarees' THEN 'COTTONS'
  WHEN 'wedding' THEN 'WEDDING'
  ELSE ''
END
WHERE slug IN ('silk-sarees', 'cotton-sarees', 'wedding');
