import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const rows = db.prepare('SELECT key, value FROM website_content').all() as any[];
  const content: Record<string, any> = {};
  rows.forEach((r) => {
    try {
      content[r.key] = JSON.parse(r.value);
    } catch {
      content[r.key] = r.value;
    }
  });

  return NextResponse.json({ success: true, content });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: 'Chybí klíč' }, { status: 400 });

    const strValue = typeof value === 'string' ? value : JSON.stringify(value);

    db.prepare(`
      INSERT INTO website_content (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, strValue);

    return NextResponse.json({ success: true, message: 'Obsah byl úspěšně uložen.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
