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

    // Trigger Supabase Auth sign up for email verification if configured
    let supabaseNeedsVerification = false;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseKey) {
        const origin = req.nextUrl.origin;
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = createClient();
        const { data: supaData, error: supaError } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
            emailRedirectTo: `${origin}/auth/confirm?next=/account`,
          },
        });
        if (supaError) {
          console.error('Supabase auth.signUp error:', supaError.message, supaError.status);
        } else {
          console.log('User synced to Supabase Auth:', supaData?.user?.id);
        }

        // Also sync profile to Supabase public.users table
        const { error: dbError } = await supabase.from('users').insert({
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone || null,
          street: street || null,
          city: city || null,
          zip: zip || null,
          country: country || 'Česká republika',
        });
        if (dbError) {
          console.error('Supabase public.users insert notice:', dbError.message);
        } else {
          console.log('User synced to Supabase public.users table');
        }
      }
    } catch (supaErr) {
      console.warn('Supabase auth signup trigger notice:', supaErr);
    }

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    const res = NextResponse.json({ success: true, user });
    res.cookies.set('run_customer_token', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při registraci' }, { status: 500 });
  }
}
