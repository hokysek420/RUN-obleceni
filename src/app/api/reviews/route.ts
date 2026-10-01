import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId, customerName, customerEmail, rating, title, comment } = await req.json();

    if (!productId || !customerName || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Vyplňte prosím všechna pole recenze.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, 1, 'APPROVED')
    `).run(
      productId,
      customerName.trim(),
      customerEmail ? customerEmail.trim() : null,
      Math.min(5, Math.max(1, Number(rating))),
      title.trim(),
      comment.trim()
    );

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Recenze byla úspěšně přidána.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při ukládání recenze' }, { status: 500 });
  }
}
