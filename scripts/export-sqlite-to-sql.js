const fs = require('fs');
const path = require('path');
const Database = require('../src/lib/sqlite-bridge');

const dbPath = path.join(__dirname, '..', 'data', 'run.db');
const db = new Database(dbPath);

const outputPath = path.join(__dirname, 'setup-postgres.sql');

let sql = `-- ========================================================
-- RUN CLOTHING BRAND — PRODUCTION POSTGRESQL SCHEMA & SEED
-- Compatible with Supabase, Neon, AWS RDS, Railway, Vercel Postgres
-- ========================================================

-- Enable UUID extension if needed in future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    sale_price INTEGER,
    currency TEXT DEFAULT 'CZK',
    sku TEXT NOT NULL,
    status TEXT DEFAULT 'SKLADEM',
    is_featured INTEGER DEFAULT 0,
    is_new_drop INTEGER DEFAULT 0,
    release_date TEXT,
    expected_shipping TEXT,
    preorder_info TEXT,
    description TEXT NOT NULL,
    material TEXT NOT NULL,
    grammage TEXT NOT NULL,
    fit TEXT NOT NULL,
    care_instructions TEXT NOT NULL,
    warranty TEXT NOT NULL,
    certificate_id TEXT,
    primary_image TEXT NOT NULL,
    gallery TEXT NOT NULL,
    video_url TEXT,
    model_3d_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    sku TEXT NOT NULL,
    stock INTEGER DEFAULT 10,
    reserved_stock INTEGER DEFAULT 0
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT
);

-- 4. Collections Table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    badge TEXT,
    description TEXT,
    hero_image TEXT
);

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    street TEXT,
    city TEXT,
    zip TEXT,
    country TEXT DEFAULT 'Česká republika',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_zip TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    billing_street TEXT,
    billing_city TEXT,
    billing_zip TEXT,
    billing_country TEXT,
    delivery_method TEXT NOT NULL,
    delivery_pickup_point TEXT,
    shipping_price INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Čeká na platbu',
    order_status TEXT NOT NULL DEFAULT 'Přijato',
    carrier TEXT,
    tracking_number TEXT,
    tracking_link TEXT,
    discount_code TEXT,
    discount_amount INTEGER DEFAULT 0,
    gift_card_code TEXT,
    gift_card_amount INTEGER DEFAULT 0,
    subtotal INTEGER NOT NULL,
    total INTEGER NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total INTEGER NOT NULL
);

-- 9. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    photo_url TEXT,
    verified_purchase INTEGER DEFAULT 1,
    status TEXT DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Returns & Reclamations Table
CREATE TABLE IF NOT EXISTS returns_and_reclamations (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_urls TEXT,
    bank_account TEXT,
    status TEXT DEFAULT 'Čeká na posouzení',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'PERCENT',
    value INTEGER NOT NULL,
    min_order INTEGER DEFAULT 0,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    expires_at TEXT,
    is_active INTEGER DEFAULT 1
);

-- 13. Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    initial_balance INTEGER NOT NULL,
    current_balance INTEGER NOT NULL,
    currency TEXT DEFAULT 'CZK',
    recipient_email TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Community Gallery Table
CREATE TABLE IF NOT EXISTS community_gallery (
    id SERIAL PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_handle TEXT,
    image_url TEXT NOT NULL,
    caption TEXT,
    product_tagged TEXT,
    status TEXT DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    consent_given INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    size INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Website Content Table
CREATE TABLE IF NOT EXISTS website_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- ========================================================
-- SEED DATA INSERTION
-- ========================================================

`;

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return `'${val.replace(/'/g, "''")}'`;
  }
  return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
}

const tablesToExport = [
  'admin_users',
  'categories',
  'collections',
  'products',
  'product_variants',
  'discount_codes',
  'gift_cards',
  'reviews',
  'community_gallery',
  'website_content',
  'store_settings'
];

for (const tableName of tablesToExport) {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  if (rows.length > 0) {
    sql += `\n-- Seed ${tableName} (${rows.length} records)\n`;
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map(c => escapeSql(row[c]));
      sql += `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
    // Update serial sequence if needed
    if (tableName !== 'website_content' && tableName !== 'store_settings') {
      sql += `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) + 1 FROM ${tableName}), 1), false);\n`;
    }
  }
}

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated ${outputPath} successfully (${sql.length} bytes)`);
