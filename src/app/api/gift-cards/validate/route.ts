import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Zadejte kód dárkového poukazu' }, { status: 400 });
    }

    const card = db.prepare('SELECT * FROM gift_cards WHERE code = ? AND is_active = 1').get(code.toUpperCase()) as any;

    if (!card) {
      return NextResponse.json({ error: 'Dárkový poukaz nebyl nalezen nebo je neaktivní.' }, { status: 404 });
    }

    if (card.current_balance <= 0) {
      return NextResponse.json({ error: 'Zůstatek tohoto dárkového poukazu je 0 Kč.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      code: card.code,
      balance: card.current_balance,
      currency: card.currency,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba serveru' }, { status: 500 });
  }
}
