import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, signCustomerToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, street, city, zip, country } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Vyplňte prosím e-mail, heslo, jméno a příjmení.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Heslo musí mít minimálně 6 znaků.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'Účet s tímto e-mailem již existuje.' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, street, city, zip, country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      email.toLowerCase().trim(),
      passwordHash,
      firstName.trim(),
      lastName.trim(),
      phone || null,
      street || null,
      city || null,
      zip || null,
      country || 'Česká republika'
    );

    const user = {
      id: Number(result.lastInsertRowid),
      email: email.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone,
      street,
      city,
      zip,
      country,
    };

    const token = signCustomerToken({
      userId: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    });

    const res = NextResponse.json({ success: true, user });
    res.cookies.set('run_customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při registraci' }, { status: 500 });
  }
}
