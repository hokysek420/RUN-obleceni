import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Zadejte e-mail a heslo.' }, { status: 400 });
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!admin) {
      return NextResponse.json({ error: 'Neplatné administrátorské přihlašovací údaje.' }, { status: 401 });
    }

    const valid = comparePassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Neplatné administrátorské přihlašovací údaje.' }, { status: 401 });
    }

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const res = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    res.cookies.set('run_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba přihlášení' }, { status: 500 });
  }
}
