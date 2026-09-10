-- Migration number: 0024 	 2026-08-14T00:00:00.000Z
-- =============================================================================
-- Authentication, Staff Users, Roles & Durable Sessions
-- =============================================================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,          -- 'Super Admin' | 'Manager' | 'Support Staff'
  created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Staff Users Table
CREATE TABLE IF NOT EXISTS staff_users (
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
CREATE TABLE IF NOT EXISTS role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  module TEXT NOT NULL,               -- Products, Orders, Customers, Shipping, Reviews, CMS, Users & Roles, Settings
  can_view INTEGER DEFAULT 0,
  can_create INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  UNIQUE(role_id, module)
);

-- 4. Durable Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type TEXT NOT NULL,           -- 'admin' | 'customer'
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_revoked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_role TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',        -- 'order' | 'system' | 'security' | 'user'
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 6. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'general' | 'contact' | 'branding'
  key TEXT NOT NULL,                -- e.g. 'admin_email', 'accent_color'
  value TEXT,
  updated_by INTEGER REFERENCES staff_users(id),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(category, key)
);

-- 7. Settings Audit Log Table
CREATE TABLE IF NOT EXISTS settings_audit_log (
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

-- Seed Default Roles
INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'Super Admin');
INSERT OR IGNORE INTO roles (id, name) VALUES (2, 'Manager');
INSERT OR IGNORE INTO roles (id, name) VALUES (3, 'Support Staff');

-- Seed Role Permissions (3 roles x 8 modules)
-- Super Admin (Full access to all 8 modules)
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Products', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Orders', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Customers', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Shipping', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Reviews', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'CMS', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Users & Roles', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (1, 'Settings', 1, 1, 1, 1);

-- Manager
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Products', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Orders', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Customers', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Shipping', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Reviews', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'CMS', 1, 1, 1, 1);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Users & Roles', 1, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (2, 'Settings', 1, 0, 0, 0);

-- Support Staff
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Products', 1, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Orders', 1, 0, 1, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Customers', 1, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Shipping', 1, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Reviews', 1, 0, 1, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'CMS', 0, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Users & Roles', 0, 0, 0, 0);
INSERT OR IGNORE INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete) VALUES (3, 'Settings', 0, 0, 0, 0);

-- Seed Default Super Admin in staff_users (Password: AdminPassword123!)
-- Hash of 'AdminPassword123!' + 'tharanitex_staff_salt'
INSERT OR IGNORE INTO staff_users (id, name, email, password_hash, role_id, status)
VALUES (1, 'Super Admin', 'admin@tharanitex.com', '4b2a2960bfa43e995308d6d7121b4eb38d6951d6e0551fbbbbbfc2e1e0eccf9e', 1, 'Active');

-- Initial Notification
INSERT OR IGNORE INTO notifications (id, recipient_role, title, message, type)
VALUES (1, 'Super Admin', 'System Initialized', 'Tharani Textiles Authentication & Permission system initialized successfully.', 'system');
