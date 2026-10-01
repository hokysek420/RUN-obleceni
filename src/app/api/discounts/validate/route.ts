import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Zadejte slevový kód' }, { status: 400 });
    }

    const promo = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1').get(code.toUpperCase()) as any;

    if (!promo) {
      return NextResponse.json({ error: 'Slevový kód neexistuje nebo již vypršel.' }, { status: 404 });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Platnost tohoto slevového kódu již skončila.' }, { status: 400 });
    }

    if (promo.max_uses && promo.times_used >= promo.max_uses) {
      return NextResponse.json({ error: 'Tento slevový kód již dosáhl maximálního počtu použití.' }, { status: 400 });
    }

    if (promo.min_order && subtotal < promo.min_order) {
      return NextResponse.json(
        { error: `Minimální hodnota objednávky pro tento kód je ${promo.min_order} Kč.` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (promo.type === 'PERCENT') {
      discountAmount = Math.round((subtotal * promo.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, promo.value);
    }

    return NextResponse.json({
      success: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discountAmount,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba serveru' }, { status: 500 });
  }
}
