import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const cards = db.prepare('SELECT * FROM gift_cards ORDER BY id DESC').all();
  return NextResponse.json({ success: true, giftCards: cards });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { code, balance, recipientEmail } = await req.json();

    const finalCode = code ? code.toUpperCase().trim() : `RUN-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO gift_cards (code, initial_balance, current_balance, recipient_email, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(finalCode, Number(balance), Number(balance), recipientEmail || null);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
