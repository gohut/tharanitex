-- =============================================================================
-- Cloudflare D1 Database Merged Schema for Tharanitex Frontend & Backend
-- =============================================================================

PRAGMA defer_foreign_keys=TRUE;

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS settings_audit_log;
DROP TABLE IF EXISTS store_settings;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS staff_users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS d1_migrations;

-- 1. Roles Table
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,          -- 'Super Admin' | 'Manager' | 'Support Staff'
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Staff Users Table
CREATE TABLE staff_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  status TEXT NOT NULL DEFAULT 'Active',   -- 'Active' | 'Inactive'
  last_login TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. Role Permissions Table
CREATE TABLE role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  module TEXT NOT NULL,               -- Products, Orders, Customers, Shipping, Reviews, CMS, Users & Roles, Settings
  can_view INTEGER DEFAULT 0,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0
);

-- 4. Sessions Table (D1-backed durable session store)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,               -- uuid
  user_id INTEGER NOT NULL,          -- FK -> staff_users.id or customers.id
  user_type TEXT NOT NULL,           -- 'admin' | 'customer'
  token_hash TEXT NOT NULL,          -- hashed token only, never store raw token
  ip_address TEXT,
  user_agent TEXT,
  is_revoked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

-- 5. Notifications Table
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_role TEXT,               -- specific role name, or NULL = all roles
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,                         -- 'order' | 'system' | 'security' | 'user'
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Categories Table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products Table (Merged: containing both backend and frontend columns)
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL NOT NULL,                 -- Frontend: e.g. 2999.00
  price_cents INTEGER DEFAULT 0,       -- Backend: price in cents
  compare_price REAL,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  material TEXT,
  color TEXT,
  occasion TEXT,
  featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,      -- Backend alias for is_active
  image_key TEXT,                      -- Backend image R2 key
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published);

-- 8. Product Images Table
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- 9. Customer Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Addresses Table
CREATE TABLE addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default INTEGER DEFAULT 0
);

-- 11. Wishlist Table
CREATE TABLE wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- 12. Cart Table
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user ON cart(user_id);

-- 13. Orders Table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_id INTEGER NOT NULL REFERENCES addresses(id),
  total_amount REAL NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'placed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);

-- 14. Order Items Table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);

-- 15. Reviews Table (Merged)
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_name TEXT NOT NULL,
  customer_id INTEGER,
  user_id INTEGER,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  review_text TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  flagged_reason TEXT,
  reviewed_by INTEGER REFERENCES staff_users(id),
  reviewed_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- 16. Store Settings Table
CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'general' | 'contact' | 'branding'
  key TEXT NOT NULL,                -- e.g. 'admin_email', 'accent_color'
  value TEXT,
  updated_by INTEGER REFERENCES staff_users(id),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(category, key)
);

-- 17. Settings Audit Log Table
CREATE TABLE settings_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER REFERENCES staff_users(id),
  changed_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed Roles
INSERT INTO roles (id, name) VALUES (1, 'Super Admin');
INSERT INTO roles (id, name) VALUES (2, 'Manager');
INSERT INTO roles (id, name) VALUES (3, 'Support Staff');

-- Seed Role Permissions (24 rows total: 3 roles x 8 modules)
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Products', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Orders', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Customers', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Shipping', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Reviews', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'CMS', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Users & Roles', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Settings', 1, 1, 1, 1);

INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Products', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Orders', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Customers', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Shipping', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Reviews', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'CMS', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Users & Roles', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Settings', 1, 0, 0, 0);

INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Products', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Orders', 1, 0, 1, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Customers', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Shipping', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Reviews', 1, 0, 1, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'CMS', 0, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Users & Roles', 0, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Settings', 0, 0, 0, 0);

-- Seed Default Super Admin Account (Password: AdminPassword123!)
INSERT INTO staff_users (id, name, email, password_hash, role_id, status)
VALUES (1, 'Super Admin', 'admin@tharanitex.com', '6b5faefdfa8c5eb3c7dbba3e5efba2cf822a15dbca8429bb97394c8b201a073f', 1, 'Active');

-- Initial Notification
INSERT INTO notifications (recipient_role, title, message, type)
VALUES ('Super Admin', 'System Initialized', 'D1 Users & Roles permission system initialized successfully.', 'system');

