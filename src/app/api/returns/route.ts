import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const {
      type, // 'RETURN' or 'RECLAMATION'
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      reason,
      description,
      bankAccount,
      photoUrls,
    } = await req.json();

    if (!orderNumber || !customerEmail || !customerName || !productName || !reason) {
      return NextResponse.json({ error: 'Vyplňte prosím všechna povinná pole.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO returns_and_reclamations (
        type, order_number, customer_name, customer_email, customer_phone,
        product_name, reason, description, bank_account, photo_urls, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      type || 'RETURN',
      orderNumber.trim(),
      customerName.trim(),
      customerEmail.trim(),
      customerPhone || null,
      productName.trim(),
      reason.trim(),
      description ? description.trim() : '',
      bankAccount ? bankAccount.trim() : '',
      photoUrls ? JSON.stringify(photoUrls) : null,
      'Čeká na posouzení'
    );

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Žádost byla úspěšně přijata. Budeme vás kontaktovat e-mailem.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při ukládání' }, { status: 500 });
  }
}
