CREATE TABLE IF NOT EXISTS homepage_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  section_type TEXT NOT NULL,

  reference_id INTEGER,

  sort_order INTEGER NOT NULL DEFAULT 0,

  is_active INTEGER NOT NULL DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_homepage_sections_sort_order
ON homepage_sections(sort_order);

INSERT INTO homepage_sections
(section_type, reference_id, sort_order, is_active)
VALUES
('hero', NULL, 1, 1),

('categories', NULL, 2, 1),

(
  'banner',
  (SELECT id FROM homepage_banners WHERE placement = 'promo_1' LIMIT 1),
  3,
  1
),

('new_arrivals', NULL, 4, 1),

(
  'banner',
  (SELECT id FROM homepage_banners WHERE placement = 'promo_2' LIMIT 1),
  5,
  1
),

('best_sellers', NULL, 6, 1),

('why_tharani', NULL, 7, 1);