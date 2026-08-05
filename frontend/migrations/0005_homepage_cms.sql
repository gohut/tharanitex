-- Migration number: 0005
CREATE TABLE IF NOT EXISTS homepage_hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    button_text TEXT,
    button_link TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    link TEXT,
    placement TEXT NOT NULL DEFAULT 'promo',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS homepage_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO homepage_hero_slides (image_url, sort_order, is_active)
VALUES
('/assets/hero/hero1.jpg', 1, 1);

INSERT OR IGNORE INTO homepage_banners (image_url, placement, sort_order, is_active)
VALUES
('/assets/banners/banner1.png', 'promo_1', 1, 1),
('/assets/banners/banner2.png', 'promo_2', 2, 1);

INSERT OR IGNORE INTO homepage_settings (key, value)
VALUES
('categories_title', 'Explore Elegance'),
('categories_subtitle', 'Discover handcrafted sarees where timeless tradition meets effortless elegance.'),
('why_title', 'Crafted With Heritage'),
('why_heading', 'Crafted With Heritage'),
('why_subtitle', 'For those who appreciate timeless craftsmanship'),
('why_features', '[{"title":"Pure Silk","description":"Finest quality silk. Timeless, soft and smooth."},{"title":"Authenticity","description":"Pure saree work that reflects tradition."},{"title":"Handwoven","description":"Meticulously handwoven by skilled artisans."}]');
