import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import db from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';
import { Product, Order, Review, CommunityPhoto, DiscountCode, GiftCard, Appointment } from '@/types';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const session = getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  // 1. Products
  const rawProducts = db.prepare('SELECT * FROM products ORDER BY id DESC').all() as any[];
  const initialProducts: Product[] = rawProducts.map((p) => {
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

  // 2. Orders with items
  const rawOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];
  const initialOrders: (Order & { items: any[] })[] = rawOrders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as any[];
    return {
      ...o,
      items,
    };
  });

  // 3. Reviews
  const initialReviews = db.prepare('SELECT * FROM reviews ORDER BY id DESC').all() as Review[];

  // 4. Community Gallery
  const initialCommunity = db.prepare('SELECT * FROM community_gallery ORDER BY id DESC').all() as CommunityPhoto[];

  // 5. Discounts
  const initialDiscounts = db.prepare('SELECT * FROM discount_codes ORDER BY id DESC').all() as DiscountCode[];

  // 6. Gift Cards
  const initialGiftCards = db.prepare('SELECT * FROM gift_cards ORDER BY id DESC').all() as GiftCard[];

  // 7. Appointments
  const initialAppointments = db.prepare('SELECT * FROM appointments ORDER BY id DESC').all() as Appointment[];

  // 8. Users (excluding password hash)
  const initialUsers = db.prepare('SELECT id, email, first_name, last_name, phone, street, city, zip, country, created_at FROM users ORDER BY id DESC').all() as any[];

  // 9. Admin Users (excluding password hash)
  const initialAdminUsers = db.prepare('SELECT id, email, name, role, created_at FROM admin_users ORDER BY id DESC').all() as any[];

  // 10. Website Content
  const rawContent = db.prepare('SELECT key, value FROM website_content').all() as any[];
  const initialContent: Record<string, any> = {};
  for (const row of rawContent) {
    try {
      initialContent[row.key] = JSON.parse(row.value);
    } catch {
      initialContent[row.key] = row.value;
    }
  }

  // 11. Settings
  const rawSettings = db.prepare('SELECT key, value FROM store_settings').all() as any[];
  const initialSettings: Record<string, any> = {};
  for (const row of rawSettings) {
    try {
      initialSettings[row.key] = JSON.parse(row.value);
    } catch {
      initialSettings[row.key] = row.value;
    }
  }

  const adminUser = {
    id: session.adminId,
    email: session.email,
    name: session.name,
    role: session.role,
  };

  return (
    <AdminDashboardClient
      initialProducts={initialProducts}
      initialOrders={initialOrders}
      initialReviews={initialReviews}
      initialCommunity={initialCommunity}
      initialDiscounts={initialDiscounts}
      initialGiftCards={initialGiftCards}
      initialAppointments={initialAppointments}
      initialUsers={initialUsers}
      initialAdminUsers={initialAdminUsers}
      initialContent={initialContent}
      initialSettings={initialSettings}
      adminUser={adminUser}
    />
  );
}
