-- Tharani Textiles Database Schema (Cloudflare D1 SQLite)

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer' or 'admin'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Products Table
CREATE TABLE IF NOT EXISTS Products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    fabric TEXT,
    color TEXT,
    image_url TEXT, -- Stores the R2 image key
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Addresses Table
CREATE TABLE IF NOT EXISTS Addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS Orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    address_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    total_amount REAL NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Addresses(id)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS Order_Items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    method TEXT NOT NULL, -- 'card', 'upi', 'cod', 'netbanking'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id TEXT UNIQUE,
    paid_at TEXT,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS Reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved'
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Wishlist Items Table
CREATE TABLE IF NOT EXISTS Wishlist_Items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS Cart_Items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Banners Table
CREATE TABLE IF NOT EXISTS Banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    image_key TEXT NOT NULL,
    link TEXT,
    created_at TEXT NOT NULL
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS Coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL, -- 'percentage' or 'flat'
    discount_value REAL NOT NULL,
    min_purchase REAL NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TEXT NOT NULL
);

-- Seed Initial Data

-- Seed default admin and customer
-- Admin Credentials: admin@tharanitex.com / admin123
-- Customer Credentials: customer@tharanitex.com / customer123
INSERT INTO Users (id, name, email, password, phone, role, created_at, updated_at) VALUES 
('usr_admin_1', 'Tharani Admin', 'admin@tharanitex.com', '$2a$10$tMhI2fDlmR/MevQvCeeXce3.x4v/m9jZ6o/52oUpeqM5o7dEreN8G', '9876543210', 'admin', '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z'),
('usr_cust_1', 'John Doe', 'customer@tharanitex.com', '$2a$10$VvR/iM0Q8W9F.aFkF5W5AeO8eU7w.9t8/w2g.2bO7B/qF3rQce8.m', '9876543211', 'customer', '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z')
ON CONFLICT(email) DO NOTHING;

-- Seed default categories
INSERT INTO Categories (id, name, description) VALUES
('cat_silk', 'Silk Sarees', 'Elegant premium silk sarees for weddings and special occasions.'),
('cat_cotton', 'Cotton Sarees', 'Comfortable and lightweight cotton sarees for daily wear.'),
('cat_designer', 'Designer Sarees', 'Modern designer sarees with contemporary patterns.')
ON CONFLICT(name) DO NOTHING;
