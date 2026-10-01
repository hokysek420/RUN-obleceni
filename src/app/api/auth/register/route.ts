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

    // Sync to Supabase Auth & public.users table
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && secretKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl, secretKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        // 1. Create in Supabase Auth (confirmed without sending email)
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { data: supaAuth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase().trim(),
            password,
            email_confirm: true,
            user_metadata: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
          });
          if (authErr) {
            console.warn('Supabase auth.admin.createUser warning:', authErr.message);
          } else {
            console.log('User created in Supabase Auth:', supaAuth?.user?.id);
          }
        }

        // 2. Insert into public.users table (bypasses RLS)
        const { error: dbError } = await supabaseAdmin.from('users').upsert({
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone || null,
          street: street || null,
          city: city || null,
          zip: zip || null,
          country: country || 'Česká republika',
        }, { onConflict: 'email' });

        if (dbError) {
          console.error('Supabase public.users insert error:', dbError.message);
        } else {
          console.log('User synced to Supabase public.users table successfully');
        }
      }
    } catch (supaErr) {
      console.warn('Supabase sync notice:', supaErr);
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
