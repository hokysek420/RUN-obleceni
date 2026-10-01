import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const rows = db.prepare('SELECT key, value FROM store_settings').all() as any[];
  const settings: Record<string, any> = {};
  rows.forEach((r) => {
    try {
      settings[r.key] = JSON.parse(r.value);
    } catch {
      settings[r.key] = r.value;
    }
  });

  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session || session.role === 'CONTENT_MANAGER') {
    return NextResponse.json({ error: 'Nemáte oprávnění měnit nastavení obchodu' }, { status: 403 });
  }

  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: 'Chybí klíč' }, { status: 400 });

    const strValue = typeof value === 'string' ? value : JSON.stringify(value);

    db.prepare(`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, strValue);

    return NextResponse.json({ success: true, message: 'Nastavení uloženo.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
