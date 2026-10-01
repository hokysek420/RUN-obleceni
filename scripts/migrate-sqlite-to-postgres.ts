import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

const prisma = new PrismaClient();
const dbPath = path.join(process.cwd(), 'data', 'run.db');
const sqlite = new Database(dbPath);

async function main() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in environment or .env');
    console.error('Please configure your PostgreSQL connection string in .env:');
    console.error('DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"');
    process.exit(1);
  }

  // 1. Admin Users
  const adminUsers = sqlite.prepare('SELECT * FROM admin_users').all() as any[];
  console.log(`Migrating ${adminUsers.length} admin users...`);
  for (const admin of adminUsers) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        id: admin.id,
        email: admin.email,
        password_hash: admin.password_hash,
        name: admin.name,
        role: admin.role,
        created_at: new Date(admin.created_at || Date.now()),
      },
    });
  }

  // 2. Categories
  const categories = sqlite.prepare('SELECT * FROM categories').all() as any[];
  console.log(`Migrating ${categories.length} categories...`);
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
      },
    });
  }

  // 3. Collections
  const collections = sqlite.prepare('SELECT * FROM collections').all() as any[];
  console.log(`Migrating ${collections.length} collections...`);
  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: {
        id: col.id,
        name: col.name,
        slug: col.slug,
        badge: col.badge,
        description: col.description,
        hero_image: col.hero_image,
      },
    });
  }

  // 4. Products & Variants
  const products = sqlite.prepare('SELECT * FROM products').all() as any[];
  console.log(`Migrating ${products.length} products...`);
  for (const prod of products) {
    const existing = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category,
        price: prod.price,
        sale_price: prod.sale_price,
        currency: prod.currency || 'CZK',
        sku: prod.sku,
        status: prod.status || 'SKLADEM',
        is_featured: prod.is_featured || 0,
        is_new_drop: prod.is_new_drop || 0,
        release_date: prod.release_date,
        expected_shipping: prod.expected_shipping,
        preorder_info: prod.preorder_info,
        description: prod.description,
        material: prod.material,
        grammage: prod.grammage,
        fit: prod.fit,
        care_instructions: prod.care_instructions,
        warranty: prod.warranty,
        certificate_id: prod.certificate_id,
        primary_image: prod.primary_image,
        gallery: prod.gallery,
        video_url: prod.video_url,
        model_3d_url: prod.model_3d_url,
        created_at: new Date(prod.created_at || Date.now()),
        updated_at: new Date(prod.updated_at || Date.now()),
      },
    });

    const variants = sqlite.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(prod.id) as any[];
    for (const v of variants) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: { sku: v.sku },
      });
      if (!existingVariant) {
        await prisma.productVariant.create({
          data: {
            id: v.id,
            product_id: existing.id,
            size: v.size,
            color: v.color,
            sku: v.sku,
            stock: v.stock,
            reserved_stock: v.reserved_stock || 0,
          },
        });
      }
    }
  }

  // 5. Discount Codes
  const discountCodes = sqlite.prepare('SELECT * FROM discount_codes').all() as any[];
  console.log(`Migrating ${discountCodes.length} discount codes...`);
  for (const d of discountCodes) {
    await prisma.discountCode.upsert({
      where: { code: d.code },
      update: {},
      create: {
        id: d.id,
        code: d.code,
        type: d.type,
        value: d.value,
        min_order: d.min_order,
        max_uses: d.max_uses,
        times_used: d.times_used,
        expires_at: d.expires_at,
        is_active: d.is_active,
      },
    });
  }

  // 6. Gift Cards
  const giftCards = sqlite.prepare('SELECT * FROM gift_cards').all() as any[];
  console.log(`Migrating ${giftCards.length} gift cards...`);
  for (const g of giftCards) {
    await prisma.giftCard.upsert({
      where: { code: g.code },
      update: {},
      create: {
        id: g.id,
        code: g.code,
        initial_balance: g.initial_balance,
        current_balance: g.current_balance,
        currency: g.currency || 'CZK',
        recipient_email: g.recipient_email,
        is_active: g.is_active,
        created_at: new Date(g.created_at || Date.now()),
      },
    });
  }

  // 7. Reviews
  const reviews = sqlite.prepare('SELECT * FROM reviews').all() as any[];
  console.log(`Migrating ${reviews.length} reviews...`);
  for (const r of reviews) {
    await prisma.review.create({
      data: {
        id: r.id,
        product_id: r.product_id,
        customer_name: r.customer_name,
        customer_email: r.customer_email,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        photo_url: r.photo_url,
        verified_purchase: r.verified_purchase,
        status: r.status,
        created_at: new Date(r.created_at || Date.now()),
      },
    });
  }

  // 8. Community Gallery
  const community = sqlite.prepare('SELECT * FROM community_gallery').all() as any[];
  console.log(`Migrating ${community.length} community posts...`);
  for (const c of community) {
    await prisma.communityGallery.create({
      data: {
        id: c.id,
        author_name: c.author_name,
        author_handle: c.author_handle,
        image_url: c.image_url,
        caption: c.caption,
        product_tagged: c.product_tagged,
        status: c.status,
        created_at: new Date(c.created_at || Date.now()),
      },
    });
  }

  // 9. Website Content
  const websiteContent = sqlite.prepare('SELECT * FROM website_content').all() as any[];
  console.log(`Migrating ${websiteContent.length} website content keys...`);
  for (const wc of websiteContent) {
    await prisma.websiteContent.upsert({
      where: { key: wc.key },
      update: { value: wc.value },
      create: {
        key: wc.key,
        value: wc.value,
        updated_at: new Date(wc.updated_at || Date.now()),
      },
    });
  }

  // 10. Store Settings
  const storeSettings = sqlite.prepare('SELECT * FROM store_settings').all() as any[];
  console.log(`Migrating ${storeSettings.length} store settings keys...`);
  for (const ss of storeSettings) {
    await prisma.storeSetting.upsert({
      where: { key: ss.key },
      update: { value: ss.value },
      create: {
        key: ss.key,
        value: ss.value,
        updated_at: new Date(ss.updated_at || Date.now()),
      },
    });
  }

  // 11. Users (if any)
  const users = sqlite.prepare('SELECT * FROM users').all() as any[];
  if (users.length > 0) {
    console.log(`Migrating ${users.length} users...`);
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          password_hash: u.password_hash,
          first_name: u.first_name,
          last_name: u.last_name,
          phone: u.phone,
          street: u.street,
          city: u.city,
          zip: u.zip,
          country: u.country,
          created_at: new Date(u.created_at || Date.now()),
          updated_at: new Date(u.updated_at || Date.now()),
        },
      });
    }
  }

  // 12. Orders & Order Items (if any)
  const orders = sqlite.prepare('SELECT * FROM orders').all() as any[];
  if (orders.length > 0) {
    console.log(`Migrating ${orders.length} orders...`);
    for (const o of orders) {
      await prisma.order.upsert({
        where: { order_number: o.order_number },
        update: {},
        create: {
          id: o.id,
          order_number: o.order_number,
          user_id: o.user_id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          customer_phone: o.customer_phone,
          shipping_street: o.shipping_street,
          shipping_city: o.shipping_city,
          shipping_zip: o.shipping_zip,
          shipping_country: o.shipping_country,
          billing_street: o.billing_street,
          billing_city: o.billing_city,
          billing_zip: o.billing_zip,
          billing_country: o.billing_country,
          delivery_method: o.delivery_method,
          delivery_pickup_point: o.delivery_pickup_point,
          shipping_price: o.shipping_price,
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          order_status: o.order_status,
          carrier: o.carrier,
          tracking_number: o.tracking_number,
          tracking_link: o.tracking_link,
          discount_code: o.discount_code,
          discount_amount: o.discount_amount,
          gift_card_code: o.gift_card_code,
          gift_card_amount: o.gift_card_amount,
          subtotal: o.subtotal,
          total: o.total,
          internal_notes: o.internal_notes,
          created_at: new Date(o.created_at || Date.now()),
          updated_at: new Date(o.updated_at || Date.now()),
        },
      });

      const items = sqlite.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as any[];
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            id: item.id,
            order_id: o.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            size: item.size,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          },
        });
      }
    }
  }

  console.log('✅ SQLite data successfully migrated to PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
