import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const discounts = db.prepare('SELECT * FROM discount_codes ORDER BY id DESC').all();
  return NextResponse.json({ success: true, discounts });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = await req.json();

    if (!code || !value) {
      return NextResponse.json({ error: 'Vyplňte kód a hodnotu slevy.' }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO discount_codes (code, type, value, min_order, max_uses, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      code.toUpperCase().trim(),
      type || 'PERCENT',
      Number(value),
      Number(minOrder) || 0,
      maxUses ? Number(maxUses) : null,
      expiresAt || null
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    db.prepare('DELETE FROM discount_codes WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
