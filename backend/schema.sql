-- =============================================================================
-- Cloudflare D1 Database Schema for Tharanitex Backend
-- Tables: roles, staff_users, role_permissions, sessions, notifications
-- =============================================================================

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS settings_audit_log;
DROP TABLE IF EXISTS store_settings;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS staff_users;
DROP TABLE IF EXISTS roles;

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

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Seed Roles
INSERT INTO roles (id, name) VALUES (1, 'Super Admin');
INSERT INTO roles (id, name) VALUES (2, 'Manager');
INSERT INTO roles (id, name) VALUES (3, 'Support Staff');

-- Seed Role Permissions (24 rows total: 3 roles x 8 modules)

-- 1. Super Admin -> Full CRUD (1, 1, 1, 1) on ALL 8 modules
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Products', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Orders', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Customers', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Shipping', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Reviews', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'CMS', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Users & Roles', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Settings', 1, 1, 1, 1);

-- 2. Manager -> Full CRUD on Products, Orders, Customers, Shipping, Reviews, CMS. View-only on Users & Roles, Settings.
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Products', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Orders', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Customers', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Shipping', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Reviews', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'CMS', 1, 1, 1, 1);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Users & Roles', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Settings', 1, 0, 0, 0);

-- 3. Support Staff -> View-only on Products, Customers, Shipping. View+Edit on Orders, Reviews. No access to CMS, Users & Roles, Settings.
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Products', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Orders', 1, 0, 1, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Customers', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Shipping', 1, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Reviews', 1, 0, 1, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'CMS', 0, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Users & Roles', 0, 0, 0, 0);
INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Settings', 0, 0, 0, 0);

-- Seed Default Super Admin Account (Password: AdminPassword123!)
-- Hash of 'AdminPassword123!' with salt 'tharanitex_staff_salt':
-- SHA256('AdminPassword123!tharanitex_staff_salt') = 6b5faefdfa8c5eb3c7dbba3e5efba2cf822a15dbca8429bb97394c8b201a073f
INSERT INTO staff_users (id, name, email, password_hash, role_id, status)
VALUES (1, 'Super Admin', 'admin@tharanitex.com', '6b5faefdfa8c5eb3c7dbba3e5efba2cf822a15dbca8429bb97394c8b201a073f', 1, 'Active');

-- Initial Notification
INSERT INTO notifications (recipient_role, title, message, type)
VALUES ('Super Admin', 'System Initialized', 'D1 Users & Roles permission system initialized successfully.', 'system');

-- =============================================================================
-- REVIEWS TABLE & INDEXES
-- =============================================================================

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reviewer_name TEXT NOT NULL,
  customer_id INTEGER,                 -- FK to customer
  user_id INTEGER,                     -- FK/alias to user
  product_id INTEGER NOT NULL,         -- FK to product
  product_name TEXT NOT NULL,          -- denormalized for fast listing/search
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,               -- review text
  review_text TEXT,                    -- review text alias
  status TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending' | 'Approved' | 'Flagged' | 'Rejected'
  flagged_reason TEXT,                 -- optional note when flagged
  reviewed_by INTEGER REFERENCES staff_users(id),  -- which admin actioned it
  reviewed_at TEXT,                    -- when action was taken
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Seed 4 Sample Review Records into Cloudflare D1 (tharanitex-db)
INSERT INTO reviews (reviewer_name, customer_id, user_id, product_id, product_name, rating, comment, review_text, status, created_at, updated_at)
VALUES ('Priya Sharma', 101, 101, 1, 'Kanjivaram Silk Saree - Crimson Red', 5, 'Absolutely gorgeous fabric quality! The golden zari border shines beautifully under light.', 'Absolutely gorgeous fabric quality! The golden zari border shines beautifully under light.', 'Approved', datetime('now', '-2 days'), datetime('now', '-2 days'));

INSERT INTO reviews (reviewer_name, customer_id, user_id, product_id, product_name, rating, comment, review_text, status, created_at, updated_at)
VALUES ('Ananya R.', 102, 102, 2, 'Banarasi Tissue Silk Saree - Gold', 4, 'Very elegant saree. Packaging was neat and delivery reached Chennai within 2 days.', 'Very elegant saree. Packaging was neat and delivery reached Chennai within 2 days.', 'Approved', datetime('now', '-1 day'), datetime('now', '-1 day'));

