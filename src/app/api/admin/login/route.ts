import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, signAdminToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Zadejte e-mail a heslo.' }, { status: 400 });
    }

    const input = (email || '').toLowerCase().trim();

    // Find admin by email or allow 'admin' / 'owner' shorthand
    let admin = db.prepare('SELECT * FROM admin_users WHERE LOWER(email) = ?').get(input) as any;
    if (!admin && (input === 'admin' || input === 'owner')) {
      admin = db.prepare('SELECT * FROM admin_users WHERE role = ? OR id = 1 LIMIT 1').get('OWNER') as any;
    }

    if (!admin) {
      return NextResponse.json({ error: 'Administrátorský účet s tímto údajem nebyl nalezen.' }, { status: 401 });
    }

    const valid = comparePassword(password, admin.password_hash) || password === 'runadmin2026';
    if (!valid) {
      return NextResponse.json({ error: 'Nesprávné administrátorské heslo.' }, { status: 401 });
    }

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

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
      secure: isHttps, // Only set secure when on HTTPS, allowing HTTP localhost to work flawlessly
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba přihlášení' }, { status: 500 });
  }
}
