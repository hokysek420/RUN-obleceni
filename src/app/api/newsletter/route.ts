import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Zadejte platnou e-mailovou adresu.' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ success: true, message: 'Váš e-mail je již v seznamu odběratelů.' });
    }

    db.prepare('INSERT INTO newsletter_subscribers (email, consent_given) VALUES (?, 1)').run(
      email.toLowerCase().trim()
    );

    return NextResponse.json({
      success: true,
      message: 'Vítejte v RUN klubu. Přihlášení k odběru bylo úspěšné.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba serveru' }, { status: 500 });
  }
}
