import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, type, date, time, notes } = await req.json();

    if (!name || !email || !date || !time || !type) {
      return NextResponse.json({ error: 'Vyplňte prosím všechna povinná pole.' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO appointments (customer_name, customer_email, customer_phone, type, date, time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `).run(name.trim(), email.trim(), phone ? phone.trim() : null, type, date, time, notes || null);

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Rezervace byla odeslána. Brzy vám potvrdíme termín e-mailem.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při rezervaci' }, { status: 500 });
  }
}
