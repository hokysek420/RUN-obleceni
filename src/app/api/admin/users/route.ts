import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAdminSession, hashPassword } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session || session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Pouze OWNER může spravovat administrátory' }, { status: 403 });
  }

  const users = db.prepare('SELECT id, email, name, role, created_at FROM admin_users ORDER BY id ASC').all();
  return NextResponse.json({ success: true, adminUsers: users });
}

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session || session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Pouze OWNER může vytvářet administrátory' }, { status: 403 });
  }

  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Vyplňte všechna pole.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'Uživatel s tímto e-mailem již existuje.' }, { status: 400 });
    }

    const hash = hashPassword(password);
    db.prepare(`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email.toLowerCase().trim(), hash, name.trim(), role);

    return NextResponse.json({ success: true, message: 'Administrátor vytvořen.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session || session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Pouze OWNER může mazat administrátory' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (Number(id) === session.adminId) {
      return NextResponse.json({ error: 'Nemůžete smazat svůj vlastní účet.' }, { status: 400 });
    }

    db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
