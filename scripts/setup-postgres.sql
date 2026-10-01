-- ========================================================
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


-- Seed admin_users (1 records)
INSERT INTO admin_users (id, email, password_hash, name, role, created_at) VALUES (1, 'admin@runclothing.com', '$2a$10$Kjus8BcprfXb3Cg.67Z2F.MBp3sc7hJ.2BeaM3aq3.0CcsYAK74Ge', 'RUN Director', 'OWNER', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('admin_users', 'id'), COALESCE((SELECT MAX(id) + 1 FROM admin_users), 1), false);

-- Seed categories (4 records)
INSERT INTO categories (id, name, slug, description, image) VALUES (1, 'Outerwear & Mikiny', 'outerwear', 'Těžké teddy fleece a brushed fleece mikiny.', '/images/products/teddy-black-front.jpg') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, name, slug, description, image) VALUES (2, 'T-Shirts & Topy', 't-shirts', 'Boxy streetwear trička z vysokogramážní bavlny.', '/images/products/tshirt-white-front.jpg') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, name, slug, description, image) VALUES (3, 'Pants & Kalhoty', 'pants', 'Baggy denimové džíny a těžké tepláky.', '/images/products/denim-black-front.jpg') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, name, slug, description, image) VALUES (4, 'Footwear & Boty', 'footwear', 'Futuristická obuv s chromovými akcenty a tlumením.', '/images/products/sneaker-cyber-white-1.jpg') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) + 1 FROM categories), 1), false);

-- Seed collections (1 records)
INSERT INTO collections (id, name, slug, badge, description, hero_image) VALUES (1, 'RUN INTO ZERO — DROP 01', 'run-into-zero', 'DROP 01 / COLLECTION ONE', 'První oficiální kolekce značky RUN definující novou éru moderního českého streetwearu. 3 materiály, jeden pohyb, nekompromisní estetika.', '/images/editorial/campaign-hero-models.jpg') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('collections', 'id'), COALESCE((SELECT MAX(id) + 1 FROM collections), 1), false);

