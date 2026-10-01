import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCustomerSession, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Nejste přihlášen(a).' }, { status: 401 });
    }

    const { firstName, lastName, phone, street, city, zip, country, currentPassword, newPassword } = await req.json();

    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(session.userId) as any;
    if (!currentUser) {
      return NextResponse.json({ error: 'Uživatel nenalezen.' }, { status: 404 });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Pro změnu hesla zadejte stávající heslo.' }, { status: 400 });
      }
      if (!comparePassword(currentPassword, currentUser.password_hash)) {
        return NextResponse.json({ error: 'Stávající heslo není správné.' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Nové heslo musí mít alespoň 6 znaků.' }, { status: 400 });
      }

      const newHash = hashPassword(newPassword);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, session.userId);
    }

    // Update details
    db.prepare(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, street = ?, city = ?, zip = ?, country = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      firstName || currentUser.first_name,
      lastName || currentUser.last_name,
      phone || currentUser.phone,
      street || currentUser.street,
      city || currentUser.city,
      zip || currentUser.zip,
      country || currentUser.country,
      session.userId
    );

    return NextResponse.json({ success: true, message: 'Údaje byly úspěšně aktualizovány.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Chyba při aktualizaci' }, { status: 500 });
  }
}
