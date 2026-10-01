import React from 'react';
import db from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';
import { Product, Order } from '@/types';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  const session = getCustomerSession();

  let userOrders: any[] = [];
  let userReturns: any[] = [];

  if (session) {
    userOrders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC
    `).all(session.userId, session.email) as any[];

    // Fetch items for each order
    userOrders = userOrders.map((ord) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(ord.id);
      return { ...ord, items };
    });

    userReturns = db.prepare(`
      SELECT * FROM returns_and_reclamations WHERE customer_email = ? ORDER BY id DESC
    `).all(session.email) as any[];
  }

  // Fetch all products for wishlist
  const rawProducts = db.prepare('SELECT * FROM products').all() as any[];
  const allProducts: Product[] = rawProducts.map((p) => {
    let gallery = [];
    try {
      gallery = JSON.parse(p.gallery);
    } catch {
      gallery = [p.primary_image];
    }
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id) as any[];
    return { ...p, gallery, variants };
  });

  return (
    <AccountClient
      userOrders={userOrders}
      userReturns={userReturns}
      allProducts={allProducts}
    />
  );
}
