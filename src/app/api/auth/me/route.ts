import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCustomerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getCustomerSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, phone, street, city, zip, country, created_at
      FROM users WHERE id = ?
    `).get(session.userId) as any;

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
