PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_initial_schema.sql','2026-07-31 17:09:40');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_seed_data.sql','2026-07-31 18:39:25');
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "categories" ("id","name","slug","description","image_url","is_active","created_at") VALUES(1,'Silk Sarees','silk-sarees',NULL,'/assets/categories/silk.jpg',1,'2026-07-31 18:39:25');
INSERT INTO "categories" ("id","name","slug","description","image_url","is_active","created_at") VALUES(2,'Cotton Sarees','cotton-sarees',NULL,'/assets/categories/cotton.jpg',1,'2026-07-31 18:39:25');
INSERT INTO "categories" ("id","name","slug","description","image_url","is_active","created_at") VALUES(3,'Wedding Collection','wedding',NULL,'/assets/categories/wedding.jpg',1,'2026-07-31 18:39:25');
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    compare_price REAL,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    material TEXT,
    color TEXT,
    occasion TEXT,
    featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);
INSERT INTO "products" ("id","category_id","name","slug","description","price","compare_price","stock","sku","material","color","occasion","featured","is_active","created_at") VALUES(1,1,'Banarasi Silk Saree','banarasi-silk-saree','Premium Banarasi Silk Saree',2999,NULL,20,NULL,NULL,NULL,NULL,1,1,'2026-07-31 18:39:25');
INSERT INTO "products" ("id","category_id","name","slug","description","price","compare_price","stock","sku","material","color","occasion","featured","is_active","created_at") VALUES(2,1,'Kanchipuram Silk Saree','kanchipuram-silk-saree','Traditional Kanchipuram Silk Saree',4599,NULL,15,NULL,NULL,NULL,NULL,1,1,'2026-07-31 18:39:25');
INSERT INTO "products" ("id","category_id","name","slug","description","price","compare_price","stock","sku","material","color","occasion","featured","is_active","created_at") VALUES(3,2,'Chettinad Cotton Saree','chettinad-cotton-saree','Pure Cotton Saree',1799,NULL,25,NULL,NULL,NULL,NULL,1,1,'2026-07-31 18:39:25');
INSERT INTO "products" ("id","category_id","name","slug","description","price","compare_price","stock","sku","material","color","occasion","featured","is_active","created_at") VALUES(4,3,'Bridal Designer Saree','bridal-designer-saree','Wedding Collection',6999,NULL,8,NULL,NULL,NULL,NULL,1,1,'2026-07-31 18:39:25');
CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id)
);
INSERT INTO "product_images" ("id","product_id","image_url","sort_order") VALUES(1,1,'/assets/sarees/thirubuvanam.png',0);
INSERT INTO "product_images" ("id","product_id","image_url","sort_order") VALUES(2,2,'/assets/sarees/kanchipuram.png',0);
INSERT INTO "product_images" ("id","product_id","image_url","sort_order") VALUES(3,3,'/assets/sarees/banaras1.png',0);
INSERT INTO "product_images" ("id","product_id","image_url","sort_order") VALUES(4,4,'/assets/sarees/banaras2.png',0);
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
CREATE TABLE addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'placed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(address_id) REFERENCES addresses(id)
);
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',3);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('products',4);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('product_images',4);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
