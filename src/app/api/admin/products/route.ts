import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  const rawProducts = db.prepare('SELECT * FROM products ORDER BY id DESC').all() as any[];
  const products = rawProducts.map((p) => {
    let gallery = [];
    try {
      gallery = JSON.parse(p.gallery);
    } catch {
      gallery = [p.primary_image];
    }
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id);
    return { ...p, gallery, variants };
  });

  return NextResponse.json({ success: true, products });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      name,
      slug,
      category,
      price,
      salePrice,
      sku,
      status,
      isFeatured,
      isNewDrop,
      releaseDate,
      expectedShipping,
      preorderInfo,
      description,
      material,
      grammage,
      fit,
      careInstructions,
      warranty,
      certificateId,
      primaryImage,
      gallery,
      variants,
    } = data;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Vyplňte název, cenu a kategorii.' }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const insert = db.prepare(`
      INSERT INTO products (
        name, slug, category, price, sale_price, sku, status, is_featured, is_new_drop,
        release_date, expected_shipping, preorder_info,
        description, material, grammage, fit, care_instructions, warranty, certificate_id,
        primary_image, gallery
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      finalSlug,
      category,
      price,
      salePrice || null,
      sku || `RUN-${Date.now().toString().slice(-4)}`,
      status || 'SKLADEM',
      isFeatured ? 1 : 0,
      isNewDrop ? 1 : 0,
      releaseDate || null,
      expectedShipping || null,
      preorderInfo || null,
      description || '',
      material || '',
      grammage || '',
      fit || '',
      careInstructions || '',
      warranty || '',
      certificateId || null,
      primaryImage || '/images/products/teddy-black-front.jpg',
      gallery ? JSON.stringify(gallery) : JSON.stringify([primaryImage || '/images/products/teddy-black-front.jpg'])
    );

    const productId = result.lastInsertRowid;

    // Insert variants
    if (variants && Array.isArray(variants)) {
      const insVar = db.prepare(`
        INSERT INTO product_variants (product_id, size, color, sku, stock)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const v of variants) {
        insVar.run(productId, v.size, v.color || 'Standard', v.sku || `${sku}-${v.size}`, v.stock || 10);
      }
    }

    return NextResponse.json({ success: true, productId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při tvorbě produktu' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const {
      id,
      name,
      slug,
      category,
      price,
      salePrice,
      sku,
      status,
      isFeatured,
      isNewDrop,
      releaseDate,
      expectedShipping,
      preorderInfo,
      description,
      material,
      grammage,
      fit,
      careInstructions,
      warranty,
      certificateId,
      primaryImage,
      gallery,
      variants,
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'Chybí ID produktu' }, { status: 400 });
    }

    db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, category = ?, price = ?, sale_price = ?, sku = ?, status = ?,
        is_featured = ?, is_new_drop = ?, release_date = ?, expected_shipping = ?, preorder_info = ?,
        description = ?, material = ?, grammage = ?, fit = ?, care_instructions = ?, warranty = ?, certificate_id = ?,
        primary_image = ?, gallery = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      slug,
      category,
      price,
      salePrice || null,
      sku,
      status,
      isFeatured ? 1 : 0,
      isNewDrop ? 1 : 0,
      releaseDate || null,
      expectedShipping || null,
      preorderInfo || null,
      description,
      material,
      grammage,
      fit,
      careInstructions,
      warranty,
      certificateId || null,
      primaryImage,
      gallery ? JSON.stringify(gallery) : JSON.stringify([primaryImage]),
      id
    );

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          db.prepare('UPDATE product_variants SET stock = ?, size = ?, color = ? WHERE id = ?').run(
            v.stock,
            v.size,
            v.color,
            v.id
          );
        } else {
          db.prepare(
            'INSERT INTO product_variants (product_id, size, color, sku, stock) VALUES (?, ?, ?, ?, ?)'
          ).run(id, v.size, v.color, v.sku || `${sku}-${v.size}`, v.stock);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Produkt byl aktualizován.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při aktualizaci' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Chybí ID' }, { status: 400 });

    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Produkt byl smazán.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
