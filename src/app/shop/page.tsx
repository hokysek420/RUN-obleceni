import React from 'react';
import db from '@/lib/db';
import { Product } from '@/types';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default function ShopPage() {
  const rawProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all() as any[];

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

  return <ShopClient initialProducts={products} />;
}
