import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (q) {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(sku) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (category) {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id ASC LIMIT ?';
    params.push(limit);

    const rawProducts = db.prepare(query).all(...params) as any[];

    const products: Product[] = rawProducts.map((p) => {
      let gallery = [];
      try {
        gallery = JSON.parse(p.gallery);
      } catch {
        gallery = [p.primary_image];
      }
      const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id) as any[];
      return {
        ...p,
        gallery,
        variants,
      };
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Chyba při načítání produktů' }, { status: 500 });
  }
}
