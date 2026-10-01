import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  const rawOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];
  const orders = rawOrders.map((o) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, items };
  });

  return NextResponse.json({ success: true, orders });
}

export async function PUT(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });
  }

  try {
    const { id, orderStatus, paymentStatus, carrier, trackingNumber, trackingLink, internalNotes } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Chybí ID objednávky' }, { status: 400 });
    }

    db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        carrier = COALESCE(?, carrier),
        tracking_number = COALESCE(?, tracking_number),
        tracking_link = COALESCE(?, tracking_link),
        internal_notes = COALESCE(?, internal_notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(orderStatus, paymentStatus, carrier, trackingNumber, trackingLink, internalNotes, id);

    return NextResponse.json({ success: true, message: 'Objednávka byla aktualizována.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
