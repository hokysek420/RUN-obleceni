import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'run.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      currency TEXT DEFAULT 'CZK',
      sku TEXT NOT NULL,
      status TEXT DEFAULT 'SKLADEM', -- SKLADEM, PŘEDOBJEDNÁVKA, VYPRODÁNO, LIMITOVANÁ EDICE
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
      gallery TEXT NOT NULL, -- JSON array
      video_url TEXT,
      model_3d_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      size TEXT NOT NULL,
      color TEXT NOT NULL,
      sku TEXT NOT NULL,
      stock INTEGER DEFAULT 10,
      reserved_stock INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      badge TEXT,
      description TEXT,
      hero_image TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      street TEXT,
      city TEXT,
      zip TEXT,
      country TEXT DEFAULT 'Česká republika',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN', -- OWNER, ADMIN, CONTENT_MANAGER
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      payment_status TEXT NOT NULL DEFAULT 'Čeká na platbu', -- Čeká na platbu, Zaplaceno, Vráceno
      order_status TEXT NOT NULL DEFAULT 'Přijato', -- Přijato, Zaplaceno, Zpracovává se, Odesláno, Doručeno, Stornováno, Vráceno
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      photo_url TEXT,
      verified_purchase INTEGER DEFAULT 1,
      status TEXT DEFAULT 'APPROVED', -- APPROVED, PENDING, REJECTED
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS returns_and_reclamations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- RETURN, RECLAMATION
      order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      product_name TEXT NOT NULL,
      reason TEXT NOT NULL,
      description TEXT NOT NULL,
      photo_urls TEXT, -- JSON array
      bank_account TEXT,
      status TEXT DEFAULT 'Čeká na posouzení',
      admin_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discount_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'PERCENT', -- PERCENT, FIXED
      value INTEGER NOT NULL,
      min_order INTEGER DEFAULT 0,
      max_uses INTEGER,
      times_used INTEGER DEFAULT 0,
      expires_at TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS gift_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      initial_balance INTEGER NOT NULL,
      current_balance INTEGER NOT NULL,
      currency TEXT DEFAULT 'CZK',
      recipient_email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      author_handle TEXT,
      image_url TEXT NOT NULL,
      caption TEXT,
      product_tagged TEXT,
      status TEXT DEFAULT 'APPROVED',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      consent_given INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'image',
      size INTEGER DEFAULT 0,
      alt_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS website_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if admin user exists
  const existingAdmin = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('runadmin2026', salt);
    db.prepare(`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin@runclothing.com', hash, 'RUN Director', 'OWNER');
    console.log('Seeded default owner: admin@runclothing.com');
  }

  // Check if products exist
  const existingProduct = db.prepare('SELECT id FROM products LIMIT 1').get();
  if (!existingProduct) {
    console.log('Seeding official RUN products and brand data...');

    // 1. Teddy Fleece Hoodie (Black & Cream & Grey colorways)
    const p1 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Reversible Heavy Teddy Fur Zip Hoodie — Black / White',
      'run-reversible-heavy-teddy-fur-zip-hoodie-black',
      'Outerwear',
      3890,
      null,
      'RUN-HD-FUR-BLK',
      'LIMITOVANÁ EDICE',
      1,
      1,
      'Prémiová oboustranná mikina z těžkého faux-fur teddy fleecu s vysokou hustotou vlákna. Na přední straně precizní 3D vyšívaný scribble RUN logo patch, na zádech masivní signaturní aplikace "YOU\'LL NEVER DO IT. YOU HAVE NOTHING." s motivem kříže RUN. Vybaveno zakázkovým gravírovaným celokovovým zipem RUN a silnými stahovacími šňůrami s kovovými koncovkami.',
      '100% Heavy Faux-Fur Teddy Fleece / Reversible Brushed Lined Interior',
      '550 GSM',
      'Boxy Oversized Streetwear Fit s padlými rameny a pevnými žebrovanými lemy',
      'Prát naruby na jemný program (30°C). Nesušit v sušičce. Nežehlit přímo přes kožešinu ani výšivku.',
      'Doživotní záruka na pevnost švů a zipové kování RUN Hardware.',
      'RUN-CERT-DROP1-0892',
      '/images/products/teddy-black-front.jpg',
      JSON.stringify([
        '/images/products/teddy-black-front.jpg',
        '/images/products/teddy-black-back.jpg',
        '/images/details/teddy-fur-macro-zipper.jpg',
        '/images/details/teddy-black-logo-embroidery.jpg',
        '/images/details/teddy-black-back-print.jpg',
        '/images/details/teddy-black-metal-strings.jpg',
        '/images/editorial/editorial-couple-front.jpg',
        '/images/editorial/editorial-couple-back.jpg'
      ])
    );

    // Variants for p1
    ['S', 'M', 'L', 'XL'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p1.lastInsertRowid, size, 'Black / White Inner', `RUN-HD-FUR-BLK-${size}`, 15);
    });

    // 2. Teddy Fleece Hoodie (Off-White / Cream)
    const p2 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Reversible Heavy Teddy Fur Zip Hoodie — Bone Cream',
      'run-reversible-heavy-teddy-fur-zip-hoodie-cream',
      'Outerwear',
      3890,
      null,
      'RUN-HD-FUR-CRM',
      'SKLADEM',
      1,
      1,
      'Světlé provedení v odstínu Bone Cream. Ultra hustý oboustranný teddy fleece s kontrastní černou podšívkou. Hrudní stříbrno-černá 3D výšivka, zadní statement grafika. Maximální tepelný komfort pro chladné dny v městském prostředí.',
      '100% Heavy Faux-Fur Teddy Fleece / Contrast Lined Interior',
      '550 GSM',
      'Boxy Oversized Fit',
      'Prát odděleně na jemný program 30°C. Nežehlit.',
      'Plná záruka 24 měsíců + záruka originality RUN.',
      'RUN-CERT-DROP1-0893',
      '/images/products/teddy-cream-front.jpg',
      JSON.stringify([
        '/images/products/teddy-cream-front.jpg',
        '/images/products/teddy-cream-back.jpg',
        '/images/details/teddy-cream-logo-embroidery.jpg',
        '/images/details/teddy-cream-back-print.jpg',
        '/images/details/teddy-cream-metal-strings.jpg',
        '/images/editorial/editorial-couple-front.jpg'
      ])
    );

    ['S', 'M', 'L', 'XL'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p2.lastInsertRowid, size, 'Bone Cream', `RUN-HD-FUR-CRM-${size}`, 12);
    });

    // 3. Cyber Chunky Sneaker
    const p3 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Cyber-Chunky Air Sneaker — Pure Chrome Edition',
      'run-cyber-chunky-air-sneaker-chrome',
      'Footwear',
      4490,
      null,
      'RUN-SNK-CHROME-01',
      'LIMITOVANÁ EDICE',
      1,
      1,
      'Futuristická masivní silueta propojující prémiovou useň, prodyšný technický ripstop a leštěné chromové zpevňující elementy. Mezipodešev s viditelnou vzduchovou tlumicí jednotkou RUN AIR UNIT zaručuje bezkonkurenční odpružení. Kovový 3D emblém RUN na boku a gravírovaný kovový dubrae na šněrování.',
      'Full-Grain Leather, Technical Ballistic Mesh, High-Gloss Chrome TPU, Rubber Outsole',
      'Heavyweight 680g / shoe',
      'True to Size / Ergonomic Comfort Arch',
      'Čistit speciální pěnou na kůži. Chránit chromové části před agresivními chemikáliemi.',
      'Záruka 24 měsíců na konstrukční celistvost a tlumicí polštář.',
      'RUN-SNK-LTD-0042',
      '/images/products/sneaker-cyber-white-1.jpg',
      JSON.stringify([
        '/images/products/sneaker-cyber-white-1.jpg',
        '/images/details/sneaker-chrome-logo.jpg',
        '/images/details/sneaker-lace-tag.jpg'
      ])
    );

    ['40', '41', '42', '43', '44', '45'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p3.lastInsertRowid, size, 'Pure White / Chrome', `RUN-SNK-CHROME-${size}`, 8);
    });

    // 4. Washed Black Denim Baggy Jeans
    const p4 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Washed Heavy Denim Baggy Jeans — Charcoal Black',
      'run-washed-heavy-denim-baggy-jeans-charcoal',
      'Pants',
      2990,
      null,
      'RUN-JNS-BAG-BLK',
      'SKLADEM',
      1,
      1,
      'Těžké denimové kalhoty v autentickém sepraném odstínu Vintage Charcoal. Radikálně široký baggy střih, který skvěle padá přes masivní tenisky. Zesílené kapsy s decentní výšivkou RUN na přední kapse a zadním sedle. Masivní gravírovaný RUN kovový knoflík a nýty.',
      '100% Ring-Spun Cotton Heavyweight Denim',
      '14.5 oz (approx. 490 GSM)',
      'Extra Wide Baggy Silhouette with stacking ankle opening',
      'Prát naruby ve studené vodě (30°C). Sušit volně zavěšené.',
      'Záruka kvality RUN Denim Standard.',
      null,
      '/images/products/denim-black-front.jpg',
      JSON.stringify([
        '/images/products/denim-black-front.jpg',
        '/images/products/denim-black-back.jpg',
        '/images/editorial/model-black-denim.jpg',
        '/images/details/denim-pocket-logo.jpg',
        '/images/details/denim-branded-metal-button.jpg',
        '/images/details/denim-wash-texture.jpg'
      ])
    );

    ['28/32', '30/32', '32/32', '34/32', '36/32'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p4.lastInsertRowid, size, 'Washed Charcoal Black', `RUN-JNS-BAG-BLK-${size.replace('/', '-')}`, 14);
    });

    // 5. Grey Heavy Cotton Baggy Sweatpants
    const p5 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Heavy Cotton Baggy Sweatpants — Heather Grey',
      'run-heavy-cotton-baggy-sweatpants-grey',
      'Pants',
      2490,
      null,
      'RUN-SWP-BAG-GRY',
      'SKLADEM',
      1,
      0,
      'Tepláky z extrémně hutného bavlněného úpletu. Široké nohavice s čistým spodním lemem pro volný splývavý efekt. Elastický pas s prodlouženými stahovacími šňůrami z bavlny s kovovými koncovkami. Zadní výpustková kapsa a minimalistická 3D výšivka RUN.',
      '100% Combed French Terry Heavyweight Cotton',
      '450 GSM',
      'Relaxed Baggy Streetwear Cut',
      'Prát na 30°C s podobnými barvami. Nesušit v sušičce.',
      'Záruka kvality bavlněného úpletu proti žmolkování.',
      null,
      '/images/products/sweatpants-grey-front.jpg',
      JSON.stringify([
        '/images/products/sweatpants-grey-front.jpg',
        '/images/products/sweatpants-grey-back.jpg',
        '/images/editorial/model-grey-sweatpants.jpg',
        '/images/details/sweatpants-logo-embroidery.jpg',
        '/images/details/sweatpants-waistband-drawstrings.jpg',
        '/images/details/sweatpants-heavy-cotton-texture.jpg'
      ])
    );

    ['S', 'M', 'L', 'XL'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p5.lastInsertRowid, size, 'Heather Grey', `RUN-SWP-BAG-GRY-${size}`, 18);
    });

    // 6. White Manifesto Boxy T-Shirt
    const p6 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN "YOU HAVE NOTHING" Heavyweight Boxy T-Shirt — White',
      'run-you-have-nothing-heavyweight-boxy-tshirt-white',
      'T-Shirts',
      1490,
      null,
      'RUN-TEE-NOTH-WHT',
      'SKLADEM',
      1,
      1,
      'Ikonické tričko z česané bio bavlny s vysokou gramáží. Drop-shoulder boxy střih s pevným límcem (1.25" rib collar). Na hrudi sharp RUN scribble logo, na zádech signaturní sítotisk vysoké hustoty: "YOU\'LL NEVER DO IT. YOU HAVE NOTHING." s křížem RUN. Vnitřní tkaný label RUN.',
      '100% Organic Heavyweight Combed Cotton Jersey',
      '280 GSM',
      'Boxy Drop-Shoulder Relaxed Fit',
      'Prát naruby na 30°C. Žehlit naruby.',
      'Záruka stálosti tisku a tvaru úpletu.',
      null,
      '/images/products/tshirt-white-front.jpg',
      JSON.stringify([
        '/images/products/tshirt-white-front.jpg',
        '/images/products/tshirt-white-back.jpg',
        '/images/details/tshirt-chest-logo.jpg',
        '/images/details/tshirt-back-statement-print.jpg',
        '/images/details/tshirt-neck-label.jpg'
      ])
    );

    ['S', 'M', 'L', 'XL', 'XXL'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p6.lastInsertRowid, size, 'Pure White', `RUN-TEE-NOTH-WHT-${size}`, 25);
    });

    // 7. White Minimalist Zip Hoodie
    const p7 = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        release_date, expected_shipping, preorder_info,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'RUN Minimalist Heavyweight Zip Hoodie — Clean White',
      'run-minimalist-heavyweight-zip-hoodie-white',
      'Outerwear',
      3290,
      null,
      'RUN-HD-ZIP-WHT',
      'PŘEDOBJEDNÁVKA',
      1,
      1,
      '25. 10. 2026',
      'Začátek listopadu 2026',
      'Limitovaná várka předobjednávek pro první vlnu členů RUN klubu. Garance přednostního odeslání s dárkovým packagingem a certifikátem.',
      'Čistá bílá mikina s masivním kovovým zipem, ostrým grafickým logem RUN na hrudi a výrazným logem přes celá záda. Dvojitá konstrukce kapuce pro perfektní držení tvaru.',
      '100% Heavy Brushed Fleece Cotton',
      '460 GSM',
      'Oversized Athletic Boxy Fit',
      'Prát na 30°C naruby se světlým prádlem.',
      'Záruka kvality 24 měsíců.',
      'RUN-CERT-WHT-0120',
      '/images/products/white-zip-hoodie-front.jpg',
      JSON.stringify([
        '/images/products/white-zip-hoodie-front.jpg',
        '/images/products/white-zip-hoodie-back.jpg',
        '/images/products/white-zip-hoodie-duo.jpg'
      ])
    );

    ['S', 'M', 'L', 'XL'].forEach(size => {
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `).run(p7.lastInsertRowid, size, 'Clean White', `RUN-HD-ZIP-WHT-${size}`, 10);
    });

    // Categories
    const categories = [
      { name: 'Outerwear & Mikiny', slug: 'outerwear', description: 'Těžké teddy fleece a brushed fleece mikiny.', image: '/images/products/teddy-black-front.jpg' },
      { name: 'T-Shirts & Topy', slug: 't-shirts', description: 'Boxy streetwear trička z vysokogramážní bavlny.', image: '/images/products/tshirt-white-front.jpg' },
      { name: 'Pants & Kalhoty', slug: 'pants', description: 'Baggy denimové džíny a těžké tepláky.', image: '/images/products/denim-black-front.jpg' },
      { name: 'Footwear & Boty', slug: 'footwear', description: 'Futuristická obuv s chromovými akcenty a tlumením.', image: '/images/products/sneaker-cyber-white-1.jpg' }
    ];

    categories.forEach(cat => {
      db.prepare(`
        INSERT INTO categories (name, slug, description, image)
        VALUES (?, ?, ?, ?)
      `).run(cat.name, cat.slug, cat.description, cat.image);
    });

    // Collections
    db.prepare(`
      INSERT INTO collections (name, slug, badge, description, hero_image)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'RUN INTO ZERO — DROP 01',
      'run-into-zero',
      'DROP 01 / COLLECTION ONE',
      'První oficiální kolekce značky RUN definující novou éru moderního českého streetwearu. 3 materiály, jeden pohyb, nekompromisní estetika.',
      '/images/editorial/campaign-hero-models.jpg'
    );

    // Initial Reviews
    db.prepare(`
      INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p1.lastInsertRowid,
      'Viktor H.',
      'viktor@example.cz',
      5,
      'Brutální kvalita a váha',
      'Ta mikina je neskutečná. 550 GSM kožešina je těžká, hřeje jak bunda a ten kovovej zip RUN má skvělej zvuk. Oboustrannost je boží.',
      1,
      'APPROVED'
    );

    db.prepare(`
      INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p4.lastInsertRowid,
      'Jakub M.',
      'jakub@example.cz',
      5,
      'Perfektní baggy střih',
      'Nejlepší džíny co jsem letos koupil. Sedí přes boty přesně jak na fotkách z lookbooku.',
      1,
      'APPROVED'
    );

    // Initial Discount Codes
    db.prepare(`
      INSERT INTO discount_codes (code, type, value, min_order, max_uses, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('RUN10', 'PERCENT', 10, 1000, 100, 1);

    db.prepare(`
      INSERT INTO discount_codes (code, type, value, min_order, max_uses, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('FIRSTDROP', 'FIXED', 300, 2000, 50, 1);

    // Initial Gift Cards
    db.prepare(`
      INSERT INTO gift_cards (code, initial_balance, current_balance, is_active)
      VALUES (?, ?, ?, ?)
    `).run('RUN-GIFT-1000-VIP', 1000, 1000, 1);

    // Initial Community photos
    db.prepare(`
      INSERT INTO community_gallery (author_name, author_handle, image_url, caption, product_tagged, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Marek',
      '@marek_run',
      '/images/editorial/campaign-hero-models.jpg',
      'Street drop v ulicích Prahy. RUN or nothing.',
      'RUN Reversible Heavy Teddy Fur Zip Hoodie',
      'APPROVED'
    );

    db.prepare(`
      INSERT INTO community_gallery (author_name, author_handle, image_url, caption, product_tagged, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Klára',
      '@klara_urban',
      '/images/editorial/editorial-couple-front.jpg',
      'More than clothes. It is a mindset.',
      'RUN Reversible Heavy Teddy Fur Zip Hoodie — Bone Cream',
      'APPROVED'
    );

    // Initial Website Content
    const defaultContent = {
      hero: {
        tagline: 'DROP 01 / NOW LIVE',
        headline: 'MOVE DIFFERENT.',
        subheadline: 'MORE THAN CLOTHES. IT’S A MINDSET.',
        ctaText: 'PROZKOUMAT KOLEKCI',
        ctaLink: '/shop',
        bgImage: '/images/editorial/campaign-hero-models.jpg'
      },
      announcement: {
        text: 'DROP 01: RUN INTO ZERO JE NYNÍ DOSTUPNÝ — DOPRAVA ZDARMA NAD 2 500 KČ / 100 €',
        enabled: true,
        link: '/shop'
      },
      editorial: {
        title: 'RUN THE CITY.',
        subtitle: '3 MATERIÁLY ∞ JEDEN POHYB',
        paragraph: 'RUN vznikl z potřeby vytvořit oděvy s nekompromisní vahou, prémiovou architekturou detailů a provokativním manifestem. Každý kus z kolekce Drop 01 je vyroben z pečlivě selektovaných materiálů o gramáži až 550 GSM.',
        image: '/images/editorial/editorial-couple-back.jpg',
        quote: '„YOU’LL NEVER DO IT. YOU HAVE NOTHING.“'
      },
      brandStory: {
        title: 'MANIFEST ZNAČKY RUN',
        statement: 'RUN není jen oblečení pro běh. Je to symbol nezastavitelného posunu vpřed. Odmítáme rychlou módu a laciné trendy. Tvoříme těžké siluety, zakázkové kovové detaily a střihy, které definují charakter člověka, jenž je nosí.'
      },
      faq: [
        { q: 'Kdy obdržím svou objednávku?', a: 'Objednávky produktů skladem expedujeme do 24 hodin prostřednictvím Zásilkovny nebo kurýrní služby DPD/GLS. Doručení v ČR trvá standardně 1-2 pracovní dny.' },
        { q: 'Jak fungují předobjednávky (PŘEDOBJEDNÁVKA)?', a: 'U produktů ve stavu Předobjednávka je vždy uveden konkrétní termín expedice. Vaše platba zajistí rezervaci kusu z limitované výrobní várky. O postupu výroby vás informujeme e-mailem.' },
        { q: 'Lze zboží vrátit nebo vyměnit velikost?', a: 'Ano, máte plných 14 dní na vrácení nenošeného zboží v původním stavu. Vrácení můžete zahájit přímo v sekci Vrácení zboží na našem webu.' },
        { q: 'Jak se starat o Teddy Fur mikiny?', a: 'Doporučujeme prát naruby na jemný cyklus při 30°C s minimálními otáčkami a nepoužívat sušičku. Pro zachování nadýchanosti fleece vlákna stačí mikinu po vyprání jemně protřepat.' }
      ]
    };

    for (const [key, val] of Object.entries(defaultContent)) {
      db.prepare(`
        INSERT INTO website_content (key, value)
        VALUES (?, ?)
      `).run(key, JSON.stringify(val));
    }

    // Store Settings
    const defaultSettings = {
      store: {
        name: 'RUN Clothing',
        email: 'info@runclothing.com',
        phone: '+420 777 000 RUN',
        address: 'RUN Showroom & Studio, Revoluční 12, 110 00 Praha 1, Česká republika',
        companyId: '19842026',
        vatId: 'CZ19842026'
      },
      currency: {
        primary: 'CZK',
        secondary: 'EUR',
        eurRate: 25.0
      },
      shipping: {
        zasilkovnaPrice: 79,
        courierPrice: 119,
        pickupPrice: 0,
        freeThreshold: 2500
      },
      payments: {
        bankName: 'Fio banka a.s.',
        accountNumber: '2100894562/2010',
        iban: 'CZ4520100000002100894562',
        swift: 'FIOBCZPPXXX',
        codFee: 49,
        stripeEnabled: true
      },
      social: {
        instagram: 'https://instagram.com/run.clothing',
        tiktok: 'https://tiktok.com/@runclothing'
      },
      watermarkEnabled: false
    };

    for (const [key, val] of Object.entries(defaultSettings)) {
      db.prepare(`
        INSERT INTO store_settings (key, value)
        VALUES (?, ?)
      `).run(key, JSON.stringify(val));
    }

    console.log('Database initialized and seeded successfully!');
  }
}

// Automatically initialize schema and seed on first import
try {
  initDatabase();
} catch (e) {
  console.error('Database initialization error:', e);
}

export default db;