-- Seed Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active) VALUES
(1, 'Silk Sarees', 'silk-sarees', 'Elegant premium silk sarees for weddings and special occasions.', '/assets/categories/silk.jpg', 1),
(2, 'Cotton Sarees', 'cotton-sarees', 'Comfortable and lightweight cotton sarees for daily wear.', '/assets/categories/cotton.jpg', 1),
(3, 'Wedding Collection', 'wedding', 'Wedding Collection and gorgeous sarees.', '/assets/categories/wedding.jpg', 1);

-- Seed Products
INSERT INTO products (id, category_id, name, slug, description, price, price_cents, compare_price, stock, featured, is_active, is_published, image_key) VALUES
(1, 1, 'Banarasi Silk Saree', 'banarasi-silk-saree', 'Premium Banarasi Silk Saree', 2999.00, 299900, NULL, 20, 1, 1, 1, 'products/banarasi-gold.jpg'),
(2, 1, 'Kanchipuram Silk Saree', 'kanchipuram-silk-saree', 'Traditional Kanchipuram Silk Saree', 4599.00, 459900, NULL, 15, 1, 1, 1, 'products/kanjivaram-red.jpg'),
(3, 2, 'Chettinad Cotton Saree', 'chettinad-cotton-saree', 'Pure Cotton Saree', 1799.00, 179900, NULL, 25, 1, 1, 1, 'products/cotton-blue.jpg'),
(4, 3, 'Bridal Designer Saree', 'bridal-designer-saree', 'Wedding Collection', 6999.00, 699900, NULL, 8, 1, 1, 1, 'products/banarasi-gold.jpg');

-- Seed Product Images
INSERT INTO product_images (id, product_id, image_url, sort_order) VALUES
(1, 1, '/assets/sarees/thirubuvanam.png', 0),
(2, 2, '/assets/sarees/kanchipuram.png', 0),
(3, 3, '/assets/sarees/banaras1.png', 0),
(4, 4, '/assets/sarees/banaras2.png', 0);

-- Seed Reviews
INSERT INTO reviews (reviewer_name, customer_id, user_id, product_id, product_name, rating, comment, review_text, status) VALUES
('Priya Sharma', 101, 101, 1, 'Banarasi Silk Saree', 5, 'Absolutely gorgeous fabric quality! The golden zari border shines beautifully under light.', 'Absolutely gorgeous fabric quality! The golden zari border shines beautifully under light.', 'Approved'),
('Ananya R.', 102, 102, 2, 'Kanchipuram Silk Saree', 4, 'Very elegant saree. Packaging was neat and delivery reached Chennai within 2 days.', 'Very elegant saree. Packaging was neat and delivery reached Chennai within 2 days.', 'Approved'),
('Kavitha V.', 103, 103, 1, 'Banarasi Silk Saree', 1, 'Received completely wrong item. Customer service line did not answer.', 'Received completely wrong item. Customer service line did not answer.', 'Pending'),
('Spam User 99', 104, 104, 3, 'Chettinad Cotton Saree', 5, 'Earn money working from home! Visit spam-website-link.com now for instant payout!', 'Earn money working from home! Visit spam-website-link.com now for instant payout.', 'Flagged');

-- Seed Store Settings (27 keys across 3 categories)
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_name', 'Tharanitex Silks');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_type', 'Pure Silk Sarees & Handloom Textiles');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_tagline', 'Exquisite Kanjivaram & Banarasi Silk Sarees for Every Occasion');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'currency_code', 'INR');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'admin_email', 'admin@tharanitex.com');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'support_email', 'support@tharanitex.com');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'phone', '+91 98765 43210');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'gstin', '33AAAAA0000A1Z5');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'store_address', '123 Silk Merchant Street, Kanchipuram, Tamil Nadu 631501');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'logo_url', '/images/logo.png');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'favicon_url', '/favicon.ico');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'facebook_url', 'https://facebook.com/tharanitex');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'instagram_url', 'https://instagram.com/tharanitex');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'twitter_url', 'https://x.com/tharanitex');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'primary_background', '#0F172A');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'secondary_background', '#1E293B');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'surface_color', '#1E293B');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'hover_surface', '#334155');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'page_background', '#090D16');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'elevated_background', '#1E293B');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'major_text_color', '#F8FAFC');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'minor_text_color', '#94A3B8');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'soft_text_color', '#CBD5E1');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'muted_text_color', '#64748B');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'accent_color', '#D97706');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'accent_hover_color', '#B45309');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'accent_text_color', '#FFFFFF');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'success_color', '#10B981');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'info_color', '#3B82F6');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'warning_color', '#F59E0B');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'danger_color', '#EF4444');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'purple_status_color', '#8B5CF6');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'orange_status_color', '#F97316');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'neutral_status_color', '#64748B');