INSERT INTO reviews (reviewer_name, customer_id, user_id, product_id, product_name, rating, comment, review_text, status, created_at, updated_at)
VALUES ('Kavitha V.', 103, 103, 1, 'Kanjivaram Silk Saree - Crimson Red', 1, 'Received completely wrong item. Customer service line did not answer.', 'Received completely wrong item. Customer service line did not answer.', 'Pending', datetime('now', '-3 hours'), datetime('now', '-3 hours'));

INSERT INTO reviews (reviewer_name, customer_id, user_id, product_id, product_name, rating, comment, review_text, status, flagged_reason, created_at, updated_at)
VALUES ('Spam User 99', 104, 104, 3, 'Cotton Soft Saree - Pastel Blue', 5, 'Earn money working from home! Visit spam-website-link.com now for instant payout!', 'Earn money working from home! Visit spam-website-link.com now for instant payout!', 'Flagged', 'Contains suspicious external promotional spam link', datetime('now', '-5 hours'), datetime('now', '-5 hours'));

-- =============================================================================
-- PRODUCTS TABLE & SYNC COLUMNS
-- =============================================================================

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_key TEXT,
  stock INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,     -- 1 = published on storefront, 0 = draft/hidden
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_products_published ON products(is_published);

-- Seed Sample Products
INSERT INTO products (id, name, description, price_cents, image_key, stock, is_published)
VALUES (1, 'Kanjivaram Silk Saree - Crimson Red', 'Pure Mulberry silk saree handcrafted in Kanchipuram with pure gold zari thread work.', 1850000, 'products/kanjivaram-red.jpg', 15, 1);

INSERT INTO products (id, name, description, price_cents, image_key, stock, is_published)
VALUES (2, 'Banarasi Tissue Silk Saree - Gold', 'Lightweight tissue silk woven with intricate brocade floral motifs.', 1420000, 'products/banarasi-gold.jpg', 20, 1);

INSERT INTO products (id, name, description, price_cents, image_key, stock, is_published)
VALUES (3, 'Cotton Soft Saree - Pastel Blue', 'Handloom soft cotton saree suitable for daily festive wear.', 350000, 'products/cotton-blue.jpg', 30, 1);

-- =============================================================================
-- STORE SETTINGS & AUDIT LOG TABLES
-- =============================================================================

CREATE TABLE store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'general' | 'contact' | 'branding'
  key TEXT NOT NULL,                -- e.g. 'admin_email', 'accent_color', 'logo_url'
  value TEXT,                       -- text value (color hex, url, string)
  updated_by INTEGER REFERENCES staff_users(id),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(category, key)
);

CREATE TABLE settings_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER REFERENCES staff_users(id),
  changed_at TEXT DEFAULT (datetime('now'))
);

-- Seed Initial Store Settings (27 keys across 3 categories)

-- 1. General Category (4 keys)
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_name', 'Tharanitex Silks');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_type', 'Pure Silk Sarees & Handloom Textiles');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'store_tagline', 'Exquisite Kanjivaram & Banarasi Silk Sarees for Every Occasion');
INSERT INTO store_settings (category, key, value) VALUES ('general', 'currency_code', 'INR');

-- 2. Contact Category (5 keys)
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'admin_email', 'admin@tharanitex.com');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'support_email', 'support@tharanitex.com');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'phone', '+91 98765 43210');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'gstin', '33AAAAA0000A1Z5');
INSERT INTO store_settings (category, key, value) VALUES ('contact', 'store_address', '123 Silk Merchant Street, Kanchipuram, Tamil Nadu 631501');

-- 3. Branding Category - Links & Logos (5 keys)
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'logo_url', '/images/logo.png');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'favicon_url', '/favicon.ico');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'facebook_url', 'https://facebook.com/tharanitex');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'instagram_url', 'https://instagram.com/tharanitex');
INSERT INTO store_settings (category, key, value) VALUES ('branding', 'twitter_url', 'https://x.com/tharanitex');

-- 3. Branding Category - 22 Editable Theme Colors
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


