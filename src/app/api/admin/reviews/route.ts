import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    ORDER BY r.id DESC
  `).all();

  return NextResponse.json({ success: true, reviews });
}

export async function PUT(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { id, status } = await req.json();
    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
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
    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
