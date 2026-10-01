import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  const appointments = db.prepare('SELECT * FROM appointments ORDER BY id DESC').all();
  return NextResponse.json({ success: true, appointments });
}

export async function PUT(req: NextRequest) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: 'Neoprávněný přístup' }, { status: 401 });

  try {
    const { id, status } = await req.json();
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
