import React from 'react';
import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { Product, Review } from '@/types';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const p = db.prepare('SELECT * FROM products WHERE slug = ?').get(params.slug) as any;

  if (!p) {
    notFound();
  }

  let gallery = [];
  try {
    gallery = JSON.parse(p.gallery);
  } catch {
    gallery = [p.primary_image];
  }

  const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id) as any[];

  const product: Product = {
    ...p,
    gallery,
    variants,
  };

  // Fetch approved reviews
  const reviews = db.prepare("SELECT * FROM reviews WHERE product_id = ? AND status = 'APPROVED' ORDER BY id DESC").all(p.id) as Review[];

  // Fetch related products (same category or others, excluding current)
  const rawRelated = db.prepare('SELECT * FROM products WHERE id != ? LIMIT 4').all(p.id) as any[];
  const relatedProducts: Product[] = rawRelated.map((rp) => {
    let g = [];
    try {
      g = JSON.parse(rp.gallery);
    } catch {
      g = [rp.primary_image];
    }
    const v = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(rp.id) as any[];
    return { ...rp, gallery: g, variants: v };
  });

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews}
      relatedProducts={relatedProducts}
    />
  );
}
