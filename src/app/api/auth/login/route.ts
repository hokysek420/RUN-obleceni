import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, signCustomerToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Zadejte e-mail a heslo.' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return NextResponse.json({ error: 'Nesprávný e-mail nebo heslo.' }, { status: 401 });
    }

    const valid = comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Nesprávný e-mail nebo heslo.' }, { status: 401 });
    }

    const token = signCustomerToken({
      userId: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    });

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      street: user.street,
      city: user.city,
      zip: user.zip,
      country: user.country,
    };

    const res = NextResponse.json({ success: true, user: sanitizedUser });
    res.cookies.set('run_customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při přihlášení' }, { status: 500 });
  }
}