-- Seed products (7 records)
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (1, 'RUN Reversible Heavy Teddy Fur Zip Hoodie — Black / White', 'run-reversible-heavy-teddy-fur-zip-hoodie-black', 'Outerwear', 3890, NULL, 'CZK', 'RUN-HD-FUR-BLK', 'LIMITOVANÁ EDICE', 1, 1, NULL, NULL, NULL, 'Prémiová oboustranná mikina z těžkého faux-fur teddy fleecu s vysokou hustotou vlákna. Na přední straně precizní 3D vyšívaný scribble RUN logo patch, na zádech masivní signaturní aplikace "YOU''LL NEVER DO IT. YOU HAVE NOTHING." s motivem kříže RUN. Vybaveno zakázkovým gravírovaným celokovovým zipem RUN a silnými stahovacími šňůrami s kovovými koncovkami.', '100% Heavy Faux-Fur Teddy Fleece / Reversible Brushed Lined Interior', '550 GSM', 'Boxy Oversized Streetwear Fit s padlými rameny a pevnými žebrovanými lemy', 'Prát naruby na jemný program (30°C). Nesušit v sušičce. Nežehlit přímo přes kožešinu ani výšivku.', 'Doživotní záruka na pevnost švů a zipové kování RUN Hardware.', 'RUN-CERT-DROP1-0892', '/images/products/teddy-black-front.jpg', '["/images/products/teddy-black-front.jpg","/images/products/teddy-black-back.jpg","/images/details/teddy-fur-macro-zipper.jpg","/images/details/teddy-black-logo-embroidery.jpg","/images/details/teddy-black-back-print.jpg","/images/details/teddy-black-metal-strings.jpg","/images/editorial/editorial-couple-front.jpg","/images/editorial/editorial-couple-back.jpg"]', '/media/run-campaign-motion.mp4', NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (2, 'RUN Reversible Heavy Teddy Fur Zip Hoodie — Bone Cream', 'run-reversible-heavy-teddy-fur-zip-hoodie-cream', 'Outerwear', 3890, NULL, 'CZK', 'RUN-HD-FUR-CRM', 'SKLADEM', 1, 1, NULL, NULL, NULL, 'Světlé provedení v odstínu Bone Cream. Ultra hustý oboustranný teddy fleece s kontrastní černou podšívkou. Hrudní stříbrno-černá 3D výšivka, zadní statement grafika. Maximální tepelný komfort pro chladné dny v městském prostředí.', '100% Heavy Faux-Fur Teddy Fleece / Contrast Lined Interior', '550 GSM', 'Boxy Oversized Fit', 'Prát odděleně na jemný program 30°C. Nežehlit.', 'Plná záruka 24 měsíců + záruka originality RUN.', 'RUN-CERT-DROP1-0893', '/images/products/teddy-cream-front.jpg', '["/images/products/teddy-cream-front.jpg","/images/products/teddy-cream-back.jpg","/images/details/teddy-cream-logo-embroidery.jpg","/images/details/teddy-cream-back-print.jpg","/images/details/teddy-cream-metal-strings.jpg","/images/editorial/editorial-couple-front.jpg"]', '/media/run-campaign-motion.mp4', NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (3, 'RUN Cyber-Chunky Air Sneaker — Pure Chrome Edition', 'run-cyber-chunky-air-sneaker-chrome', 'Footwear', 4490, NULL, 'CZK', 'RUN-SNK-CHROME-01', 'LIMITOVANÁ EDICE', 1, 1, NULL, NULL, NULL, 'Futuristická masivní silueta propojující prémiovou useň, prodyšný technický ripstop a leštěné chromové zpevňující elementy. Mezipodešev s viditelnou vzduchovou tlumicí jednotkou RUN AIR UNIT zaručuje bezkonkurenční odpružení. Kovový 3D emblém RUN na boku a gravírovaný kovový dubrae na šněrování.', 'Full-Grain Leather, Technical Ballistic Mesh, High-Gloss Chrome TPU, Rubber Outsole', 'Heavyweight 680g / shoe', 'True to Size / Ergonomic Comfort Arch', 'Čistit speciální pěnou na kůži. Chránit chromové části před agresivními chemikáliemi.', 'Záruka 24 měsíců na konstrukční celistvost a tlumicí polštář.', 'RUN-SNK-LTD-0042', '/images/products/sneaker-cyber-white-1.jpg', '["/images/products/sneaker-cyber-white-1.jpg","/images/details/sneaker-chrome-logo.jpg","/images/details/sneaker-lace-tag.jpg"]', NULL, NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (4, 'RUN Washed Heavy Denim Baggy Jeans — Charcoal Black', 'run-washed-heavy-denim-baggy-jeans-charcoal', 'Pants', 2990, NULL, 'CZK', 'RUN-JNS-BAG-BLK', 'SKLADEM', 1, 1, NULL, NULL, NULL, 'Těžké denimové kalhoty v autentickém sepraném odstínu Vintage Charcoal. Radikálně široký baggy střih, který skvěle padá přes masivní tenisky. Zesílené kapsy s decentní výšivkou RUN na přední kapse a zadním sedle. Masivní gravírovaný RUN kovový knoflík a nýty.', '100% Ring-Spun Cotton Heavyweight Denim', '14.5 oz (approx. 490 GSM)', 'Extra Wide Baggy Silhouette with stacking ankle opening', 'Prát naruby ve studené vodě (30°C). Sušit volně zavěšené.', 'Záruka kvality RUN Denim Standard.', NULL, '/images/products/denim-black-front.jpg', '["/images/products/denim-black-front.jpg","/images/products/denim-black-back.jpg","/images/editorial/model-black-denim.jpg","/images/details/denim-pocket-logo.jpg","/images/details/denim-branded-metal-button.jpg","/images/details/denim-wash-texture.jpg"]', '/media/run-campaign-motion.mp4', NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (5, 'RUN Heavy Cotton Baggy Sweatpants — Heather Grey', 'run-heavy-cotton-baggy-sweatpants-grey', 'Pants', 2490, NULL, 'CZK', 'RUN-SWP-BAG-GRY', 'SKLADEM', 1, 0, NULL, NULL, NULL, 'Tepláky z extrémně hutného bavlněného úpletu. Široké nohavice s čistým spodním lemem pro volný splývavý efekt. Elastický pas s prodlouženými stahovacími šňůrami z bavlny s kovovými koncovkami. Zadní výpustková kapsa a minimalistická 3D výšivka RUN.', '100% Combed French Terry Heavyweight Cotton', '450 GSM', 'Relaxed Baggy Streetwear Cut', 'Prát na 30°C s podobnými barvami. Nesušit v sušičce.', 'Záruka kvality bavlněného úpletu proti žmolkování.', NULL, '/images/products/sweatpants-grey-front.jpg', '["/images/products/sweatpants-grey-front.jpg","/images/products/sweatpants-grey-back.jpg","/images/editorial/model-grey-sweatpants.jpg","/images/details/sweatpants-logo-embroidery.jpg","/images/details/sweatpants-waistband-drawstrings.jpg","/images/details/sweatpants-heavy-cotton-texture.jpg"]', NULL, NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (6, 'RUN "YOU HAVE NOTHING" Heavyweight Boxy T-Shirt — White', 'run-you-have-nothing-heavyweight-boxy-tshirt-white', 'T-Shirts', 1490, NULL, 'CZK', 'RUN-TEE-NOTH-WHT', 'SKLADEM', 1, 1, NULL, NULL, NULL, 'Ikonické tričko z česané bio bavlny s vysokou gramáží. Drop-shoulder boxy střih s pevným límcem (1.25" rib collar). Na hrudi sharp RUN scribble logo, na zádech signaturní sítotisk vysoké hustoty: "YOU''LL NEVER DO IT. YOU HAVE NOTHING." s křížem RUN. Vnitřní tkaný label RUN.', '100% Organic Heavyweight Combed Cotton Jersey', '280 GSM', 'Boxy Drop-Shoulder Relaxed Fit', 'Prát naruby na 30°C. Žehlit naruby.', 'Záruka stálosti tisku a tvaru úpletu.', NULL, '/images/products/tshirt-white-front.jpg', '["/images/products/tshirt-white-front.jpg","/images/products/tshirt-white-back.jpg","/images/details/tshirt-chest-logo.jpg","/images/details/tshirt-back-statement-print.jpg","/images/details/tshirt-neck-label.jpg"]', NULL, NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO products (id, name, slug, category, price, sale_price, currency, sku, status, is_featured, is_new_drop, release_date, expected_shipping, preorder_info, description, material, grammage, fit, care_instructions, warranty, certificate_id, primary_image, gallery, video_url, model_3d_url, created_at, updated_at) VALUES (7, 'RUN Minimalist Heavyweight Zip Hoodie — Clean White', 'run-minimalist-heavyweight-zip-hoodie-white', 'Outerwear', 3290, NULL, 'CZK', 'RUN-HD-ZIP-WHT', 'PŘEDOBJEDNÁVKA', 1, 1, '25. 10. 2026', 'Začátek listopadu 2026', 'Limitovaná várka předobjednávek pro první vlnu členů RUN klubu. Garance přednostního odeslání s dárkovým packagingem a certifikátem.', 'Čistá bílá mikina s masivním kovovým zipem, ostrým grafickým logem RUN na hrudi a výrazným logem přes celá záda. Dvojitá konstrukce kapuce pro perfektní držení tvaru.', '100% Heavy Brushed Fleece Cotton', '460 GSM', 'Oversized Athletic Boxy Fit', 'Prát na 30°C naruby se světlým prádlem.', 'Záruka kvality 24 měsíců.', 'RUN-CERT-WHT-0120', '/images/products/white-zip-hoodie-front.jpg', '["/images/products/white-zip-hoodie-front.jpg","/images/products/white-zip-hoodie-back.jpg","/images/products/white-zip-hoodie-duo.jpg"]', NULL, NULL, '2026-10-01 14:33:14', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) + 1 FROM products), 1), false);

-- Seed product_variants (32 records)
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (1, 1, 'S', 'Black / White Inner', 'RUN-HD-FUR-BLK-S', 15, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (2, 1, 'M', 'Black / White Inner', 'RUN-HD-FUR-BLK-M', 15, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (3, 1, 'L', 'Black / White Inner', 'RUN-HD-FUR-BLK-L', 13, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (4, 1, 'XL', 'Black / White Inner', 'RUN-HD-FUR-BLK-XL', 15, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (5, 2, 'S', 'Bone Cream', 'RUN-HD-FUR-CRM-S', 12, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (6, 2, 'M', 'Bone Cream', 'RUN-HD-FUR-CRM-M', 12, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (7, 2, 'L', 'Bone Cream', 'RUN-HD-FUR-CRM-L', 12, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (8, 2, 'XL', 'Bone Cream', 'RUN-HD-FUR-CRM-XL', 12, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (9, 3, '40', 'Pure White / Chrome', 'RUN-SNK-CHROME-40', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (10, 3, '41', 'Pure White / Chrome', 'RUN-SNK-CHROME-41', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (11, 3, '42', 'Pure White / Chrome', 'RUN-SNK-CHROME-42', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (12, 3, '43', 'Pure White / Chrome', 'RUN-SNK-CHROME-43', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (13, 3, '44', 'Pure White / Chrome', 'RUN-SNK-CHROME-44', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (14, 3, '45', 'Pure White / Chrome', 'RUN-SNK-CHROME-45', 8, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (15, 4, '28/32', 'Washed Charcoal Black', 'RUN-JNS-BAG-BLK-28-32', 14, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (16, 4, '30/32', 'Washed Charcoal Black', 'RUN-JNS-BAG-BLK-30-32', 14, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (17, 4, '32/32', 'Washed Charcoal Black', 'RUN-JNS-BAG-BLK-32-32', 14, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (18, 4, '34/32', 'Washed Charcoal Black', 'RUN-JNS-BAG-BLK-34-32', 14, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (19, 4, '36/32', 'Washed Charcoal Black', 'RUN-JNS-BAG-BLK-36-32', 14, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (20, 5, 'S', 'Heather Grey', 'RUN-SWP-BAG-GRY-S', 18, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (21, 5, 'M', 'Heather Grey', 'RUN-SWP-BAG-GRY-M', 18, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (22, 5, 'L', 'Heather Grey', 'RUN-SWP-BAG-GRY-L', 18, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (23, 5, 'XL', 'Heather Grey', 'RUN-SWP-BAG-GRY-XL', 18, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (24, 6, 'S', 'Pure White', 'RUN-TEE-NOTH-WHT-S', 25, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (25, 6, 'M', 'Pure White', 'RUN-TEE-NOTH-WHT-M', 25, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (26, 6, 'L', 'Pure White', 'RUN-TEE-NOTH-WHT-L', 25, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (27, 6, 'XL', 'Pure White', 'RUN-TEE-NOTH-WHT-XL', 25, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (28, 6, 'XXL', 'Pure White', 'RUN-TEE-NOTH-WHT-XXL', 25, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (29, 7, 'S', 'Clean White', 'RUN-HD-ZIP-WHT-S', 10, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (30, 7, 'M', 'Clean White', 'RUN-HD-ZIP-WHT-M', 10, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (31, 7, 'L', 'Clean White', 'RUN-HD-ZIP-WHT-L', 10, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, product_id, size, color, sku, stock, reserved_stock) VALUES (32, 7, 'XL', 'Clean White', 'RUN-HD-ZIP-WHT-XL', 10, 0) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('product_variants', 'id'), COALESCE((SELECT MAX(id) + 1 FROM product_variants), 1), false);

-- Seed discount_codes (2 records)
INSERT INTO discount_codes (id, code, type, value, min_order, max_uses, times_used, expires_at, is_active) VALUES (1, 'RUN10', 'PERCENT', 10, 1000, 100, 1, NULL, 1) ON CONFLICT DO NOTHING;
INSERT INTO discount_codes (id, code, type, value, min_order, max_uses, times_used, expires_at, is_active) VALUES (2, 'FIRSTDROP', 'FIXED', 300, 2000, 50, 0, NULL, 1) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('discount_codes', 'id'), COALESCE((SELECT MAX(id) + 1 FROM discount_codes), 1), false);

-- Seed gift_cards (1 records)
INSERT INTO gift_cards (id, code, initial_balance, current_balance, currency, recipient_email, is_active, created_at) VALUES (1, 'RUN-GIFT-1000-VIP', 1000, 1000, 'CZK', NULL, 1, '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('gift_cards', 'id'), COALESCE((SELECT MAX(id) + 1 FROM gift_cards), 1), false);

-- Seed reviews (3 records)
INSERT INTO reviews (id, product_id, customer_name, customer_email, rating, title, comment, photo_url, verified_purchase, status, created_at) VALUES (1, 1, 'Viktor H.', 'viktor@example.cz', 5, 'Brutální kvalita a váha', 'Ta mikina je neskutečná. 550 GSM kožešina je těžká, hřeje jak bunda a ten kovovej zip RUN má skvělej zvuk. Oboustrannost je boží.', NULL, 1, 'APPROVED', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO reviews (id, product_id, customer_name, customer_email, rating, title, comment, photo_url, verified_purchase, status, created_at) VALUES (2, 4, 'Jakub M.', 'jakub@example.cz', 5, 'Perfektní baggy střih', 'Nejlepší džíny co jsem letos koupil. Sedí přes boty přesně jak na fotkách z lookbooku.', NULL, 1, 'APPROVED', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO reviews (id, product_id, customer_name, customer_email, rating, title, comment, photo_url, verified_purchase, status, created_at) VALUES (3, 1, 'David K.', 'david.k@example.cz', 5, 'Neskutečná gramáž a detaily zipu', 'Teddy fleece mikina je naživo ještě brutálnější než na fotkách. Váha 550 GSM je znát hned jak ji vezmete do ruky. Reverzibilní strana funguje skvěle.', NULL, 1, 'APPROVED', '2026-10-01 15:02:15') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) + 1 FROM reviews), 1), false);

-- Seed community_gallery (2 records)
INSERT INTO community_gallery (id, author_name, author_handle, image_url, caption, product_tagged, status, created_at) VALUES (1, 'Marek', '@marek_run', '/images/editorial/campaign-hero-models.jpg', 'Street drop v ulicích Prahy. RUN or nothing.', 'RUN Reversible Heavy Teddy Fur Zip Hoodie', 'APPROVED', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO community_gallery (id, author_name, author_handle, image_url, caption, product_tagged, status, created_at) VALUES (2, 'Klára', '@klara_urban', '/images/editorial/editorial-couple-front.jpg', 'More than clothes. It is a mindset.', 'RUN Reversible Heavy Teddy Fur Zip Hoodie — Bone Cream', 'APPROVED', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('community_gallery', 'id'), COALESCE((SELECT MAX(id) + 1 FROM community_gallery), 1), false);

-- Seed website_content (5 records)
INSERT INTO website_content (key, value, updated_at) VALUES ('hero', '{"tagline":"DROP 01 / NOW LIVE","headline":"MOVE DIFFERENT.","subheadline":"MORE THAN CLOTHES. IT’S A MINDSET.","ctaText":"PROZKOUMAT KOLEKCI","ctaLink":"/shop","bgImage":"/images/editorial/campaign-hero-models.jpg"}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO website_content (key, value, updated_at) VALUES ('announcement', '{"text":"DROP 01: RUN INTO ZERO JE NYNÍ DOSTUPNÝ — DOPRAVA ZDARMA NAD 2 500 KČ / 100 €","enabled":true,"link":"/shop"}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO website_content (key, value, updated_at) VALUES ('editorial', '{"title":"RUN THE CITY.","subtitle":"3 MATERIÁLY ∞ JEDEN POHYB","paragraph":"RUN vznikl z potřeby vytvořit oděvy s nekompromisní vahou, prémiovou architekturou detailů a provokativním manifestem. Každý kus z kolekce Drop 01 je vyroben z pečlivě selektovaných materiálů o gramáži až 550 GSM.","image":"/images/editorial/editorial-couple-back.jpg","quote":"„YOU’LL NEVER DO IT. YOU HAVE NOTHING.“"}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO website_content (key, value, updated_at) VALUES ('brandStory', '{"title":"MANIFEST ZNAČKY RUN","statement":"RUN není jen oblečení pro běh. Je to symbol nezastavitelného posunu vpřed. Odmítáme rychlou módu a laciné trendy. Tvoříme těžké siluety, zakázkové kovové detaily a střihy, které definují charakter člověka, jenž je nosí."}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO website_content (key, value, updated_at) VALUES ('faq', '[{"q":"Kdy obdržím svou objednávku?","a":"Objednávky produktů skladem expedujeme do 24 hodin prostřednictvím Zásilkovny nebo kurýrní služby DPD/GLS. Doručení v ČR trvá standardně 1-2 pracovní dny."},{"q":"Jak fungují předobjednávky (PŘEDOBJEDNÁVKA)?","a":"U produktů ve stavu Předobjednávka je vždy uveden konkrétní termín expedice. Vaše platba zajistí rezervaci kusu z limitované výrobní várky. O postupu výroby vás informujeme e-mailem."},{"q":"Lze zboží vrátit nebo vyměnit velikost?","a":"Ano, máte plných 14 dní na vrácení nenošeného zboží v původním stavu. Vrácení můžete zahájit přímo v sekci Vrácení zboží na našem webu."},{"q":"Jak se starat o Teddy Fur mikiny?","a":"Doporučujeme prát naruby na jemný cyklus při 30°C s minimálními otáčkami a nepoužívat sušičku. Pro zachování nadýchanosti fleece vlákna stačí mikinu po vyprání jemně protřepat."}]', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;

-- Seed store_settings (6 records)
INSERT INTO store_settings (key, value, updated_at) VALUES ('store', '{"name":"RUN Clothing","email":"info@runclothing.com","phone":"+420 777 000 RUN","address":"","companyId":"19842026","vatId":"CZ19842026"}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO store_settings (key, value, updated_at) VALUES ('currency', '{"primary":"CZK","secondary":"EUR","eurRate":25}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO store_settings (key, value, updated_at) VALUES ('shipping', '{"zasilkovnaPrice":79,"courierPrice":119,"pickupPrice":0,"freeThreshold":2500}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO store_settings (key, value, updated_at) VALUES ('payments', '{"bankName":"Fio banka a.s.","accountNumber":"2100894562/2010","iban":"CZ4520100000002100894562","swift":"FIOBCZPPXXX","codFee":49,"stripeEnabled":true}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO store_settings (key, value, updated_at) VALUES ('social', '{"instagram":"https://instagram.com/run.clothing","tiktok":"https://tiktok.com/@runclothing"}', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
INSERT INTO store_settings (key, value, updated_at) VALUES ('watermarkEnabled', 'false', '2026-10-01 14:33:14') ON CONFLICT DO NOTHING;
